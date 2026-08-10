import { NextResponse } from "next/server";
import {
  authIsConfigured,
  createHomeSessionToken,
  HOME_SESSION_COOKIE,
  passwordMatches,
} from "@/lib/home-auth";

export async function POST(request: Request) {
  if (!authIsConfigured()) {
    return NextResponse.json({ error: "Homepage access is not configured." }, { status: 503 });
  }

  const payload = await request.json().catch(() => null);
  if (!passwordMatches(String(payload?.password ?? ""))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(HOME_SESSION_COOKIE, createHomeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
