export function decodeSourceUrl(encoded: string): string | null {
  try {
    const sourceUrl = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = new URL(sourceUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function encodeSourceUrl(sourceUrl: string) {
  return Buffer.from(sourceUrl, "utf8").toString("base64url");
}
