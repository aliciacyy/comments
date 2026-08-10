import Link from 'next/link';
import { getRecentConversations } from '@/lib/db';
import { encodeSourceUrl } from '@/lib/source-url';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let conversations = [] as Awaited<ReturnType<typeof getRecentConversations>>;
  let databaseReady = true;

  try {
    conversations = await getRecentConversations();
  } catch {
    databaseReady = false;
  }

  return (
    <main className="feed-shell">
      <header className="feed-header">
        <div>
          <p className="eyebrow">Latest conversations</p>
        </div>
      </header>

      {!databaseReady ? (
        <div className="setup-message">
          The comment feed is ready, but its database has not been connected
          yet.
        </div>
      ) : conversations.length === 0 ? (
        <section className="empty-feed">
          <h2>No comments yet.</h2>
          <p>
            New comments will appear here as soon as readers join a
            conversation.
          </p>
        </section>
      ) : (
        <section className="feed-list" aria-label="Latest conversations">
          {conversations.map((conversation) => {
            const discussionUrl = `/p/${encodeSourceUrl(conversation.source_url)}`;

            return (
              <article className="feed-comment" key={conversation.source_url}>
                <div className="comment-meta">
                  <strong>Post link</strong>
                  <time dateTime={conversation.created_at}>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                    }).format(new Date(conversation.created_at))}
                  </time>
                </div>
                <a className="feed-source-url" href={conversation.source_url}>
                  {conversation.source_url}
                </a>
                <footer>
                  <span>
                    {conversation.comment_count}{' '}
                    {conversation.comment_count === 1 ? 'comment' : 'comments'}
                  </span>
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
