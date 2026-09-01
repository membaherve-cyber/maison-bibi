import { NextResponse } from "next/server";
import { AUTH_COOKIE, getSessionFrom, sessionCookieOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSessionFrom(request);
  await logActivity(session, "logout", "session", session?.id ?? "", "", request);
  const res = NextResponse.json({ ok: true });
  // Clear with the same attributes used when the cookie was written.
  res.cookies.set(AUTH_COOKIE, "", {
    ...sessionCookieOptions(request),
    maxAge: 0,
  });
  return res;
}
