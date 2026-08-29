-- Public registry page: read through one RPC instead of selecting tables.
-- Applied to production 2026-08-29.
--
-- PROBLEM
-- PublicRegistry.tsx selected `registries` (and embedded `profiles`) directly
-- with the anon key. That sent the owner's shipping address to every visitor
-- and merely hid it in the browser, so 65 registries marked
-- address_is_private were handing out a home address and phone number to
-- anyone who opened the page. The page also never checked is_public, so
-- unlisted registries were fully viewable by link.
--
-- WHY AN RPC RATHER THAN A VIEW OR COLUMN GRANT
-- The RPC requires the slug (which carries a random suffix), so there is no
-- way to enumerate every registry in one request. That is what makes it safe
-- to return the owner's due date for the "ימים למועד המשוער" countdown - a
-- view or a plain column grant would be bulk-scrapeable and would recreate
-- the name + due_date dataset behind the nesty_outreach leak.

create or replace function public.get_public_registry(p_slug text)
returns table (
  id uuid,
  slug text,
  title text,
  welcome_message text,
  is_public boolean,
  owner_first_name text,
  owner_due_date date,
  address_is_private boolean,
  address_city text,
  address_street text,
  address_apt text,
  address_postal text,
  address_phone text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    r.id,
    r.slug,
    r.title,
    r.welcome_message,
    r.is_public,
    p.first_name as owner_first_name,
    p.due_date   as owner_due_date,
    coalesce(r.address_is_private, true) as address_is_private,
    -- Address is masked server-side, not in the browser.
    case when coalesce(r.address_is_private, true) then null else r.address_city   end,
    case when coalesce(r.address_is_private, true) then null else r.address_street end,
    case when coalesce(r.address_is_private, true) then null else r.address_apt    end,
    case when coalesce(r.address_is_private, true) then null else r.address_postal end,
    case when coalesce(r.address_is_private, true) then null else r.address_phone  end
  from registries r
  join profiles p on p.id = r.owner_id
  where r.slug = p_slug
    and r.is_public = true
$$;

revoke all on function public.get_public_registry(text) from public;
grant execute on function public.get_public_registry(text) to anon, authenticated, service_role;

-- Anonymous visitors no longer read `registries` directly.
--
-- They keep id / is_public / owner_id / partner_id because RLS policies on
-- `items` reference them. NOTE: Postgres evaluates ALL applicable SELECT
-- policies (they are OR'd), so a missing column privilege on ANY of them
-- fails the whole read - "Owner or partner can view all items" needs
-- owner_id/partner_id even for an anonymous gift-giver who will never match
-- it. Dropping those two grants makes items silently stop loading.
revoke select on public.registries from anon;
grant  select (id, is_public, owner_id, partner_id) on public.registries to anon;

-- Verification: expect a masked row for a private-address registry, the real
-- address for a public one, and zero rows for an unlisted slug.
--   select * from public.get_public_registry('<slug>');
