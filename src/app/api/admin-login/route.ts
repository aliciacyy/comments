import { NextResponse } from "next/server";
import {
  authIsConfigured,
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE,
  passwordMatches,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!authIsConfigured()) {
    return NextResponse.json({ error: "Homepage access is not configured." }, { status: 503 });
  }

  const payload = await request.json().catch(() => null);
  if (!passwordMatches(String(payload?.password ?? ""))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
