BEGIN;

CREATE TABLE IF NOT EXISTS conversations (
  source_url TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO conversations (source_url, created_at)
SELECT source_url, MIN(created_at)
FROM comments
GROUP BY source_url
ON CONFLICT (source_url) DO NOTHING;

COMMIT;
