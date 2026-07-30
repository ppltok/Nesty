import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Public endpoint that records a view of a shared registry page.
//
//   POST /functions/v1/track-registry-view
//   { registry_id, viewer_id, referral_source }
//
// Why an edge function rather than a direct insert from the browser: it keeps
// RLS on registry_views closed (service-role writes only) instead of opening an
// anon INSERT policy on a public table.
//
// Must be deployed with --no-verify-jwt - gift-givers viewing a shared registry
// are not logged in.
//
// The client calls this fire-and-forget; it must never slow down or break the
// page, so every failure path still returns 200.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const registryId = typeof body.registry_id === 'string' ? body.registry_id : null

    if (registryId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      await supabaseAdmin.from('registry_views').insert({
        registry_id: registryId,
        viewer_id: typeof body.viewer_id === 'string' ? body.viewer_id.slice(0, 128) : null,
        referral_source: typeof body.referral_source === 'string' ? body.referral_source.slice(0, 512) : null,
        user_agent: req.headers.get('user-agent'),
      })
    }
  } catch (err) {
    // Never surface a tracking failure to the viewer.
    console.error('track-registry-view error:', err)
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
