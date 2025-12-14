import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create a Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const userId = user.id

    // Create admin client to delete the user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Delete related data first (in order to respect foreign key constraints)
    // The cascade should handle most of this, but let's be explicit

    // 1. Get user's registry
    const { data: registry } = await supabaseAdmin
      .from('registries')
      .select('id')
      .eq('owner_id', userId)
      .single()

    if (registry) {
      // 2. Delete purchases related to items in this registry
      const { data: items } = await supabaseAdmin
        .from('items')
        .select('id')
        .eq('registry_id', registry.id)

      if (items && items.length > 0) {
        const itemIds = items.map(item => item.id)
        await supabaseAdmin
          .from('purchases')
          .delete()
          .in('item_id', itemIds)
      }

      // 3. Delete items
      await supabaseAdmin
        .from('items')
        .delete()
        .eq('registry_id', registry.id)

      // 4. Delete checklist preferences
      await supabaseAdmin
        .from('checklist_preferences')
        .delete()
        .eq('registry_id', registry.id)

      // 5. Delete the registry
      await supabaseAdmin
        .from('registries')
        .delete()
        .eq('id', registry.id)
    }

    // 6. Delete the profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    // 7. Delete the user from auth.users (this is the key step!)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      throw new Error('Failed to delete user account')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error deleting account:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
