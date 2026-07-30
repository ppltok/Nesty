// Per-email open + click tracking, shared by every email Nesty sends.
//
// Why this exists: Resend's native open/click tracking is off account-wide, and
// until now only the Supherb collab emails were instrumented (via collab_events).
// Everything else — weekly updates, all four nudges, invites, welcome — went out
// completely blind. These helpers make every email answerable in SQL.
//
// Usage inside an email template:
//   import { trackedUrl, openPixelUrl } from '../_shared/email-tracking.ts'
//   const cta = trackedUrl('https://nestyil.com/checklist',
//                          { emailType: 'nudge_first_item', userId, link: 'cta' })
//   ...
//   <img src="${openPixelUrl({ emailType: 'nudge_first_item', userId })}" width="1" height="1" />
//
// Clicks land on the `email-click` function, which logs the row and 302s to the
// destination with UTM params appended — so the same click shows up both in
// email_events (exact, per user) and in GA/GTM (aggregate traffic).

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''

export interface TrackOpts {
  /** Stable identifier for the email, e.g. 'weekly', 'nudge_share'. Becomes utm_medium. */
  emailType: string
  /** Recipient's profile id, when known. Null for invitees with no account. */
  userId?: string | null
  /** Which link inside the email, e.g. 'cta', 'header_logo'. Becomes utm_content. */
  link: string
}

/** Wrap a destination URL so the click is logged before the redirect. */
export function trackedUrl(destination: string, o: TrackOpts): string {
  const qs = new URLSearchParams({ d: destination, t: o.emailType, l: o.link })
  if (o.userId) qs.set('u', o.userId)
  return `${SUPABASE_URL}/functions/v1/email-click?${qs.toString()}`
}

/** 1x1 transparent GIF that records an open. */
export function openPixelUrl(o: Omit<TrackOpts, 'link'>): string {
  const qs = new URLSearchParams({ t: o.emailType })
  if (o.userId) qs.set('u', o.userId)
  return `${SUPABASE_URL}/functions/v1/email-open?${qs.toString()}`
}

/** Ready-to-inject pixel tag. */
export function openPixelTag(o: Omit<TrackOpts, 'link'>): string {
  return `<img src="${openPixelUrl(o)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px;" />`
}
