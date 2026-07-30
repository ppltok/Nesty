// src/utils/trackCollab.ts
//
// Best-effort tracking for partner-perk ("collab") interactions in the app.
// Writes one row to public.collab_events for each in-app interaction with a
// partner-discount campaign (popup + gifts-page card) and mirrors the event to
// GTM. The Supabase insert is what powers the dashboard's Collabs page; the
// dataLayer push keeps these visible alongside the rest of our GTM funnel.
//
// Email-surface events (email_sent, email_link_click) are logged server-side by
// the send-collab-gift and collab-redirect edge functions - not here.
//
// Fire-and-forget by design: tracking must never block or break the gift UI.

import { supabase } from '../lib/supabase';

export type CollabSource = 'popup' | 'gifts_page';

export type CollabEventType =
  | 'popup_view'
  | 'popup_reveal'
  | 'popup_copy'
  | 'popup_cta_click'
  | 'card_view'
  | 'card_reveal'
  | 'card_copy'
  | 'card_cta_click';

export function trackCollab(
  collab: string,
  eventType: CollabEventType,
  source: CollabSource,
  meta?: Record<string, unknown>,
): void {
  // GTM mirror - never throws.
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'collab_event', collab, collab_event_type: eventType, collab_source: source, ...meta });
    }
  } catch { /* ignore */ }

  // Supabase insert - best-effort. RLS requires the row's user_id to match the
  // logged-in user, so we resolve the session first and silently skip if absent.
  void (async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return; // gift surfaces only render for authed users anyway
      await supabase.from('collab_events').insert({
        collab,
        event_type: eventType,
        source,
        user_id: userId,
        email: data.user?.email ?? null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        meta: meta ?? null,
      });
    } catch { /* swallow - tracking failures must not surface to the user */ }
  })();
}
