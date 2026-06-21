CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pass_code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  country TEXT,
  language TEXT,
  interest TEXT,
  visit_intent TEXT,
  price_range TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS passes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pass_code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  pass_type TEXT DEFAULT 'waitlist',
  status TEXT DEFAULT 'pending',
  issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  published_date TEXT NOT NULL,
  title TEXT NOT NULL,
  pdf_url TEXT,
  status TEXT DEFAULT 'published',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monitoring_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  report_date TEXT,
  image_url TEXT,
  visibility TEXT DEFAULT 'public',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Optional seed: carries over the one public notice published during Phase 1
-- (静的サイト時代の決算公告). Safe to skip or delete before running.
INSERT INTO public_notices (published_date, title, pdf_url, status)
SELECT '2026-02-28', '第1期 決算公告（貸借対照表）', '/notices/2026-kessan.pdf', 'published'
WHERE NOT EXISTS (SELECT 1 FROM public_notices WHERE title = '第1期 決算公告（貸借対照表）');
