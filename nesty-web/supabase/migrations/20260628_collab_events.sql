-- Collab (partner-perk) interaction tracking.
--
-- One row per user interaction with a partner-discount campaign, across all
-- surfaces: the in-app popup, the gifts-page card, and the welcome email.
-- This is the single source of truth behind the dashboard's "Collabs" page.
-- Designed to be reusable for every future partner (Supherb is the first):
-- the `collab` column namespaces the campaign.
--
-- Event types (event_type):
--   email_sent        — welcome gift email handed to Resend (server-side)
--   email_link_click  — user clicked the CTA in the email (via collab-redirect)
--   popup_view        — in-app popup shown
--   popup_reveal      — user tapped "reveal gift" in the popup
--   popup_copy        — user copied the coupon code from the popup
--   popup_cta_click   — user clicked "redeem" in the popup
--   card_view         — gifts-page card shown
--   card_reveal       — user tapped "reveal gift" on the card
--   card_copy         — user copied the coupon code from the card
--   card_cta_click    — user clicked "redeem" on the card
--
-- source: 'popup' | 'gifts_page' | 'email'

create table if not exists public.collab_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  collab      text not null,                                  -- e.g. 'supherb'
  event_type  text not null,
  source      text,                                           -- 'popup' | 'gifts_page' | 'email'
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  user_agent  text,
  meta        jsonb
);

create index if not exists idx_collab_events_collab_type on public.collab_events (collab, event_type);
create index if not exists idx_collab_events_created_at on public.collab_events (created_at);
create index if not exists idx_collab_events_user on public.collab_events (user_id);

alter table public.collab_events enable row level security;

-- In-app events are inserted from the browser with the logged-in user's JWT.
-- A user may only log events attributed to themselves. Email-surface events
-- (email_sent, email_link_click) are written by edge functions using the
-- service role, which bypasses RLS entirely.
drop policy if exists "collab_events_insert_own" on public.collab_events;
create policy "collab_events_insert_own"
  on public.collab_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No SELECT policy on purpose: reads happen only through the SECURITY DEFINER
-- RPC the dashboard calls (get_collab_metrics) or the service role. This keeps
-- raw per-user interaction data out of reach of the anon/authenticated client.
