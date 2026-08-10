"use client";

import { FormEvent, useState } from "react";

export default function HomeLogin({ configured }: { configured: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/home-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setPending(false);
    if (!response.ok) {
      setError(response.status === 503 ? "Homepage access has not been configured yet." : "That password is incorrect.");
      return;
    }

    window.location.reload();
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow">Private access</p>
        <h1>Open the link generator.</h1>
        <p>Enter your private password to create a comment page.</p>
        <form onSubmit={submit}>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" autoFocus required disabled={!configured} />
          <button type="submit" disabled={pending || !configured}>{pending ? "Opening…" : "Continue"}</button>
          {!configured && <p className="form-error" role="alert">Add PAGE_PASSWORD and SESSION_SECRET to the environment first.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
