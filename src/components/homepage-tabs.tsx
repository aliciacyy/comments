'use client';

import Link from 'next/link';
import { useState } from 'react';

type ConversationItem = {
  sourceUrl: string;
  commentCount: number;
  createdAt: string;
  formattedDate: string;
  discussionUrl: string;
};

type CommentItem = {
  id: string;
  sourceUrl: string;
  authorName: string;
  body: string;
  createdAt: string;
  formattedDate: string;
  discussionUrl: string;
};

export default function HomepageTabs({
  conversations,
  latestComments,
}: {
  conversations: ConversationItem[];
  latestComments: CommentItem[];
}) {
  const [activeTab, setActiveTab] = useState<'conversations' | 'comments'>(
    'conversations',
  );

  return (
    <>
      <header className="feed-header">
        <p className="eyebrow">
          {activeTab === 'conversations'
            ? 'Comments by posts'
            : 'Latest comments'}
        </p>
      </header>
      <div className="feed-tabs" role="tablist" aria-label="Homepage feeds">
        <button
          className="feed-tab"
          type="button"
          role="tab"
          id="conversations-tab"
          aria-controls="conversations-panel"
          aria-selected={activeTab === 'conversations'}
          onClick={() => setActiveTab('conversations')}
        >
          Posts
        </button>
        <button
          className="feed-tab"
          type="button"
          role="tab"
          id="comments-tab"
          aria-controls="comments-panel"
          aria-selected={activeTab === 'comments'}
          onClick={() => setActiveTab('comments')}
        >
          Latest
        </button>
      </div>

      <section
        className="feed-panel"
        id={`${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
        tabIndex={0}
      >
        {activeTab === 'conversations' ? (
          conversations.length === 0 ? (
            <div className="empty-feed">
              <h2>No conversations yet.</h2>
            </div>
          ) : (
            <div className="feed-list">
              {conversations.map((conversation) => (
                <article className="feed-comment" key={conversation.sourceUrl}>
                  <div className="comment-meta">
                    <strong>Post link</strong>
                    <time dateTime={conversation.createdAt}>
                      {conversation.formattedDate}
                    </time>
                  </div>
                  <a className="feed-source-url" href={conversation.sourceUrl}>
                    {conversation.sourceUrl}
                  </a>
                  <footer>
                    <span>
                      {conversation.commentCount}{' '}
                      {conversation.commentCount === 1 ? 'comment' : 'comments'}
                    </span>
                    <Link href={conversation.discussionUrl}>
                      View conversation →
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          )
        ) : latestComments.length === 0 ? (
          <div className="empty-feed">
            <h2>No comments yet.</h2>
          </div>
        ) : (
          <div className="feed-list">
            {latestComments.map((comment) => (
              <article className="feed-comment" key={comment.id}>
                <div className="comment-meta">
                  <strong>{comment.authorName}</strong>
                  <time dateTime={comment.createdAt}>
                    {comment.formattedDate}
                  </time>
                </div>
                <p className="latest-comment-body">{comment.body}</p>
                <footer>
                  <a href={comment.sourceUrl}>{comment.sourceUrl}</a>
                  <Link href={comment.discussionUrl}>View conversation →</Link>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
