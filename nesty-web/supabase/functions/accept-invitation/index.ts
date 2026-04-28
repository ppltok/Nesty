import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    const { token, action } = await req.json()

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up the invitation by token (service_role bypasses RLS)
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('registry_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single()

    if (invError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found', code: 'NOT_FOUND' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if already used
    if (invitation.status === 'accepted') {
      return new Response(JSON.stringify({ error: 'Already accepted', code: 'ALREADY_USED' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if revoked
    if (invitation.status === 'revoked') {
      return new Response(JSON.stringify({ error: 'Invitation was cancelled', code: 'REVOKED' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      // Update status to expired
      await supabaseAdmin
        .from('registry_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return new Response(JSON.stringify({ error: 'Invitation expired', code: 'EXPIRED' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get registry and owner info for display
    const { data: registry } = await supabaseAdmin
      .from('registries')
      .select('id, owner_id, partner_id, title')
      .eq('id', invitation.registry_id)
      .single()

    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', invitation.invited_by)
      .single()

    const ownerName = ownerProfile
      ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || ownerProfile.email
      : 'Someone'

    // ─── VALIDATE action ───────────────────────────────
    if (action === 'validate') {
      return new Response(JSON.stringify({
        valid: true,
        owner_name: ownerName,
        registry_title: registry?.title || null,
        invited_email: invitation.invited_email,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── ACCEPT actions require authentication ─────────
    if (action !== 'accept' && action !== 'accept_archive_own') {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check registry still has no partner
    if (registry?.partner_id) {
      return new Response(JSON.stringify({ error: 'Registry already has a partner' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If user has their own registry and action is accept_archive_own, archive it
    if (action === 'accept_archive_own') {
      const { data: ownRegistry } = await supabaseAdmin
        .from('registries')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (ownRegistry) {
        // "Archive" by removing ownership — set owner_id to NULL won't work with FK.
        // Instead, we'll delete the user's empty registry or transfer items.
        // For simplicity: delete the user's registry if it has no items,
        // or just detach by setting a flag.
        const { count } = await supabaseAdmin
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('registry_id', ownRegistry.id)

        if (count === 0) {
          // Empty registry — safe to delete
          await supabaseAdmin
            .from('registries')
            .delete()
            .eq('id', ownRegistry.id)
        } else {
          // Has items — "archive" by making it private and adding a note
          await supabaseAdmin
            .from('registries')
            .update({
              is_public: false,
              title: `[ארכיון] ${registry?.title || 'הרשימה שלי'}`,
            })
            .eq('id', ownRegistry.id)
        }
      }
    }

    // Link partner to registry
    const { error: updateError } = await supabaseAdmin
      .from('registries')
      .update({ partner_id: user.id })
      .eq('id', invitation.registry_id)

    if (updateError) {
      throw new Error('Failed to link partner: ' + updateError.message)
    }

    // Mark invitation as accepted
    await supabaseAdmin
      .from('registry_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    // Mark onboarding as completed for the partner if not already
    await supabaseAdmin
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)
      .eq('onboarding_completed', false)

    // ─── Notify admin (hello@nestyil.com) ──────────────────
    // Fire-and-forget: we've already persisted the partner link; email
    // delivery failures should not fail the acceptance flow.
    try {
      const { data: partnerProfile } = await supabaseAdmin
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single()

      const coParentName = partnerProfile
        ? `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim()
        : ''

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          type: 'admin_co_parent_joined',
          to: 'hello@nestyil.com',
          data: {
            coParentName: coParentName || partnerProfile?.email || user.email,
            coParentEmail: partnerProfile?.email || user.email,
            primaryOwnerName: ownerName,
            primaryOwnerEmail: ownerProfile?.email || '',
            registryTitle: registry?.title || '',
            joinedDate: new Date().toLocaleDateString('he-IL'),
          },
        }),
      }).catch((err) => console.warn('admin_co_parent_joined email failed:', err?.message))
    } catch (notifyErr) {
      console.warn('admin_co_parent_joined notification error:', notifyErr)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('accept-invitation error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
