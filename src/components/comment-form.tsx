"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ encodedSource }: { encodedSource: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      }),
    });

    setPending(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "Your comment could not be posted. Please try again.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form className="comment-form" onSubmit={submit}>
      <h2>Join the conversation</h2>
      <div className="form-grid">
        <div>
          <label htmlFor="authorName">Name</label>
          <input id="authorName" name="authorName" maxLength={80} required />
        </div>
        <div>
          <label htmlFor="authorEmail">Email <span>(never shown)</span></label>
          <input id="authorEmail" name="authorEmail" type="email" maxLength={320} />
        </div>
      </div>
      <label htmlFor="body">Comment</label>
      <textarea id="body" name="body" rows={5} maxLength={4000} required />
      <div className="submit-row">
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post comment"}</button>
        <span>Comments appear immediately.</span>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
