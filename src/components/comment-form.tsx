"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function CommentForm({ encodedSource }: { encodedSource: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [widgetId, setWidgetId] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function renderTurnstile() {
    const container = document.getElementById("comment-turnstile");
    if (!container || !window.turnstile || widgetId || !siteKey) return;

    const id = window.turnstile.render(container, {
      sitekey: siteKey,
      action: "comment",
      theme: "auto",
      size: "flexible",
      callback: (token: string) => {
        setTurnstileToken(token);
        setError("");
      },
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => {
        setTurnstileToken("");
        setError("The verification could not load. Please try again.");
      },
    });
    setWidgetId(id);
  }

  function resetTurnstile() {
    if (widgetId) window.turnstile?.reset(widgetId);
    setTurnstileToken("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turnstileToken) {
      setError("Complete the verification before posting.");
      return;
    }

    setPending(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encodedSource,
        authorName: data.get("authorName"),
        authorEmail: data.get("authorEmail"),
        body: data.get("body"),
        turnstileToken,
      }),
    });

    setPending(false);
    resetTurnstile();
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "Your comment could not be posted. Please try again.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />
      <form className="comment-form" onSubmit={submit}>
        <h2>Join the conversation</h2>
        <div className="form-grid">
          <div>
            <label htmlFor="authorName">Name</label>
            <input id="authorName" name="authorName" maxLength={80} required />
          </div>
          <div>
            <label htmlFor="authorEmail">Email <span>(optional, never shown)</span></label>
            <input id="authorEmail" name="authorEmail" type="email" maxLength={320} />
          </div>
        </div>
        <label htmlFor="body">Comment</label>
        <textarea id="body" name="body" rows={5} maxLength={4000} required />
        <div className="turnstile-wrap">
          {siteKey ? <div id="comment-turnstile" /> : <p className="form-error">Turnstile has not been configured.</p>}
        </div>
        <div className="submit-row">
          <button type="submit" disabled={pending || !turnstileToken}>{pending ? "Posting…" : "Post comment"}</button>
          <span>Comments appear immediately.</span>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </>
  );
}
