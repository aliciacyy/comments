import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import CommentForm from '@/components/comment-form';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { createConversation, getComments } from '@/lib/db';
import { decodeSourceUrl } from '@/lib/source-url';

export const dynamic = 'force-dynamic';

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ encodedSource: string }>;
}) {
  const { encodedSource } = await params;
  const sourceUrl = decodeSourceUrl(encodedSource);
  if (!sourceUrl) notFound();

  let comments = [] as Awaited<ReturnType<typeof getComments>>;
  let databaseReady = true;
  try {
    const cookieStore = await cookies();
    if (isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
      await createConversation(sourceUrl);
    }
    comments = await getComments(sourceUrl);
  } catch {
    databaseReady = false;
  }

  return (
    <main className="discussion-shell">
      <header className="discussion-header">
        <div className="post-header">
          <span>Post: </span>
          <a className="source-url" href={sourceUrl}>
            {sourceUrl}
          </a>
        </div>
      </header>

      <p className="eyebrow">
        {comments.length === 0
          ? 'No comments yet :('
          : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
      </p>

      {!databaseReady ? (
        <div className="setup-message">
          This comment page is ready, but its database has not been connected
          yet.
        </div>
      ) : (
        <>
          <section className="comments-list" aria-label="Comments">
            {comments.map((comment) => (
              <article className="comment" key={comment.id}>
                <div className="comment-meta">
                  <strong>{comment.author_name}</strong>
                  <time dateTime={comment.created_at}>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                    }).format(new Date(comment.created_at))}
                  </time>
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
