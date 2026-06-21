-- 広告計測・需要検証用カラム追加 (非破壊・既存データは保持される)
-- 実行方法: turso db shell <db名> < migrations/0002_ad_tracking.sql
-- 注意: SQLite/Turso の ALTER TABLE ADD COLUMN は IF NOT EXISTS をサポートしないため、
--       本番DBで未実行の場合のみ一度だけ実行すること。既に追加済みの列があるとエラーになる。

ALTER TABLE rata_pre_registrations ADD COLUMN experience_interest TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN utm_medium TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN utm_content TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN utm_term TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN first_landing_page TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN referrer TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN ad_region TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN ad_concept TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN ad_language TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN browser_language TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN device_type TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN screen_width INTEGER;
ALTER TABLE rata_pre_registrations ADD COLUMN screen_height INTEGER;
ALTER TABLE rata_pre_registrations ADD COLUMN user_agent TEXT;
ALTER TABLE rata_pre_registrations ADD COLUMN high_intent_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rata_pre_registrations ADD COLUMN high_intent INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_utm_campaign ON rata_pre_registrations(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_high_intent  ON rata_pre_registrations(high_intent);
