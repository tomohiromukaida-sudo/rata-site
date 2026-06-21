-- RATAパス 先行案内登録 — Turso (libSQL / SQLite互換) スキーマ
-- 実行方法: turso db shell <db名> < schema.sql

-- 既存DBへの追加カラムは migrations/0002_ad_tracking.sql を参照（ALTER TABLE、非破壊）。
CREATE TABLE IF NOT EXISTS rata_pre_registrations (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  email               TEXT NOT NULL,
  name                TEXT,
  country             TEXT,
  language            TEXT NOT NULL,
  visit_intent        TEXT NOT NULL,
  interests           TEXT,              -- カンマ区切り (interest_area)
  experience_interest TEXT,              -- カンマ区切り
  price_expectation   TEXT,
  companions          INTEGER,
  reason              TEXT,
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  utm_content         TEXT,
  utm_term            TEXT,
  first_landing_page  TEXT,
  referrer            TEXT,
  ad_region           TEXT,
  ad_concept          TEXT,
  ad_language         TEXT,
  browser_language    TEXT,
  device_type         TEXT,
  screen_width        INTEGER,
  screen_height       INTEGER,
  user_agent          TEXT,
  high_intent_score   INTEGER NOT NULL DEFAULT 0,
  high_intent         INTEGER NOT NULL DEFAULT 0,
  consent             INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address          TEXT
);

CREATE INDEX IF NOT EXISTS idx_email        ON rata_pre_registrations(email);
CREATE INDEX IF NOT EXISTS idx_created_at   ON rata_pre_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_language     ON rata_pre_registrations(language);
CREATE INDEX IF NOT EXISTS idx_utm_campaign ON rata_pre_registrations(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_high_intent  ON rata_pre_registrations(high_intent);
