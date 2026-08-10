"use client";

import { FormEvent, useState } from "react";

function encodeUrl(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function normalizeUrl(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();

  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("utm_") || ["fbclid", "gclid"].includes(key)) url.searchParams.delete(key);
  }
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export default function LinkGenerator() {
  const [value, setValue] = useState("");
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const normalized = normalizeUrl(value);
      setPending(true);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: normalized }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "The comment page could not be created.");
      }
      setGenerated(`${window.location.origin}/p/${encodeUrl(normalized)}`);
      setError("");
      setCopied(false);
    } catch (error) {
      setGenerated("");
      setError(error instanceof Error && error.message
        ? error.message
        : "Enter a complete URL beginning with http:// or https://");
    } finally {
      setPending(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
  }

  return (
    <div className="generator-card">
      <form onSubmit={submit}>
        <label htmlFor="source-url">Your published post URL</label>
        <div className="input-row">
          <input
            id="source-url"
            type="url"
            inputMode="url"
            placeholder="https://yourblog.com/a-great-post"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
          />
          <button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create link"}
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>

      {generated && (
        <div className="generated-link" aria-live="polite">
          <span>{generated}</span>
          <button className="button-secondary" type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
          <a className="text-link" href={generated}>Open page →</a>
        </div>
      )}
    </div>
  );
}
