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
The Nesty tab's localStorage is authoritative for *who is signed in*; the
`chrome.storage.local` cache is only a token optimization. Every `GET_SESSION`
reconciles the cache against the tab so a logout / account switch can't leak
items into the previously cached account's registry:

1. Read the cached session from `chrome.storage.local`.
2. Read the live auth state from the Nesty tab(s) — `readSessionFromTab()`
   returns `{ tabPresent, session }` so "no tab open" is distinguishable from
   "tab open but signed out".
3. If a tab is open and **signed out** → clear the cache, return null.
4. If a tab is open with a **different user id** than the cache → discard the
   cached (previous-account) session.
5. Prefer the tab's live session when the cache is stale/missing (see rotation
   note below).
6. Valid session in hand? Cache it and return.
7. Still expired? Call the refresh endpoint. Failed (refresh_token also
   expired)? Clear storage, return null → user must log in again.

## The account-switch leak (why step 2–4 exist)
The old code returned the cached session whenever the token had >5 min left and
**never consulted the tab**. So after a user logged out (or logged into a second
account) on nestyil.com, clicking the extension within the cached token lifetime
(~1h) added items to the **previous** account's registry. Reconciling against the
tab on every call closes this. Residual gap: if *no* Nesty tab is open we can't
verify identity and fall back to the cache — acceptable because logout requires a
tab, and requiring one on every click would break the "closed the Nesty tab" flow.

## Refresh-token rotation reuse-detection
Supabase rotates the `refresh_token` on every refresh and invalidates the old
one. If the extension refreshes using the web app's refresh_token, the web app's
SDK still holds the old token and trips reuse-detection on its next refresh
(potentially signing the user out). Mitigations in place:
- **Prefer the tab's live, SDK-maintained session** and only call the refresh
  endpoint as a last resort. While a healthy tab is open the extension never
  rotates the token.
- When the extension *must* refresh with a tab present (dormant tab, both tokens
  expired), it writes the rotated session back into the tab's localStorage
  (`writeSessionToTab()`, same-user only) so both sides stay on one token.
- Residual timing window: the tab's SDK auto-refresh timer may fire before the
  write-back lands. Not fully eliminable without SDK cooperation.

## Rule
Never rely solely on "re-read from tab" as the expiry recovery path — always
implement a `refresh_token` call as the actual recovery mechanism. But equally,
never trust the cache blindly: reconcile it against the tab's live identity so a
stale session can't write to the wrong account. The tab's localStorage is the
source of truth for identity; the cache is a source-of-last-resort for tokens.
