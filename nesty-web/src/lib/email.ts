// Email helpers shared by the co-parent invite inputs (onboarding step 6 and
// Settings). The send-invitation edge function repeats the same normalize +
// check server-side - keep the two in step.

/**
 * Trim, lowercase, and strip what a paste drags along: invisible bidi marks
 * from RTL apps and a "mailto:" prefix (plus its ?subject= tail). A pasted
 * "mailto:name@gmail.com" was once stored and mailed as-is.
 */
export function normalizeEmail(raw: string): string {
  let s = raw
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, '')
    .trim()
    .toLowerCase()
  if (s.startsWith('mailto:')) s = s.slice('mailto:'.length).split('?')[0].trim()
  return s
}

// WHATWG <input type="email"> grammar, plus a letters-only TLD so
// "name@gmail" and "name@gmail.c" don't pass.
const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,63}$/i

/** Expects an already-normalized address (see normalizeEmail). */
export const isValidEmail = (email: string) => email.length <= 254 && EMAIL_RE.test(email)
