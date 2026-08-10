import { neon } from "@neondatabase/serverless";

export type Comment = {
  id: string;
  source_url: string;
  author_name: string;
  body: string;
  created_at: string;
};

export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

export async function getComments(sourceUrl: string) {
  const sql = database();
  const rows = await sql`
    SELECT id, source_url, author_name, body, created_at
    FROM comments
    WHERE source_url = ${sourceUrl}
    ORDER BY created_at ASC
  `;
  return rows as Comment[];
}

export async function getRecentComments(limit = 100) {
  const sql = database();
  const rows = await sql`
    SELECT id, source_url, author_name, body, created_at
    FROM comments
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as Comment[];
}
