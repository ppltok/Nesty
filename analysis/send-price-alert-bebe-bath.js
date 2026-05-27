/**
 * One-off price-alert campaign: Bebe אמבטיה סיליקון מתקפלת
 *
 * Usage:
 *   node analysis/send-price-alert-bebe-bath.js --preview   → writes preview HTML, no emails sent
 *   node analysis/send-price-alert-bebe-bath.js --send      → sends to all eligible users
 *
 * After --send succeeds, run this SQL in Supabase dashboard to stamp the timestamp:
 *   UPDATE items
 *     SET cheaper_alternative_url   = 'https://www.babysrus.co.il/items/7465156-...',
 *         cheaper_alternative_price = 299,
 *         cheaper_alternative_store = 'babysrus.co.il',
 *         price_alert_sent          = true,
 *         price_alert_sent_at       = NOW()
 *   WHERE name = 'Bebe אמבטיה סיליקון מתקפלת'
 *     AND store_name = 'סופר־פארם'
 *     AND (price_alert_sent = false OR price_alert_sent IS NULL);
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://wopsrjfdaovlyibivijl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHNyamZkYW92bHlpYml2aWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTgxMjMsImV4cCI6MjA4MTE5NDEyM30.x4yVBmmbKyGKylOepJwOHessCfIjVxzRvSNbyJ4VyJw';
const H = { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY };

// ── Campaign definition ───────────────────────────────────────────────────────
const CAMPAIGN = {
  productName:    'Bebe אמבטיה סיליקון מתקפלת',
  originalStore:  'סופר־פארם',
  altUrl:         'https://www.babysrus.co.il/items/7465156-%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%99%D7%AA-%D7%A1%D7%99%D7%9C%D7%99%D7%A7%D7%95%D7%9F-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C%D7%AA-%D7%A2%D7%9D-%D7%9E%D7%A2%D7%9E%D7%93-MAGIC-FOLD-%D7%A9%D7%9E%D7%A0%D7%AA-%D7%A8%D7%94%D7%99%D7%98%D7%99-%D7%A9%D7%A0%D7%99%D7%A8-?srsltid=AfmBOoo-i3bWAnRKMJlzcxe63P_V50v00awF_DmQGYlEIXhBi45BTYm6',
  altStore:       'babysrus.co.il',
  savingsIls:     50,
};

async function fetchAll(urlPath) {
  let all = [], from = 0;
  while (true) {
    const sep = urlPath.includes('?') ? '&' : '?';
    const r = await fetch(`${SUPABASE_URL}/rest/v1${urlPath}${sep}limit=1000&offset=${from}`, { headers: H });
    const d = await r.json();
    if (!Array.isArray(d)) { console.error('Unexpected response:', d); break; }
    all = all.concat(d);
    if (d.length < 1000) break;
    from += 1000;
  }
  return all;
}

async function buildRecipients() {
  const [regs, items, profiles] = await Promise.all([
    fetchAll('/registries?select=id,owner_id'),
    fetchAll('/items?select=id,registry_id,name,store_name,price,image_url,price_alert_sent'),
    fetchAll('/profiles?select=id,email,first_name,email_price_alerts'),
  ]);

  const regOwner = {};
  for (const r of regs) regOwner[r.id] = r.owner_id;

  const profileMap = {};
  for (const p of profiles) profileMap[p.id] = p;

  // Find matching items
  const matching = items.filter(i =>
    i.name === CAMPAIGN.productName &&
    i.store_name === CAMPAIGN.originalStore &&
    !i.price_alert_sent
  );

  // Deduplicate by user (one email per person even if they have 2 registries)
  const seen = new Set();
  const recipients = [];
  for (const item of matching) {
    const ownerId = regOwner[item.registry_id];
    if (!ownerId || seen.has(ownerId)) continue;
    const profile = profileMap[ownerId];
    if (!profile || !profile.email) continue;
    if (profile.email_price_alerts === false) {
      console.log(`  Skipping ${profile.email} — opted out of price alerts`);
      continue;
    }
    seen.add(ownerId);
    recipients.push({
      userId:     ownerId,
      email:      profile.email.trim(),
      firstName:  (profile.first_name || '').trim(),
      itemId:     item.id,
      price:      item.price,
      imageUrl:   item.image_url,
    });
  }
  return recipients;
}

function buildEmailPayload(recipient) {
  const altPrice = recipient.price - CAMPAIGN.savingsIls;
  const savingsPct = Math.round(CAMPAIGN.savingsIls / recipient.price * 100);
  return {
    type: 'price_drop',
    to:   recipient.email,
    data: {
      userId:    recipient.userId,
      firstName: recipient.firstName || 'את',
      drops: [{
        itemName:      CAMPAIGN.productName,
        imageUrl:      recipient.imageUrl || '',
        originalPrice: recipient.price,
        currentPrice:  String(altPrice),
        savingsPercent: savingsPct,
        productUrl:    CAMPAIGN.altUrl,
        storeName:     CAMPAIGN.altStore,
      }],
    },
  };
}

async function sendEmail(payload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ── Preview mode ─────────────────────────────────────────────────────────────
async function preview() {
  console.log('Building recipient list...');
  const recipients = await buildRecipients();
  console.log(`Found ${recipients.length} eligible recipients.`);

  if (recipients.length === 0) {
    console.log('No eligible recipients found.');
    return;
  }

  // Show the list
  console.log('\nRecipients:');
  recipients.forEach((r, i) =>
    console.log(`  ${i+1}. ${r.firstName.padEnd(10)} ${r.email}  (item ₪${r.price} → ₪${r.price - CAMPAIGN.savingsIls})`)
  );

  // Generate preview HTML using the first recipient
  const sample = recipients[0];
  const payload = buildEmailPayload(sample);

  // Call send-email with a fake "preview_only" flag — it doesn't support that,
  // so instead we just call the real edge function but redirect to ourselves.
  // For a true preview we reconstruct the price_drop email HTML locally.
  const altPrice = sample.price - CAMPAIGN.savingsIls;
  const savingsPct = Math.round(CAMPAIGN.savingsIls / sample.price * 100);
  const firstName = sample.firstName || 'את';

  const previewHtml = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Preview — Bebe Bath Price Alert</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    body { margin:0; padding:20px; background:#f5f0fa; font-family:'Heebo',sans-serif; }
    .preview-bar { background:#3b1f6b; color:#fff; padding:12px 20px; border-radius:12px; margin-bottom:24px; font-size:13px; }
    .preview-bar strong { color:#c4a0e8; }
  </style>
</head>
<body>

<div class="preview-bar">
  📧 <strong>Email Preview</strong> — Showing email as it will appear for <strong>${firstName}</strong> (${sample.email}) ·
  Campaign: <strong>${recipients.length} recipients</strong> total
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0fa;direction:rtl;">
  <tr>
    <td align="center" style="padding:40px 16px 64px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;direction:rtl;">

        <!-- HEADER -->
        <tr>
          <td style="padding-bottom:28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="https://nestyil.com" style="text-decoration:none;">
                    <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:40px;width:auto;display:block;" />
                  </a>
                </td>
                <td align="left">
                  <span style="font-size:12px;color:#a087c0;font-weight:600;letter-spacing:0.04em;">התראת מחיר 💰</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:52px 40px 48px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:24px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:64px;width:64px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:34px;font-weight:800;color:#ffffff;line-height:1.2;">
              מצאנו לך חיסכון! 💰<br/>
              <span style="font-size:22px;font-weight:400;color:#e4c8ff;">אותו מוצר, מחיר נמוך יותר</span>
            </h1>
            <p style="margin:0;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              היי ${firstName}, מצאנו את <strong style="color:#fff;">אמבטיית הסיליקון של Bebe</strong> מהרשימה שלך במחיר זול יותר. 🎉
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- PRODUCT CARD -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:28px 32px;border:1.5px solid #e8daf5;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="90" style="vertical-align:top;padding-left:20px;">
                  <img src="${sample.imageUrl}" alt="${CAMPAIGN.productName}" style="width:80px;height:80px;object-fit:cover;border-radius:14px;border:1px solid #f0e8ff;" />
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#a087c0;text-transform:uppercase;">${CAMPAIGN.altStore}</p>
                  <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#3b1f6b;line-height:1.4;">${CAMPAIGN.productName}</p>

                  <!-- Price comparison -->
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                    <tr>
                      <td style="padding-left:12px;">
                        <span style="font-size:13px;color:#a087c0;text-decoration:line-through;font-weight:500;">₪${sample.price}</span>
                      </td>
                      <td>
                        <span style="font-size:12px;color:#a087c0;padding:0 6px;">→</span>
                      </td>
                      <td>
                        <span style="font-size:20px;font-weight:800;color:#2e7d32;">₪${altPrice}</span>
                      </td>
                      <td style="padding-right:10px;">
                        <div style="display:inline-block;background:#e8f5e9;border-radius:100px;padding:4px 12px;margin-right:8px;">
                          <span style="font-size:12px;font-weight:700;color:#2e7d32;">📉 חיסכון ${savingsPct}% (₪${CAMPAIGN.savingsIls})</span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <a href="${CAMPAIGN.altUrl}" style="display:inline-block;background:linear-gradient(135deg,#2e7d32,#43a047);color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:100px;">🛒 צפי במוצר</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- SHARE TIP -->
        <tr>
          <td style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:36px;">💡</p>
            <h3 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#f5eeff;line-height:1.5;">שתפי את הדיל!</h3>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:#ffffffa6;">
              שלחי את הקישור לרשימה למשפחה ולחברים —<br/>אולי מישהו ירצה לנצל את ירידת המחיר ולקנות לך מתנה 🎁
            </p>
            <a href="https://nestyil.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">צפי ברשימה שלך</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0 0 6px;font-size:13px;color:#a087c0;">
              נשלח באהבה על ידי <strong style="color:#7c4dbd;">Nesty</strong>
            </p>
            <p style="margin:0 0 8px;font-size:11px;color:#a087c0;">
              באבו קפיטל בע"מ (Babu Capital Ltd) · יצירת קשר: <a href="mailto:hello@nestyil.com" style="color:#9070b8;">hello@nestyil.com</a>
            </p>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
              <a href="https://nestyil.com/settings/emails" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>
              &nbsp;·&nbsp;
              <a href="https://nestyil.com/privacy" style="color:#9070b8;text-decoration:underline;">מדיניות פרטיות</a>
              &nbsp;·&nbsp;
              <a href="https://nestyil.com" style="color:#9070b8;text-decoration:underline;">nestyil.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;

  const previewPath = path.join(__dirname, 'price-alert-preview.html');
  fs.writeFileSync(previewPath, previewHtml, 'utf8');
  console.log(`\n✅ Preview written to: ${previewPath}`);
  console.log('   Open it in your browser to review before sending.\n');
  console.log('When ready: node analysis/send-price-alert-bebe-bath.js --send');
}

// ── Send mode ────────────────────────────────────────────────────────────────
async function send() {
  console.log('Building recipient list...');
  const recipients = await buildRecipients();
  console.log(`Sending to ${recipients.length} recipients...\n`);

  let ok = 0, fail = 0;
  for (const r of recipients) {
    process.stdout.write(`  → ${r.firstName.padEnd(10)} ${r.email} ... `);
    try {
      const payload = buildEmailPayload(r);
      const result = await sendEmail(payload);
      if (result.success) {
        console.log('✅ sent');
        ok++;
      } else {
        console.log(`❌ failed: ${JSON.stringify(result)}`);
        fail++;
      }
    } catch (e) {
      console.log(`❌ error: ${e.message}`);
      fail++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\nDone: ${ok} sent, ${fail} failed.`);

  if (ok > 0) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANT: Run this SQL in Supabase dashboard to stamp the send timestamp:

UPDATE items
  SET cheaper_alternative_url   = '${CAMPAIGN.altUrl}',
      cheaper_alternative_price = (price - ${CAMPAIGN.savingsIls}),
      cheaper_alternative_store = '${CAMPAIGN.altStore}',
      price_alert_sent          = true,
      price_alert_sent_at       = NOW()
WHERE name = '${CAMPAIGN.productName}'
  AND store_name = '${CAMPAIGN.originalStore}'
  AND (price_alert_sent = false OR price_alert_sent IS NULL);
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const mode = process.argv[2];
if (mode === '--preview') {
  preview().catch(console.error);
} else if (mode === '--send') {
  send().catch(console.error);
} else {
  console.log('Usage:');
  console.log('  node analysis/send-price-alert-bebe-bath.js --preview');
  console.log('  node analysis/send-price-alert-bebe-bath.js --send');
}
