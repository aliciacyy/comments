import { NextResponse } from "next/server";
import { HOME_SESSION_COOKIE } from "@/lib/home-auth";

export function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(HOME_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
