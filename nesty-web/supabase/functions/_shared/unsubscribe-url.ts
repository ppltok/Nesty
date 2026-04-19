// HMAC-signed unsubscribe URL builder.
//
// Generates a URL that the `unsubscribe` edge function can verify statelessly.
// The signature proves "Nesty's server-side code generated this URL for this
// specific (user, category) pair" — nobody can forge an unsubscribe link
// without the secret. We only need HMAC-SHA256; no token table, no expiry
// management. If the secret is rotated, ALL existing unsubscribe links in
// user inboxes invalidate — that's the trade-off for statelessness.
//
// Env vars required:
//   UNSUBSCRIBE_SECRET — random 64-char hex string, stored in Supabase
//                        function secrets. NOT committed to the repo.
//   SUPABASE_URL       — already available to edge functions.
//
// Usage (inside an edge function):
//   import { buildUnsubscribeUrl } from '../_shared/unsubscribe-url.ts'
//   const url = await buildUnsubscribeUrl(profile.id, 'weekly')
//   // Inject `${url}` into the email template in place of /settings.

import type { EmailCategoryKey } from './email-categories.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SECRET = Deno.env.get('UNSUBSCRIBE_SECRET') ?? ''

async function hmacHex(payload: string): Promise<string> {
  if (!SECRET) {
    throw new Error('UNSUBSCRIBE_SECRET env var is not set')
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Signed payload format: `${userId}:${category}:${action}`.
 * Actions:
 *   'unsub' — flip the category column to false
 *   'resub' — flip the category column to true (used on the /unsubscribed page)
 */
export async function buildUnsubscribeUrl(
  userId: string,
  category: EmailCategoryKey,
  action: 'unsub' | 'resub' = 'unsub',
): Promise<string> {
  const payload = `${userId}:${category}:${action}`
  const sig = await hmacHex(payload)
  const qs = new URLSearchParams({ uid: userId, cat: category, action, sig })
  return `${SUPABASE_URL}/functions/v1/unsubscribe?${qs.toString()}`
}

/**
 * Verify an incoming unsubscribe request. Returns true iff the signature
 * matches what we would compute for the given (uid, cat, action).
 */
export async function verifyUnsubscribeSignature(
  uid: string,
  cat: string,
  action: string,
  sig: string,
): Promise<boolean> {
  const expected = await hmacHex(`${uid}:${cat}:${action}`)
  // Constant-time comparison isn't strictly necessary for unsubscribe
  // (bruteforce gives you nothing useful) but doesn't cost us anything.
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}
