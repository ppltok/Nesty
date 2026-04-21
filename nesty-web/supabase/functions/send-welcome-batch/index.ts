import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Fruit mapping (weeks 12-40)
const FRUIT_BY_WEEK: Record<number, { name: string; emoji: string }> = {
  12: { name: 'ליים', emoji: '🍈' },
  13: { name: 'לימון', emoji: '🍋' },
  14: { name: 'תפוז', emoji: '🍊' },
  15: { name: 'אגס', emoji: '🍐' },
  16: { name: 'אבוקדו', emoji: '🥑' },
  17: { name: 'בצל', emoji: '🧅' },
  18: { name: 'מלפפון', emoji: '🥒' },
  19: { name: 'מנגו', emoji: '🥭' },
  20: { name: 'בטטה', emoji: '🍠' },
  21: { name: 'בננה', emoji: '🍌' },
  22: { name: 'פלפל אדום', emoji: '🌶️' },
  23: { name: 'אשכולית', emoji: '🍊' },
  24: { name: 'רימון', emoji: '🍎' },
  25: { name: 'חציל', emoji: '🍆' },
  26: { name: 'זוקיני', emoji: '🥒' },
  27: { name: 'כרוב', emoji: '🥬' },
  28: { name: 'חסה', emoji: '🥬' },
  29: { name: 'כרובית', emoji: '🥦' },
  30: { name: 'ברוקולי', emoji: '🥦' },
  31: { name: 'קוקוס', emoji: '🥥' },
  32: { name: 'פומלה', emoji: '🍊' },
  33: { name: 'דלורית', emoji: '🎃' },
  34: { name: 'אננס', emoji: '🍍' },
  35: { name: 'פפאיה', emoji: '🍈' },
  36: { name: 'קייל', emoji: '🥬' },
  37: { name: 'מנגולד', emoji: '🥬' },
  38: { name: 'אבטיח קטן', emoji: '🍉' },
  39: { name: 'מלון', emoji: '🍈' },
  40: { name: 'דלעת', emoji: '🎃' },
}

function calculatePregnancyWeek(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr)
  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()
  const weeksRemaining = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))
  return Math.max(12, Math.min(40, 40 - weeksRemaining))
}

// Uses the same welcome email template from send-email function
async function sendWelcomeEmail(
  email: string,
  firstName: string,
  currentWeek: number,
  fruitName: string,
  fruitEmoji: string
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!

  // Call the existing send-email function internally
  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'welcome',
      to: email,
      data: { firstName, currentWeek, fruitName, fruitEmoji },
    }),
  })

  return res.ok
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch March 2026 signups with marketing_emails = true
    const { data: users, error } = await adminClient
      .from('profiles')
      .select('id, email, first_name, due_date')
      .eq('marketing_emails', true)
      .gte('created_at', '2026-03-01T00:00:00')
      .lt('created_at', '2026-04-01T00:00:00')

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No March 2026 signups found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: Array<{ email: string; name: string; week: number; status: string }> = []

    for (const user of users) {
      const firstName = user.first_name || 'את'
      const currentWeek = user.due_date ? calculatePregnancyWeek(user.due_date) : 12
      const fruit = FRUIT_BY_WEEK[currentWeek] || FRUIT_BY_WEEK[12]

      console.log(`Sending welcome to ${user.email} (week ${currentWeek}, ${fruit.emoji} ${fruit.name})`)

      const ok = await sendWelcomeEmail(user.email, firstName, currentWeek, fruit.name, fruit.emoji)

      results.push({
        email: user.email,
        name: firstName,
        week: currentWeek,
        status: ok ? 'sent' : 'failed',
      })

      // Rate limiting: 1 second between sends
      await new Promise((r) => setTimeout(r, 1000))
    }

    const sent = results.filter((r) => r.status === 'sent').length
    const failed = results.filter((r) => r.status === 'failed').length

    return new Response(
      JSON.stringify({ success: true, total: users.length, sent, failed, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error in send-welcome-batch:', message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
