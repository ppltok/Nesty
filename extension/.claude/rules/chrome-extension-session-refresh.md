# Rule: Chrome Extension Session Cache Needs Token Refresh, Not Just Expiry Fallback

## The Bug
When the cached access token was expired, the code fell back to re-reading the
session from the Nesty tab's localStorage. But the Supabase SDK in that tab
may not have auto-refreshed the token recently (dormant tabs, background
throttling). The fallback returned the same expired token.

## What Broke
Users who hadn't interacted with the Nesty tab for >1 hour received a 401
even after the "re-read from tab" fallback ran, because both the cache and
the tab's localStorage held stale tokens.

## The Fix
When a session is expired (or expiring within 5 minutes), use the
`refresh_token` to silently get a new `access_token` from Supabase before
returning the session.

```js
// Supabase token refresh endpoint (service worker context)
const response = await fetch(
  `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
  {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: session.refresh_token })
  }
);
const newSession = await response.json();
// newSession contains a fresh access_token and a new refresh_token
```

## Session Retrieval Flow (background.js)
1. Read from `chrome.storage.local`
2. Valid? Return immediately.
3. Expired/missing? Read from Nesty tab localStorage.
4. Still expired? Call refresh endpoint.
5. Refresh failed (e.g. refresh_token also expired)? Clear storage, return null → user must log in again.
6. Cache the valid session in `chrome.storage.local`.

## Rule
Never rely solely on "re-read from tab" as the expiry recovery path.
Always implement a `refresh_token` call as the actual recovery mechanism.
The tab's localStorage is a source-of-last-resort, not a source-of-truth.
