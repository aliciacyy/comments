import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { decodeSourceUrl } from "@/lib/source-url";

type TurnstileResult = {
  success: boolean;
  action?: string;
};

async function verifyTurnstile(token: string, remoteIp: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token || token.length > 2048) return false;

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  if (remoteIp) formData.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;

    const result = (await response.json()) as TurnstileResult;
    return result.success && result.action === "comment";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const sourceUrl = decodeSourceUrl(String(payload.encodedSource ?? ""));
    const authorName = String(payload.authorName ?? "").trim();
    const authorEmail = String(payload.authorEmail ?? "").trim();
    const body = String(payload.body ?? "").trim();
    const turnstileToken = String(payload.turnstileToken ?? "");

    if (!sourceUrl) return NextResponse.json({ error: "Invalid article URL." }, { status: 400 });
    if (!authorName || authorName.length > 80) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    if (!body || body.length > 4000) return NextResponse.json({ error: "Enter a comment under 4,000 characters." }, { status: 400 });
    if (authorEmail.length > 320) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const forwardedFor = request.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim() || null;
    if (!(await verifyTurnstile(turnstileToken, remoteIp))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    const sql = database();
    await sql`
      INSERT INTO comments (source_url, author_name, author_email, body)
      VALUES (${sourceUrl}, ${authorName}, ${authorEmail || null}, ${body})
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Comment service is unavailable." }, { status: 503 });
  }
}
