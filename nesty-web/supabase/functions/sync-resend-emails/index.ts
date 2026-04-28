import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function classifyEmail(subject: string, to: string): string {
  if (subject.includes("ברוכה הבאה") || subject.includes("ברוך הבא")) return "welcome";
  if (subject.includes("משתמש חדש")) return "admin_new_user";
  if (subject.includes("הצ'קליסט")) return "nudge_checklist";
  if (subject.includes("מוכנה לשיתוף")) return "nudge_share";
  if (subject.includes("שבוע")) return "weekly_update";
  if (subject.includes("מתנה") || subject.includes("רכישה")) return "gift_notification";
  if (subject.includes("צור קשר") || subject.toLowerCase().includes("contact")) return "contact";
  if (to === "hello@nestyil.com" || to === "tom@ppltok.com") return "admin_new_user";
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

Deno.serve(async (req) => {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Fetch all emails from Resend
    let allEmails: any[] = [];
    let after: string | null = null;

    while (true) {
      let url = `https://api.resend.com/emails?limit=100`;
      if (after) url += `&after=${after}`;

      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      const data = await resp.json();
      allEmails = allEmails.concat(data.data || []);

      if (!data.has_more || !data.data?.length) break;
      after = data.data[data.data.length - 1].id;
    }

    // Upsert into email_logs
    let inserted = 0;
    let skipped = 0;

    for (const email of allEmails) {
      const to = email.to?.[0] || "";
      const subject = email.subject || "";
      const emailType = classifyEmail(subject, to);

      // Skip admin emails - user only wants emails sent TO users
      if (emailType === "admin_new_user" || to === "hello@nestyil.com" || to === "tom@ppltok.com") {
        skipped++;
        continue;
      }

      const row = {
        provider_message_id: email.id,
        recipient_email: to,
        email_type: emailType,
        subject: subject,
        status: mapStatus(email.last_event || "sent"),
        sent_at: email.created_at,
        provider: "resend",
      };

      const { error } = await supabase
        .from("email_logs")
        .upsert(row, { onConflict: "provider_message_id" });

      if (error) {
        console.error(`Failed to upsert email ${email.id}:`, error.message);
        skipped++;
      } else {
        inserted++;
      }
    }

    const result = {
      total_from_resend: allEmails.length,
      synced: inserted,
      skipped,
    };

    console.log("Sync complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
