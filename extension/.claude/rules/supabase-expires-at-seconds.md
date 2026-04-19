# Rule: Supabase `expires_at` is Unix seconds, not milliseconds

## The Bug
Supabase session objects store `expires_at` as a Unix timestamp in **seconds**.
`Date.now()` returns milliseconds. Comparing them directly makes every session
look expired (the seconds value lands somewhere in January 1970).

```js
// WRONG — always evaluates to false
const expiresAt = new Date(session.expires_at).getTime(); // treats seconds as ms → 1970
if (expiresAt > Date.now()) { ... }

// CORRECT — compare seconds to seconds
const nowSeconds = Date.now() / 1000;
if (session.expires_at > nowSeconds + 300) { ... } // +300 = 5-min safety buffer
```

## What Broke
The extension's `background.js` always considered the cached session expired,
always re-read from the Nesty tab's localStorage, and returned whatever raw
token was there — which could itself be stale. Users got a 401 JWT expired
error even though they were logged in.

## Rule
When checking Supabase session expiry:
- Compare `session.expires_at` (seconds) against `Date.now() / 1000` (also seconds)
- Add a 300-second (5-minute) buffer to refresh before actual expiry
- Never pass `expires_at` to `new Date()` for comparison purposes
