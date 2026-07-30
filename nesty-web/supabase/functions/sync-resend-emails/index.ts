import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Config ────────────────────────────────────────────────────────────
// Hard cap on pages per run so a backlog never runs unbounded.
// 100/page × 25 = 2500 emails max per invocation. The cron runs daily,
// so even a backlog of weeks heals within a few runs.
const MAX_PAGES = 25;
// Buffer added when computing the "newer than" cutoff. Re-checks emails
// near the boundary in case events landed after our last sync
// (status transitions: sent → delivered → opened, etc).
const OVERLAP_HOURS = 6;
// Resend sits behind Cloudflare and 403s the default Deno UA.
const RESEND_HEADERS = {
  Authorization: `Bearer ${RESEND_API_KEY}`,
  "User-Agent": "nesty-sync-resend/1.0",
  Accept: "application/json",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function classifyEmail(subject: string, to: string): string {
  if (subject.includes("ברוכה הבאה") || subject.includes("ברוך הבא")) return "welcome";
  if (subject.includes("משתמש חדש")) return "admin_new_user";
  if (subject.includes("הצ'קליסט")) return "nudge_checklist";
  if (subject.includes("מוכנה לשיתוף")) return "nudge_share";
  if (subject.includes("שבוע")) return "weekly_update";
  if (subject.includes("מתנה") || subject.includes("רכישה")) return "gift_notification";
  if (subject.includes("צור קשר") || subject.toLowerCase().includes("contact")) return "contact";
  if (to === "hello@nestyil.com") return "admin_new_user";
  return "other";
}

function mapStatus(lastEvent: string): string {
  const statusMap: Record<string, string> = {
    sent: "sent",
    delivered: "delivered",
    delivery_delayed: "sent",
    complained: "bounced",
    bounced: "bounced",
    opened: "opened",
    clicked: "clicked",
  };
  return statusMap[lastEvent] || "sent";
}

// ── Main worker ───────────────────────────────────────────────────────
// Incremental sync: walk Resend newest→oldest until we cross the
// MAX(sent_at) already in email_logs (minus a 6h overlap for status
// transitions). Caps at MAX_PAGES so we never run unbounded on the
// first backfill.
async function runSync() {
  const { data: latestRow } = await supabase
    .from("email_logs")
    .select("sent_at")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestSentAt: Date | null = latestRow?.sent_at ? new Date(latestRow.sent_at) : null;
  const cutoff = latestSentAt
    ? new Date(latestSentAt.getTime() - OVERLAP_HOURS * 3600 * 1000)
    : null;

  let after: string | null = null;
  let pages = 0;
  let totalSeen = 0;
  let inserted = 0;
  let skipped = 0;
  let stoppedReason = "max_pages";

  pageLoop: while (pages < MAX_PAGES) {
    const url = `https://api.resend.com/emails?limit=100${after ? `&after=${after}` : ""}`;
    const resp = await fetch(url, { headers: RESEND_HEADERS });

    if (!resp.ok) {
      const body = await resp.text();
      console.error(`Resend page ${pages + 1} returned ${resp.status}: ${body.slice(0, 200)}`);
      stoppedReason = `resend_error_${resp.status}`;
      break;
    }

    const data = await resp.json();
    pages++;
    const batch = data.data || [];
    if (batch.length === 0) {
      stoppedReason = "empty_page";
      break;
    }

    for (const email of batch) {
      totalSeen++;
      const to = email.to?.[0] || "";
      const subject = email.subject || "";
      const sentAt = new Date(email.created_at);

      // Page is ordered newest → oldest. Once we cross the cutoff, older
      // rows are already synced. Stop the entire walk.
      if (cutoff && sentAt < cutoff) {
        stoppedReason = "reached_cutoff";
        break pageLoop;
      }

      const emailType = classifyEmail(subject, to);

      // Skip admin firehose. Tom (tom@ppltok.com) is also Nesty's
      // founder + a real user - the old version conflated those.
      // Now we log Tom's user-facing emails (welcome/weekly/nudge/gift)
      // but skip the admin notifications addressed to him.
      const isAdminToTom =
        to === "tom@ppltok.com" &&
        (subject.includes("New Babu Media Signup") ||
          subject.includes("משתמש חדש נרשם") ||
          subject.includes("Onboarding") ||
          subject.includes("פנייה חדשה") ||
          subject.includes("broken images") ||
          subject.includes("extraction reports"));

      if (emailType === "admin_new_user" || to === "hello@nestyil.com" || isAdminToTom) {
        skipped++;
        continue;
      }

      const row = {
        provider_message_id: email.id,
        recipient_email: to,
        email_type: emailType,
        subject,
        status: mapStatus(email.last_event || "sent"),
        sent_at: email.created_at,
        provider: "resend",
      };

      const { error } = await supabase
        .from("email_logs")
        .upsert(row, { onConflict: "provider_message_id" });

      if (error) {
        console.error(`Upsert failed for ${email.id}:`, error.message);
        skipped++;
      } else {
        inserted++;
      }
    }

    if (!data.has_more) {
      stoppedReason = "no_more_pages";
      break;
    }
    after = batch[batch.length - 1].id;
  }

  const result = {
    pages_scanned: pages,
    rows_seen: totalSeen,
    synced: inserted,
    skipped,
    stopped_reason: stoppedReason,
    cutoff: cutoff?.toISOString() ?? null,
  };
  console.log("sync-resend-emails complete:", JSON.stringify(result));
  return result;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fire-and-forget pattern (same as send-nudge-emails). Returns 202 so
// the cron / GitHub Action never times out, regardless of sync duration.
Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const work = runSync().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sync-resend-emails background run failed:", msg);
  });

  // @ts-ignore - EdgeRuntime provided by Supabase Edge runtime
  EdgeRuntime.waitUntil(work);

  return new Response(JSON.stringify({ status: "accepted" }), {
    status: 202,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
