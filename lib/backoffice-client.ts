"use client";

const TOKEN_KEY = "lmb_token";

/**
 * Session token kept in sessionStorage as a fallback for the cookie: some
 * browsers block all storage when the site is displayed inside an embedded
 * frame, which would otherwise make signing in impossible.
 */
export function saveToken(token: string) {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* cookie remains the only transport */
  }
}

export function readStoredToken(): string {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearToken() {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** fetch() for backoffice calls: uncached, cookie + bearer, JSON by default. */
export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = readStoredToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });
}

/** Convenience wrapper returning parsed JSON and a normalised error message. */
export async function apiJson<T = Record<string, unknown>>(
  input: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; data: T; error: string }> {
  try {
    const res = await apiFetch(input, init);
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    return {
      ok: res.ok,
      data,
      error: res.ok ? "" : data.error || "Une erreur est survenue.",
    };
  } catch {
    return { ok: false, data: {} as T, error: "Connexion au serveur impossible." };
  }
}
