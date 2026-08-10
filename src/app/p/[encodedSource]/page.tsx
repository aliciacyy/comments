import { notFound } from "next/navigation";
import CommentForm from "@/components/comment-form";
import { getComments } from "@/lib/db";
import { decodeSourceUrl } from "@/lib/source-url";

export const dynamic = "force-dynamic";

export default async function DiscussionPage({ params }: { params: Promise<{ encodedSource: string }> }) {
  const { encodedSource } = await params;
  const sourceUrl = decodeSourceUrl(encodedSource);
  if (!sourceUrl) notFound();

  const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");
  let comments = [] as Awaited<ReturnType<typeof getComments>>;
  let databaseReady = true;
  try {
    comments = await getComments(sourceUrl);
  } catch {
    databaseReady = false;
  }

  return (
    <main className="discussion-shell">
      <a className="back-link" href={sourceUrl}>← Back to the article on {hostname}</a>
      <header className="discussion-header">
        <p className="eyebrow">Conversation</p>
        <h1>{comments.length === 0 ? "Start the conversation" : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}</h1>
        <a className="source-url" href={sourceUrl}>{sourceUrl}</a>
      </header>

      {!databaseReady ? (
        <div className="setup-message">This comment page is ready, but its database has not been connected yet.</div>
      ) : (
        <>
          <section className="comments-list" aria-label="Comments">
            {comments.map((comment) => (
              <article className="comment" key={comment.id}>
                <div className="comment-meta">
                  <strong>{comment.author_name}</strong>
                  <time dateTime={comment.created_at}>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(comment.created_at))}</time>
                </div>
                <p>{comment.body}</p>
              </article>
            ))}
          </section>
          <CommentForm encodedSource={encodedSource} />
        </>
      )}
    </main>
  );
}
