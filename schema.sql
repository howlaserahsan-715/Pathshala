-- Pathshala D1 schema
-- Apply with: npx wrangler d1 execute pathshala-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  target_exam TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  study_minutes INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 100,
  last_active_date TEXT NOT NULL DEFAULT '',
  completed_topics TEXT NOT NULL DEFAULT '[]',
  bookmarked_topics TEXT NOT NULL DEFAULT '[]',
  registered_date TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS user_data (
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, kind)
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  is_important INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TEXT NOT NULL,
  handled_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_password_resets_status ON password_resets(status);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  total INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);

INSERT OR IGNORE INTO announcements (id, title, message, date, author, is_important, created_at)
VALUES (
  'ann-welcome',
  '📢 পাঠশালা এখন ক্লাউড-সিঙ্কড — যেকোনো ডিভাইস থেকে পড়ুন!',
  'আপনার প্রোফাইল, স্টাডি টাইম, ভুল খাতা ও রিভিশন কিউ এখন Cloudflare D1-এ সুরক্ষিত থাকে। একবার লগইন করলে ফোন, ট্যাব বা কম্পিউটার — সব জায়গায় একই ডেটা পাবেন।',
  'আজকের নোটিশ',
  'পাঠশালা টিম',
  1,
  '2026-11-12T00:00:00.000Z'
);
