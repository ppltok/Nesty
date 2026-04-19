# Rule: Log Actual HTTP Status and Supabase Response Body on API Failures

## The Bug
Generic error messages like `throw new Error('Failed to fetch registry')` hide
the real cause. A 401 JWT expiry, a 403 RLS block, and a 500 server error all
look identical to the user and to the developer debugging the issue.

## What Broke
The user saw "אירעה שגיאה: Failed to fetch registry" with no actionable
information. Diagnosing the JWT expiry required an extra round-trip just to
add proper error logging — time that would have been saved if it was there
from the start.

## Correct Pattern

```js
if (!response.ok) {
  const body = await response.text().catch(() => '');
  console.error('Supabase request failed:', response.status, body);
  throw new Error(`שגיאת שרת ${response.status} בטעינת הרשימה`);
}
```

This immediately reveals errors like:
```
Registry fetch failed: 401 {"code":"PGRST303","message":"JWT expired"}
Registry fetch failed: 403 {"code":"42501","message":"permission denied"}
```

## Rule
Every `fetch()` call to the Supabase REST API or Edge Functions must:
1. Check `response.ok`
2. On failure: `await response.text()` the body and `console.error` both the
   status code and the raw body
3. Include the HTTP status code in the error thrown to the user

Never wrap a failed Supabase response in a generic hardcoded string.
