import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { decodeSourceUrl } from "@/lib/source-url";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const sourceUrl = decodeSourceUrl(String(payload.encodedSource ?? ""));
    const authorName = String(payload.authorName ?? "").trim();
    const authorEmail = String(payload.authorEmail ?? "").trim();
    const body = String(payload.body ?? "").trim();

    if (!sourceUrl) return NextResponse.json({ error: "Invalid article URL." }, { status: 400 });
    if (!authorName || authorName.length > 80) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    if (!body || body.length > 4000) return NextResponse.json({ error: "Enter a comment under 4,000 characters." }, { status: 400 });
    if (authorEmail.length > 320) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

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
