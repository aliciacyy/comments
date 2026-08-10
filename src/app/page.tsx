import Link from 'next/link';
import { getRecentComments } from '@/lib/db';
import { encodeSourceUrl } from '@/lib/source-url';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let comments = [] as Awaited<ReturnType<typeof getRecentComments>>;
  let databaseReady = true;

  try {
    comments = await getRecentComments();
  } catch {
    databaseReady = false;
  }

  return (
    <main className="feed-shell">
      <header className="feed-header">
        <div>
          <p className="eyebrow">Latest conversations</p>
          <h1>Comments from across the blog.</h1>
        </div>
      </header>

      {!databaseReady ? (
        <div className="setup-message">
          The comment feed is ready, but its database has not been connected
          yet.
        </div>
      ) : comments.length === 0 ? (
        <section className="empty-feed">
          <h2>No comments yet.</h2>
          <p>
            New comments will appear here as soon as readers join a
            conversation.
          </p>
        </section>
      ) : (
        <section className="feed-list" aria-label="Latest comments">
          {comments.map((comment) => {
            const discussionUrl = `/p/${encodeSourceUrl(comment.source_url)}`;
            const hostname = new URL(comment.source_url).hostname.replace(
              /^www\./,
              '',
            );

            return (
              <article className="feed-comment" key={comment.id}>
                <div className="comment-meta">
                  <strong>{comment.author_name}</strong>
                  <time dateTime={comment.created_at}>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                    }).format(new Date(comment.created_at))}
                  </time>
                </div>
                <p>{comment.body}</p>
                <footer>
                  <a href={comment.source_url}>
                    Article on {hostname}
                  </a>
                  <Link href={discussionUrl}>View conversation →</Link>
                </footer>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
