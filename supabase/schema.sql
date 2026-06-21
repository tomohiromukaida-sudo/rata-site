create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  pass_code text unique not null,
  email text not null,
  name text,
  country text,
  language text,
  interest text,
  visit_intent text,
  price_range text,
  created_at timestamp with time zone default now()
);

-- Row Level Security: enabled with no policies, so all access goes through
-- the service role key from server-side code (API routes, admin page).
-- The browser-side anon key cannot read or write this table.
alter table waitlist enable row level security;
