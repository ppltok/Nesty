# Rule: Registry Queries Must Include Both `owner_id` and `partner_id`

## The Bug
Any query that fetches "the user's registry" using only `owner_id=eq.${userId}`
silently returns nothing for partner users (co-parents who were invited and
accepted). They see "no registry found" even though they have full access.

## Schema
```
registries (id, owner_id, partner_id, slug, title, ...)
```
A user can appear in either column. Both have equal read/update access.

## Correct Query Pattern

```js
// WRONG — misses partner users
`/rest/v1/registries?owner_id=eq.${userId}&select=*`

// CORRECT — covers both roles
`/rest/v1/registries?or=(owner_id.eq.${userId},partner_id.eq.${userId})&select=*&limit=1`
```

## Rule
Any Supabase query that fetches a registry for "the current user" must use
the PostgREST `or()` filter covering both `owner_id` and `partner_id`.
This applies in both `content.js` (extension) and any web app query that
looks up the logged-in user's registry.
