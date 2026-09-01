import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type Role = "manager" | "admin" | "agent";

export type Session = {
  id: number;
  username: string;
  name: string;
  role: Role;
};

const COOKIE = "lmb_session";
const MAX_AGE = 60 * 60 * 12; // 12 h

/** Reads an env var; blank values count as unset and quotes are stripped. */
const env = (key: string, fallback = "") => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const value = raw.trim().replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
  return value || fallback;
};

const secret = () => {
  const configured = env("ADMIN_SESSION_SECRET");
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }
  return "la-maison-bibi-dev-only-secret";
};

/* ------------------------------------------------------------ accounts */

/**
 * The four operational accounts. Passwords come from the environment; the
 * fallbacks exist only so a fresh checkout boots, and are rotated into the
 * database on every start so a dashboard change applies immediately.
 */
export const MANAGED_ACCOUNTS = [
  {
    username: env("MANAGER_USERNAME", "manager"),
    password: env("MANAGER_PASSWORD", env("ADMIN_PASSWORD", "BibiManager2026!")),
    name: "Paolina Bertrand Essukan",
    role: "manager" as Role,
    email: env("MANAGER_EMAIL", "manager@lamaisonbibi.cm"),
  },
  {
    username: env("ADMIN_USERNAME", "admin"),
    password: env("ADMIN_PASSWORD", "BibiAdmin2026!"),
    name: "Administration",
    role: "admin" as Role,
    email: env("ADMIN_EMAIL", "admin@lamaisonbibi.cm"),
  },
  {
    username: env("AGENT1_USERNAME", "agent1"),
    password: env("AGENT1_PASSWORD", "BibiAgent2026!"),
    name: "Agent 1",
    role: "agent" as Role,
    email: env("AGENT1_EMAIL", "agent1@lamaisonbibi.cm"),
  },
  {
    username: env("AGENT2_USERNAME", "agent2"),
    password: env("AGENT2_PASSWORD", "BibiAgent2026!"),
    name: "Agent 2",
    role: "agent" as Role,
    email: env("AGENT2_EMAIL", "agent2@lamaisonbibi.cm"),
  },
];

/* --------------------------------------------------------- permissions */

/** Content that only management may create, edit or remove. */
const CONTENT = [
  "properties.write",
  "properties.delete",
  "articles.write",
  "articles.delete",
  "services.write",
  "gallery.write",
  "testimonials.write",
  "team.write",
  "homepage.write",
  "media.write",
  "media.delete",
  "categories.write",
  "locations.write",
  "seo.write",
  "settings.write",
  "ai.write",
  "customers.write",
  "appointments.write",
];

const READ = [
  "dashboard.view",
  "properties.read",
  "articles.read",
  "services.read",
  "gallery.read",
  "media.read",
  "customers.read",
  "requests.read",
  "appointments.read",
  "ai.read",
];

export const PERMISSIONS: Record<Role, string[]> = {
  // Highest level: everything, including users, roles and the activity log.
  manager: [
    ...READ,
    ...CONTENT,
    "requests.write",
    "requests.delete",
    "users.read",
    "users.write",
    "activity.read",
    "analytics.read",
  ],
  // Full operational access, but not user/role administration.
  admin: [
    ...READ,
    ...CONTENT,
    "requests.write",
    "requests.delete",
    "activity.read",
    "analytics.read",
  ],
  // Agents work their assigned leads only; no content or system control.
  agent: [
    "dashboard.view",
    "properties.read",
    "articles.read",
    "services.read",
    "gallery.read",
    "media.read",
    "customers.read",
    "requests.read",
    "requests.write",
    "appointments.read",
    "appointments.write",
    "ai.read",
  ],
};

export function can(role: Role | undefined, permission: string) {
  if (!role) return false;
  return (PERMISSIONS[role] ?? []).includes(permission);
}

/* -------------------------------------------------------------- tokens */

export function makeToken(session: Session) {
  const payload = JSON.stringify({
    i: session.id,
    u: session.username,
    n: session.name,
    r: session.role,
    t: Math.floor(Date.now() / 1000),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function readToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  try {
    const expected = createHmac("sha256", secret()).update(encoded).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const d = JSON.parse(Buffer.from(encoded, "base64url").toString()) as {
      i: number; u: string; n: string; r: Role; t: number;
    };
    if (Date.now() / 1000 - d.t > MAX_AGE) return null;
    if (!["manager", "admin", "agent"].includes(d.r)) return null;
    return { id: d.i, username: d.u, name: d.n, role: d.r };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------ sessions */

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return readToken(store.get(COOKIE)?.value);
}

/** Accepts the session cookie or an `Authorization: Bearer` token. */
export async function getSessionFrom(request: Request): Promise<Session | null> {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const fromHeader = readToken(header.slice(7).trim());
    if (fromHeader) return fromHeader;
  }
  return getSession();
}

/** Server-side guard: returns the session only when the permission is held. */
export async function requirePermission(
  request: Request,
  permission: string,
): Promise<Session | null> {
  const session = await getSessionFrom(request);
  if (!session || !can(session.role, permission)) return null;
  return session;
}

export function forbidden(message = "Accès non autorisé.") {
  return Response.json({ error: message }, { status: 403 });
}

export function unauthorized() {
  return Response.json({ error: "Authentification requise." }, { status: 401 });
}

/* -------------------------------------------------------------- cookie */

export function sessionCookieOptions(request?: Request) {
  const secureContext = isSecureRequest(request);
  return {
    httpOnly: true,
    path: "/",
    maxAge: MAX_AGE,
    secure: secureContext,
    sameSite: secureContext ? ("none" as const) : ("lax" as const),
    ...(secureContext ? { partitioned: true } : {}),
  };
}

function isSecureRequest(request?: Request) {
  const host = publicHost(request);
  if (host && isLocalHost(host)) {
    return request?.headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https";
  }
  if (host) return true;
  return process.env.NODE_ENV === "production";
}

function publicHost(request?: Request) {
  if (!request) return "";
  const forwarded = request.headers.get("x-forwarded-host");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("host")?.trim() ?? "";
}

function isLocalHost(host: string) {
  const name = host.split(":")[0].toLowerCase();
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(name);
}

/** CSRF guard: state-changing requests must originate from this site. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origin) return true;
  const host = publicHost(request);
  if (!host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function authConfigStatus() {
  return {
    sessionSecret: Boolean(env("ADMIN_SESSION_SECRET")),
    usingBuiltinDefaults: !env("MANAGER_PASSWORD") && !env("ADMIN_PASSWORD"),
  };
}

export const AUTH_COOKIE = COOKIE;
export const SESSION_MAX_AGE = MAX_AGE;
