-- RATAパス 先行案内登録 — Turso (libSQL / SQLite互換) スキーマ
-- 実行方法: turso db shell <db名> < schema.sql

CREATE TABLE IF NOT EXISTS rata_pre_registrations (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  email              TEXT NOT NULL,
  name               TEXT,
  country            TEXT,
  language           TEXT NOT NULL,
  visit_intent       TEXT NOT NULL,
  interests          TEXT,              -- カンマ区切り
  price_expectation  TEXT,
  companions         INTEGER,
  reason             TEXT,
  utm_source         TEXT,
  utm_campaign       TEXT,
  consent            INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address         TEXT
);

CREATE INDEX IF NOT EXISTS idx_email      ON rata_pre_registrations(email);
CREATE INDEX IF NOT EXISTS idx_created_at ON rata_pre_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_language   ON rata_pre_registrations(language);
