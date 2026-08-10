import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createConversation } from "@/lib/db";

function normalizeUrl(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();

  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("utm_") || ["fbclid", "gclid"].includes(key)) {
      url.searchParams.delete(key);
    }
  }
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const sourceUrl = normalizeUrl(String(payload.sourceUrl ?? ""));
    await createConversation(sourceUrl);
    return NextResponse.json({ ok: true, sourceUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Enter a valid published post URL." }, { status: 400 });
  }
}
