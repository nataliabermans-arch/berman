-- Supabase schema for the Berman concierge AI assistant.
-- Apply via Supabase SQL Editor (Dashboard → SQL Editor → paste → Run).
-- Or via psql against the connection string in SUPABASE_DB_URL.

CREATE TABLE IF NOT EXISTS conversations (
  id              TEXT PRIMARY KEY,
  visitor_id      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'open' -- open | lead_captured | abandoned
);

CREATE INDEX IF NOT EXISTS idx_conversations_visitor ON conversations (visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations (created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,  -- user | assistant | system
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id, created_at);

CREATE TABLE IF NOT EXISTS leads (
  id                       TEXT PRIMARY KEY,
  conversation_id          TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_name               TEXT NOT NULL,
  last_name                TEXT NOT NULL,
  email                    TEXT NOT NULL,
  phone                    TEXT NOT NULL,
  recommended_specialty    TEXT,
  visit_type_preference    TEXT,    -- in_person | telehealth | either
  conversation_summary     TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'new' -- new | contacted | booked | closed
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);

-- Enable Row Level Security but no policies = service-role only access.
-- The Next.js server uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
