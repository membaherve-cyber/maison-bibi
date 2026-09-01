import { NextResponse } from "next/server";
import { getSessionFrom, PERMISSIONS } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function GET(request: Request) {
  const session = await getSessionFrom(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { headers: NO_STORE });
  }
  return NextResponse.json(
    { authenticated: true, user: session, permissions: PERMISSIONS[session.role] },
    { headers: NO_STORE },
  );
}
