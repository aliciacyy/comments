import { neon } from "@neondatabase/serverless";

export type Comment = {
  id: string;
  source_url: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type Conversation = {
  source_url: string;
  comment_count: number;
  created_at: string;
};

export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

export async function createConversation(sourceUrl: string) {
  const sql = database();
  await sql`
    INSERT INTO conversations (source_url)
    VALUES (${sourceUrl})
    ON CONFLICT (source_url) DO NOTHING
  `;
}

export async function getComments(sourceUrl: string) {
  const sql = database();
  const rows = await sql`
    SELECT id, source_url, author_name, body, created_at
    FROM comments
    WHERE source_url = ${sourceUrl}
    ORDER BY created_at DESC
  `;
  return rows as Comment[];
}

export async function getLatestComments(limit = 5) {
  const sql = database();
  const rows = await sql`
    SELECT id, source_url, author_name, body, created_at
    FROM comments
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as Comment[];
}

export async function getRecentConversations(limit = 100) {
  const sql = database();
  const rows = await sql`
    SELECT
      conversations.source_url,
      COUNT(comments.id)::int AS comment_count,
      conversations.created_at
    FROM conversations
    LEFT JOIN comments ON comments.source_url = conversations.source_url
    GROUP BY conversations.source_url, conversations.created_at
    ORDER BY conversations.created_at DESC
    LIMIT ${limit}
  `;
  return rows as Conversation[];
}
