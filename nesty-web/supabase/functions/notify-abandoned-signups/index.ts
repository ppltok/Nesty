import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cron-driven edge function. Finds verified signups that:
//   * are at least 10 min old
//   * still have onboarding_completed = false
//   * haven't already been notified (admin_abandon_notified_at IS NULL)
// …and sends `admin_onboarding_abandoned` to hello@nestyil.com via the
// shared `send-email` function. Each successful send stamps
// admin_abandon_notified_at so the next cron tick won't double-fire.
//
// Scheduled by supabase/migrations/20260503_cron_abandoned_signups.sql
// (every 5 minutes via pg_cron + pg_net).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Pull profiles that look abandoned. We rely on profiles.created_at as
    //    a proxy for auth.users.created_at — the handle_new_user trigger
    //    inserts the profile in the same transaction as the auth row, so the
    //    timestamps differ by milliseconds.
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: candidates, error: candErr } = await admin
      .from('profiles')
      .select(
        'id, email, first_name, last_name, due_date, created_at, utm_source, utm_medium, utm_campaign, landing_page, landing_referrer'
      )
      .eq('onboarding_completed', false)
      .is('admin_abandon_notified_at', null)
      .lt('created_at', tenMinAgo)
      .gt('created_at', dayAgo)

    if (candErr) {
      console.error('notify-abandoned-signups: query error', candErr)
      return new Response(JSON.stringify({ ok: false, error: candErr.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const result = { checked: candidates?.length || 0, sent: 0, skipped: 0, errors: 0 }

    for (const p of candidates || []) {
      // Skip rows where the matching auth user is unverified — mirrors the
      // gating that AuthCallback used to apply for admin_new_user.
      const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(p.id)
      if (authErr || !authUser?.user) {
        result.skipped++
        continue
      }
      if (!authUser.user.email_confirmed_at) {
        result.skipped++
        continue
      }

      // Skip if a pending or accepted co-parent invite exists — that flow
      // owns its own admin notification (admin_co_parent_joined).
      const normalizedEmail = (p.email || '').toLowerCase()
      if (normalizedEmail) {
        const { data: invites } = await admin
          .from('registry_invitations')
          .select('id')
          .eq('invited_email', normalizedEmail)
          .in('status', ['pending', 'accepted'])
          .limit(1)
        if (invites && invites.length > 0) {
          // Mark as notified so we never retry — this user belongs to the
          // co-parent flow, not the abandoned-onboarding flow.
          await admin
            .from('profiles')
            .update({ admin_abandon_notified_at: new Date().toISOString() })
            .eq('id', p.id)
          result.skipped++
          continue
        }
      }

      const minutesSinceSignup = Math.round(
        (Date.now() - new Date(p.created_at).getTime()) / 60000
      )

      const { error: invokeErr } = await admin.functions.invoke('send-email', {
        body: {
          type: 'admin_onboarding_abandoned',
          to: 'hello@nestyil.com',
          data: {
            userEmail: p.email,
            firstName: p.first_name || '',
            userName: [p.first_name, p.last_name].filter(Boolean).join(' '),
            signupDate: new Date(p.created_at).toLocaleDateString('he-IL'),
            minutesSinceSignup,
            dueDate: p.due_date || '',
            utmSource: p.utm_source || '',
            utmMedium: p.utm_medium || '',
            utmCampaign: p.utm_campaign || '',
            landingPage: p.landing_page || '',
            landingReferrer: p.landing_referrer || '',
          },
        },
      })

      if (invokeErr) {
        console.error(`notify-abandoned-signups: invoke failed for ${p.email}`, invokeErr)
        result.errors++
        continue
      }

      const { error: updErr } = await admin
        .from('profiles')
        .update({ admin_abandon_notified_at: new Date().toISOString() })
        .eq('id', p.id)

      if (updErr) {
        console.error(`notify-abandoned-signups: dedupe stamp failed for ${p.id}`, updErr)
        result.errors++
        continue
      }

      result.sent++
    }

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('notify-abandoned-signups: fatal', message)
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
