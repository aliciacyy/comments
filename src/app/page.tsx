import HomepageTabs from '@/components/homepage-tabs';
import { getLatestComments, getRecentConversations } from '@/lib/db';
import { encodeSourceUrl } from '@/lib/source-url';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let conversations = [] as Awaited<ReturnType<typeof getRecentConversations>>;
  let latestComments = [] as Awaited<ReturnType<typeof getLatestComments>>;
  let databaseReady = true;

  try {
    [conversations, latestComments] = await Promise.all([
      getRecentConversations(),
      getLatestComments(5),
    ]);
  } catch {
    databaseReady = false;
  }

  return (
    <main className="feed-shell">
      {!databaseReady ? (
        <div className="setup-message">
          The comment feed is ready, but its database has not been connected
          yet.
        </div>
      ) : (
        <HomepageTabs
          conversations={conversations.map((conversation) => ({
            sourceUrl: conversation.source_url,
            commentCount: conversation.comment_count,
            createdAt: conversation.created_at,
            formattedDate: new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
              new Date(conversation.created_at),
            ),
            discussionUrl: `/p/${encodeSourceUrl(conversation.source_url)}`,
          }))}
          latestComments={latestComments.map((comment) => ({
            id: comment.id,
            sourceUrl: comment.source_url,
            authorName: comment.author_name,
            body: comment.body,
            createdAt: comment.created_at,
            formattedDate: new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
              new Date(comment.created_at),
            ),
            discussionUrl: `/p/${encodeSourceUrl(comment.source_url)}`,
          }))}
        />
      )}
    </main>
  );
}
