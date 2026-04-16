import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get all items with image URLs
    const { data: items, error: queryError } = await supabaseAdmin
      .from('items')
      .select('id, image_url, name, original_url, registry_id')
      .not('image_url', 'is', null)
      .limit(200)

    if (queryError) throw queryError
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ checked: 0, broken: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Checking ${items.length} item images...`)

    let broken = 0
    const brokenItems: { id: string; name: string; image_url: string }[] = []

    // Check in batches of 20
    for (let i = 0; i < items.length; i += 20) {
      const batch = items.slice(i, i + 20)

      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const res = await fetch(item.image_url!, {
              method: 'HEAD',
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NestyBot/1.0)',
              },
            })

            clearTimeout(timeoutId)

            // If HEAD is not allowed, try GET with range
            if (res.status === 405) {
              const getRes = await fetch(item.image_url!, {
                method: 'GET',
                headers: {
                  'Range': 'bytes=0-0',
                  'User-Agent': 'Mozilla/5.0 (compatible; NestyBot/1.0)',
                },
              })
              return { item, ok: getRes.ok || getRes.status === 206 }
            }

            return { item, ok: res.ok }
          } catch {
            return { item, ok: false }
          }
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled' && !result.value.ok) {
          broken++
          brokenItems.push({
            id: result.value.item.id,
            name: result.value.item.name,
            image_url: result.value.item.image_url!,
          })
        }
      }

      // Small delay between batches
      if (i + 20 < items.length) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    // Null out broken image URLs
    if (brokenItems.length > 0) {
      const brokenIds = brokenItems.map(i => i.id)
      await supabaseAdmin
        .from('items')
        .update({ image_url: null })
        .in('id', brokenIds)

      console.log(`Fixed ${brokenItems.length} broken images`)

      // Also create extraction reports for broken images
      const reports = brokenItems.map(item => ({
        url: item.image_url,
        hostname: (() => { try { return new URL(item.image_url).hostname } catch { return 'unknown' } })(),
        error_type: 'broken_image',
        item_id: item.id,
        extracted_data: { name: item.name },
      }))

      try { await supabaseAdmin.from('extraction_reports').insert(reports) } catch { /* non-blocking */ }
    }

    // Send digest email to admin if there are broken images
    if (RESEND_API_KEY && brokenItems.length > 0) {
      const itemsList = brokenItems.slice(0, 10).map(i =>
        `<li>${i.name} — <code>${i.image_url.substring(0, 60)}...</code></li>`
      ).join('')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Nesty <hello@nestyil.com>',
          to: ['hello@nestyil.com'],
          subject: `🖼️ ${brokenItems.length} broken images found and fixed`,
          html: `<div dir="rtl" style="font-family:sans-serif;">
            <h2>דוח תמונות שבורות</h2>
            <p><strong>${items.length}</strong> תמונות נבדקו, <strong style="color:red">${brokenItems.length}</strong> נמצאו שבורות ותוקנו (image_url → null).</p>
            <ul>${itemsList}</ul>
            ${brokenItems.length > 10 ? `<p>ועוד ${brokenItems.length - 10} נוספים...</p>` : ''}
          </div>`,
        }),
      })
    }

    // Also send daily extraction reports digest
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentReports } = await supabaseAdmin
      .from('extraction_reports')
      .select('hostname, error_type')
      .gte('created_at', oneDayAgo)

    if (RESEND_API_KEY && recentReports && recentReports.length > 0) {
      // Group by hostname
      const byHost: Record<string, number> = {}
      recentReports.forEach(r => {
        byHost[r.hostname] = (byHost[r.hostname] || 0) + 1
      })
      const sortedHosts = Object.entries(byHost).sort((a, b) => b[1] - a[1])
      const hostList = sortedHosts.slice(0, 15).map(([host, count]) =>
        `<li><strong>${host}</strong> — ${count} דיווחים</li>`
      ).join('')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Nesty <hello@nestyil.com>',
          to: ['hello@nestyil.com'],
          subject: `📊 ${recentReports.length} extraction reports (last 24h)`,
          html: `<div dir="rtl" style="font-family:sans-serif;">
            <h2>דוח חילוצים כושלים — 24 שעות אחרונות</h2>
            <p><strong>${recentReports.length}</strong> דיווחים מ-<strong>${sortedHosts.length}</strong> דומיינים שונים:</p>
            <ol>${hostList}</ol>
            <p><a href="https://supabase.com/dashboard/project/wopsrjfdaovlyibivijl/editor/extraction_reports">צפה בטבלה</a></p>
          </div>`,
        }),
      })
    }

    return new Response(JSON.stringify({
      checked: items.length,
      broken,
      fixed: brokenItems.length,
      extraction_reports_24h: recentReports?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('validate-images error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
