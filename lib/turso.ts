import { createClient, Client } from '@libsql/client';

let cached: Client | null = null;

// Lazily created (not at module load) so a build without TURSO_DATABASE_URL /
// TURSO_AUTH_TOKEN configured doesn't fail at build time — the error only
// surfaces if this is actually called at request time without the env vars
// present.
export function getTursoClient(): Client {
  if (cached) return cached;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set.');
  }

  cached = createClient({ url, authToken });
  return cached;
}
