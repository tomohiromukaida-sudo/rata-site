// Generates a RATA PASS code like "RATA-TKN-A3F9K2".
// Uniqueness matters more than strict sequential numbering at this stage —
// the waitlist table enforces uniqueness on pass_code, so a collision just
// triggers a retry by the caller.
export function generatePassCode(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RATA-TKN-${suffix}`;
}
