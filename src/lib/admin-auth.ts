import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "comments_admin_session";

function sessionSecret() {
  return process.env.SESSION_SECRET;
}

export function authIsConfigured() {
  return Boolean(process.env.PAGE_PASSWORD && sessionSecret());
}

export function createAdminSessionToken() {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update("comments-admin-access-v1").digest("base64url");
}

export function isValidAdminSession(token: string | undefined) {
  if (!token || !authIsConfigured()) return false;

  const expected = createAdminSessionToken();
  const providedBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function passwordMatches(candidate: string) {
  const password = process.env.PAGE_PASSWORD;
  if (!password) return false;

  const candidateDigest = createHmac("sha256", "comments-password-check").update(candidate).digest();
  const passwordDigest = createHmac("sha256", "comments-password-check").update(password).digest();
  return timingSafeEqual(candidateDigest, passwordDigest);
}
