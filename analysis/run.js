/**
 * Nesty User Activation Analysis
 * Run: node analysis/run.js
 * Output: analysis/dashboard.html  (then open in browser)
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://wopsrjfdaovlyibivijl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHNyamZkYW92bHlpYml2aWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTgxMjMsImV4cCI6MjA4MTE5NDEyM30.x4yVBmmbKyGKylOepJwOHessCfIjVxzRvSNbyJ4VyJw';

// ── Helpers ──────────────────────────────────────────────────────────────────
const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };

async function fetchAll(path) {
  let all = [], from = 0;
  while (true) {
    const sep = path.includes('?') ? '&' : '?';
    const r = await fetch(`${SUPABASE_URL}/rest/v1${path}${sep}limit=1000&offset=${from}`, { headers: H });
    const d = await r.json();
    if (!Array.isArray(d)) { console.error('Unexpected response:', d); break; }
    all = all.concat(d);
    if (d.length < 1000) break;
    from += 1000;
  }
  return all;
}

const median = arr => { if (!arr.length) return 0; const s = [...arr].sort((a,b)=>a-b); return +s[Math.floor(s.length/2)].toFixed(1); };
const avg    = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0;
const pct    = (n, t) => t ? Math.round(n/t*100) : 0;

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchData() {
  console.log('Fetching data from Supabase...');
  const [profiles, regs, items] = await Promise.all([
    fetchAll('/profiles?select=id,created_at,first_name,due_date,feeling,is_first_time_parent,referral_source,onboarding_completed,utm_source,avatar_url,marketing_emails,checklist_nudge_sent_at,share_nudge_sent_at,admin_abandon_notified_at'),
    fetchAll('/registries?select=id,owner_id,partner_id'),
    fetchAll('/items?select=id,registry_id,created_at,store_name,name'),
  ]);
  console.log(`  profiles: ${profiles.length}, registries: ${regs.length}, items: ${items.length}`);

  const regOwner = {}, regPartner = {};
  for (const r of regs) { regOwner[r.id] = r.owner_id; if (r.partner_id) regPartner[r.owner_id] = true; }

  // item timestamps per user
  const userItemTimes = {};
  for (const p of profiles) userItemTimes[p.id] = [];
  for (const item of items) {
    const o = regOwner[item.registry_id];
    if (o) userItemTimes[o].push({ t: new Date(item.created_at).getTime(), store: (item.store_name||'unknown').trim() });
  }

  const itemCount = id => userItemTimes[id].length;
  const seg = id => itemCount(id) === 0 ? 'nonactive' : itemCount(id) < 5 ? 'newbies' : 'pros';
  const SEGS = ['nonactive','newbies','pros'];

  // ── 1. Segment totals ────────────────────────────────────────────────────
  const totals = { all: profiles.length, nonactive:0, newbies:0, pros:0 };
  for (const p of profiles) totals[seg(p.id)]++;

  // ── 2. By signup month ───────────────────────────────────────────────────
  const byMonth = {};
  for (const p of profiles) {
    const m = p.created_at.slice(0,7);
    if (!byMonth[m]) byMonth[m] = { nonactive:0, newbies:0, pros:0 };
    byMonth[m][seg(p.id)]++;
  }
  const monthKeys = Object.keys(byMonth).sort();

  // ── 3. By traffic source ─────────────────────────────────────────────────
  const sourceMap = {};
  for (const p of profiles) {
    let src = (p.utm_source || '').toLowerCase().trim();
    if (!src) src = 'direct/unknown';
    if (src === 'fb') src = 'facebook';
    if (src === 'ig') src = 'instagram';
    if (!sourceMap[src]) sourceMap[src] = { nonactive:0, newbies:0, pros:0 };
    sourceMap[src][seg(p.id)]++;
  }
  // Sort by total desc
  const sourceKeys = Object.keys(sourceMap).sort((a,b) => {
    const ta = Object.values(sourceMap[a]).reduce((x,y)=>x+y,0);
    const tb = Object.values(sourceMap[b]).reduce((x,y)=>x+y,0);
    return tb-ta;
  });

  // ── 4. Time to first item ────────────────────────────────────────────────
  const timeToFirst = { all:[], nonactive:[], newbies:[], pros:[] };
  for (const p of profiles) {
    const times = userItemTimes[p.id].map(x=>x.t).sort((a,b)=>a-b);
    if (!times.length) continue;
    const hrs = (times[0] - new Date(p.created_at).getTime()) / 3600000;
    timeToFirst.all.push(hrs);
    timeToFirst[seg(p.id)].push(hrs);
  }
  const timeBuckets = (arr) => ({
    '<1hr':   arr.filter(h=>h<1).length,
    '1-24hr': arr.filter(h=>h>=1&&h<24).length,
    '1-3d':   arr.filter(h=>h>=24&&h<72).length,
    '3-7d':   arr.filter(h=>h>=72&&h<168).length,
    '7-30d':  arr.filter(h=>h>=168).length,
  });

  // ── 5. Session spread ────────────────────────────────────────────────────
  const spreadBuckets = (segKey) => {
    const b = { 'Same day':0, '1-7 days':0, '7+ days':0 };
    for (const p of profiles) {
      if (segKey !== 'all' && seg(p.id) !== segKey) continue;
      const times = userItemTimes[p.id].map(x=>x.t).sort((a,b)=>a-b);
      if (times.length < 2) continue;
      const spread = (times[times.length-1] - times[0]) / 86400000;
      if (spread < 1) b['Same day']++;
      else if (spread < 7) b['1-7 days']++;
      else b['7+ days']++;
    }
    return b;
  };

  // ── 6. Store diversity ───────────────────────────────────────────────────
  const storeDivBuckets = (segKey) => {
    const b = { '1':0, '2':0, '3-5':0, '6+':0 };
    for (const p of profiles) {
      if (segKey !== 'all' && seg(p.id) !== segKey) continue;
      const stores = new Set(userItemTimes[p.id].map(x=>x.store.toLowerCase()));
      const n = stores.size;
      if (n === 0) continue;
      if (n === 1) b['1']++;
      else if (n === 2) b['2']++;
      else if (n <= 5) b['3-5']++;
      else b['6+']++;
    }
    return b;
  };

  // Top stores
  const storeTotals = {};
  for (const item of items) {
    const s = (item.store_name||'unknown').trim();
    storeTotals[s] = (storeTotals[s]||0) + 1;
  }
  const topStores = Object.entries(storeTotals).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // ── Top products (by distinct profiles) ─────────────────────────────────
  const productProfiles = {}; // key -> Set of profile ids
  const productMeta = {};     // key -> {name, store}
  for (const item of items) {
    const owner = regOwner[item.registry_id];
    if (!owner) continue;
    const name = (item.name || '').trim();
    const store = (item.store_name || 'unknown').trim();
    if (!name) continue;
    const key = `${store}|||${name}`;
    if (!productProfiles[key]) { productProfiles[key] = new Set(); productMeta[key] = {name, store}; }
    productProfiles[key].add(owner);
  }
  const topProducts = Object.entries(productProfiles)
    .map(([k, set]) => ({ ...productMeta[k], count: set.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // ── 7. Profile completeness ──────────────────────────────────────────────
  const profileSignals = ['onboarding_completed','due_date','feeling','partner_linked','marketing_emails'];
  const profilePct = {};
  for (const g of ['all',...SEGS]) {
    const group = profiles.filter(p => g === 'all' || seg(p.id) === g);
    const n = group.length;
    profilePct[g] = {
      onboarding_completed: pct(group.filter(p=>p.onboarding_completed).length, n),
      due_date:             pct(group.filter(p=>p.due_date).length, n),
      feeling:              pct(group.filter(p=>p.feeling).length, n),
      partner_linked:       pct(group.filter(p=>regPartner[p.id]).length, n),
      marketing_emails:     pct(group.filter(p=>p.marketing_emails).length, n),
    };
  }

  // ── 8. Onboarding funnel ─────────────────────────────────────────────────
  const funnelStep = (group, fn) => group.filter(fn).length;
  const funnelFor = (segKey) => {
    const g = segKey === 'all' ? profiles : profiles.filter(p=>seg(p.id)===segKey);
    return [
      g.length,
      funnelStep(g, p=>!!(p.first_name&&p.first_name.trim())),
      funnelStep(g, p=>!!p.due_date),
      funnelStep(g, p=>!!p.feeling),
      funnelStep(g, p=>!!p.referral_source),
      funnelStep(g, p=>!!p.onboarding_completed),
      funnelStep(g, p=>itemCount(p.id)>0),
    ];
  };

  // ── 9. Nudge & abandon email ─────────────────────────────────────────────
  const nudge = { sent:0, already_had_items:0, converted_after:0, no_items_at_all:0 };
  const abandon = { sent:0, converted_after:0, still_zero:0 };

  for (const p of profiles) {
    const times = userItemTimes[p.id].map(x=>x.t).sort((a,b)=>a-b);

    if (p.checklist_nudge_sent_at) {
      nudge.sent++;
      const nudgeT = new Date(p.checklist_nudge_sent_at).getTime();
      const before = times.filter(t=>t<=nudgeT).length;
      const after  = times.filter(t=>t>nudgeT).length;
      if (before > 0) nudge.already_had_items++;
      else if (after > 0) nudge.converted_after++;
      else nudge.no_items_at_all++;
    }

    if (p.admin_abandon_notified_at) {
      abandon.sent++;
      const aT = new Date(p.admin_abandon_notified_at).getTime();
      if (times.filter(t=>t>aT).length > 0) abandon.converted_after++;
      else abandon.still_zero++;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totals,
    byMonth, monthKeys,
    sourceMap, sourceKeys,
    timeToFirst: {
      all: timeBuckets(timeToFirst.all),
      nonactive: timeBuckets(timeToFirst.nonactive),
      newbies: timeBuckets(timeToFirst.newbies),
      pros: timeBuckets(timeToFirst.pros),
      medianHrs: median(timeToFirst.all),
      avgHrs: avg(timeToFirst.all),
      usersWithItems: timeToFirst.all.length,
    },
    spread: {
      all: spreadBuckets('all'),
      nonactive: spreadBuckets('nonactive'),
      newbies: spreadBuckets('newbies'),
      pros: spreadBuckets('pros'),
    },
    storeDiv: {
      all: storeDivBuckets('all'),
      nonactive: storeDivBuckets('nonactive'),
      newbies: storeDivBuckets('newbies'),
      pros: storeDivBuckets('pros'),
    },
    topStores,
    topProducts,
    profilePct,
    funnel: {
      all: funnelFor('all'),
      nonactive: funnelFor('nonactive'),
      newbies: funnelFor('newbies'),
      pros: funnelFor('pros'),
    },
    nudge,
    abandon,
  };
}

// ── Generate HTML ────────────────────────────────────────────────────────────
function generateHTML(d) {
  const { totals, byMonth, monthKeys, sourceMap, sourceKeys,
          timeToFirst, spread, storeDiv, topStores, topProducts, profilePct,
          funnel, nudge, abandon, generatedAt } = d;

  const monthLabels = monthKeys.map(k => {
    const [y, m] = k.split('-');
    return `${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m]} ${y}`;
  });

  // Convert object buckets to ordered arrays for charts
  const timeBucketKeys   = ['<1hr','1-24hr','1-3d','3-7d','7-30d'];
  const spreadBucketKeys = ['Same day','1-7 days','7+ days'];
  const storeDivKeys     = ['1','2','3-5','6+'];
  const storeDivLabels   = ['1 store','2 stores','3–5 stores','6+ stores'];
  const funnelLabels     = ['Signed up','Name (Step 1)','Due date (Step 2)','Feeling (Step 3)','Referral (Step 4)','Onboarding done','Added item'];

  const toArr = (obj, keys) => keys.map(k => obj[k]||0);

  // Source labels (capitalise)
  const srcLabels = sourceKeys.map(k => k.charAt(0).toUpperCase()+k.slice(1));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Nesty — User Activation Analysis</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #f8f5fb; padding: 30px; }
  h1 { color: #86608e; font-size: 20px; margin-bottom: 4px; }
  p.sub { color: #888; font-size: 12px; margin-bottom: 24px; }
  .section { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 16px rgba(134,96,142,0.1); margin-bottom: 24px; width: 500px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .section-header h2 { font-size: 14px; color: #86608e; margin: 0; }
  .collapse-btn { background: #f0ebf4; border: none; border-radius: 8px; padding: 4px 10px; font-size: 12px; color: #86608e; cursor: pointer; }
  .collapse-btn:hover { background: #e2d8ea; }
  .section-body.hidden { display: none; }
  .summary { display: flex; gap: 12px; margin-top: 16px; }
  .card { flex: 1; background: #f8f5fb; border-radius: 10px; padding: 12px; text-align: center; }
  .card .num { font-size: 22px; font-weight: bold; }
  .card .lbl { font-size: 11px; color: #888; margin-top: 2px; }
  .nonactive .num { color: #d9534f; } .newbies .num { color: #f0a500; } .pros .num { color: #5cb85c; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  th { background: #f0ebf4; color: #86608e; padding: 7px 10px; text-align: left; white-space: nowrap; }
  td { padding: 6px 10px; border-bottom: 1px solid #f0ebf4; white-space: nowrap; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf7fc; }
  td.num-cell { text-align: right; font-weight: bold; }
  td.pct-cell { text-align: right; color: #aaa; font-size: 11px; }
  .dim { opacity: 0.25; }
  .inline-filter { background: white; border: 1.5px solid #86608e; border-radius: 8px; padding: 3px 8px; font-size: 11px; color: #86608e; cursor: pointer; outline: none; }
  .note { font-size: 11px; color: #999; margin: 0 0 10px; }
</style>
</head>
<body>
<h1>Nesty — User Activation Analysis</h1>
<p class="sub">
  ${totals.all} total users · generated ${new Date(generatedAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})} ·
  <span style="color:#d9534f;font-weight:bold">Nonactive</span> (0 items) ·
  <span style="color:#f0a500;font-weight:bold">Newbies</span> (1–4 items) ·
  <span style="color:#5cb85c;font-weight:bold">Pros</span> (5+ items)
</p>

<!-- 1. By Month -->
<div class="section">
  <div class="section-header"><h2>Distribution by Signup Month</h2><button class="collapse-btn" onclick="toggle('m1')">Hide</button></div>
  <div class="section-body" id="m1">
    <canvas id="monthChart" height="260"></canvas>
    <div class="summary">
      <div class="card nonactive"><div class="num">${totals.nonactive}</div><div class="lbl">Nonactive (${pct(totals.nonactive,totals.all)}%)</div></div>
      <div class="card newbies"><div class="num">${totals.newbies}</div><div class="lbl">Newbies (${pct(totals.newbies,totals.all)}%)</div></div>
      <div class="card pros"><div class="num">${totals.pros}</div><div class="lbl">Pros (${pct(totals.pros,totals.all)}%)</div></div>
    </div>
  </div>
</div>

<!-- 2. Monthly table -->
<div class="section">
  <div class="section-header"><h2>Monthly Data Table</h2><button class="collapse-btn" onclick="toggle('m2')">Hide</button></div>
  <div class="section-body" id="m2">
    <table>
      <thead><tr><th>Month</th><th>Total</th><th style="color:#d9534f">Nonactive</th><th style="color:#d9534f">%</th><th style="color:#f0a500">Newbies</th><th style="color:#f0a500">%</th><th style="color:#5cb85c">Pros</th><th style="color:#5cb85c">%</th></tr></thead>
      <tbody>${monthKeys.map((k,i) => {
        const row = byMonth[k];
        const t = row.nonactive+row.newbies+row.pros;
        return `<tr><td>${monthLabels[i]}</td><td class="num-cell">${t}</td><td class="num-cell" style="color:#d9534f">${row.nonactive}</td><td class="pct-cell">${pct(row.nonactive,t)}%</td><td class="num-cell" style="color:#f0a500">${row.newbies}</td><td class="pct-cell">${pct(row.newbies,t)}%</td><td class="num-cell" style="color:#5cb85c">${row.pros}</td><td class="pct-cell">${pct(row.pros,t)}%</td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>
</div>

<!-- 3. By Source -->
<div class="section">
  <div class="section-header"><h2>Distribution by Traffic Source</h2><button class="collapse-btn" onclick="toggle('m3')">Hide</button></div>
  <div class="section-body" id="m3"><canvas id="sourceChart" height="260"></canvas></div>
</div>

<!-- 4. Source table -->
<div class="section">
  <div class="section-header"><h2>Traffic Source Data Table</h2><button class="collapse-btn" onclick="toggle('m4')">Hide</button></div>
  <div class="section-body" id="m4">
    <table>
      <thead><tr><th>Source</th><th>Total</th><th style="color:#d9534f">Nonactive</th><th style="color:#d9534f">%</th><th style="color:#f0a500">Newbies</th><th style="color:#f0a500">%</th><th style="color:#5cb85c">Pros</th><th style="color:#5cb85c">%</th></tr></thead>
      <tbody>${sourceKeys.map((k,i) => {
        const row = sourceMap[k];
        const t = row.nonactive+row.newbies+row.pros;
        return `<tr><td>${srcLabels[i]}</td><td class="num-cell">${t}</td><td class="num-cell" style="color:#d9534f">${row.nonactive}</td><td class="pct-cell">${pct(row.nonactive,t)}%</td><td class="num-cell" style="color:#f0a500">${row.newbies}</td><td class="pct-cell">${pct(row.newbies,t)}%</td><td class="num-cell" style="color:#5cb85c">${row.pros}</td><td class="pct-cell">${pct(row.pros,t)}%</td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>
</div>

<!-- 5. Onboarding funnel -->
<div class="section">
  <div class="section-header">
    <h2>Onboarding Drop-off Funnel</h2>
    <div style="display:flex;gap:8px;align-items:center">
      <select class="inline-filter" onchange="updateFunnelChart(this.value)">
        <option value="all">All</option><option value="nonactive">Nonactive</option><option value="newbies">Newbies</option><option value="pros">Pros</option>
      </select>
      <button class="collapse-btn" onclick="toggle('m5')">Hide</button>
    </div>
  </div>
  <div class="section-body" id="m5"><canvas id="funnelChart" height="260"></canvas></div>
</div>

<!-- 6. Profile completeness -->
<div class="section">
  <div class="section-header">
    <h2>Profile Completeness Signals</h2>
    <div style="display:flex;gap:8px;align-items:center">
      <select class="inline-filter" onchange="updateProfileChart(this.value)">
        <option value="all">All segments</option><option value="nonactive">Nonactive</option><option value="newbies">Newbies</option><option value="pros">Pros</option>
      </select>
      <button class="collapse-btn" onclick="toggle('m6')">Hide</button>
    </div>
  </div>
  <div class="section-body" id="m6">
    <p class="note">% of users in each segment with each signal. Avatar not shown — 0% across all groups.</p>
    <canvas id="profileChart" height="260"></canvas>
  </div>
</div>

<!-- 7. Store diversity -->
<div class="section">
  <div class="section-header">
    <h2>Store Diversity — Stores per User</h2>
    <div style="display:flex;gap:8px;align-items:center">
      <select class="inline-filter" onchange="updateStoreDivChart(this.value)">
        <option value="all">All</option><option value="nonactive">Nonactive</option><option value="newbies">Newbies</option><option value="pros">Pros</option>
      </select>
      <button class="collapse-btn" onclick="toggle('m7')">Hide</button>
    </div>
  </div>
  <div class="section-body" id="m7">
    <p class="note">Among users who added at least 1 item.</p>
    <canvas id="storeDivChart" height="220"></canvas>
  </div>
</div>

<!-- 8. Top stores -->
<div class="section">
  <div class="section-header"><h2>Top 10 Stores by Items Added</h2><button class="collapse-btn" onclick="toggle('m8')">Hide</button></div>
  <div class="section-body" id="m8"><canvas id="topStoresChart" height="300"></canvas></div>
</div>

<!-- 8b. Top products -->
<div class="section" style="width:700px">
  <div class="section-header"><h2>Top 20 Products by Unique Profiles</h2><button class="collapse-btn" onclick="toggle('m8b')">Hide</button></div>
  <div class="section-body" id="m8b">
    <p class="note">Each row = a unique store+product combo. Count = distinct families who added it.</p>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Store</th><th style="text-align:right">Profiles</th><th style="text-align:right">% of all users</th></tr></thead>
      <tbody>${topProducts.map((p,i) => `<tr>
        <td>${i+1}</td>
        <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.name.replace(/"/g,'&quot;')}">${p.name}</td>
        <td style="color:#888;font-size:11px">${p.store}</td>
        <td class="num-cell">${p.count}</td>
        <td class="pct-cell">${pct(p.count, totals.all)}%</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>
</div>

<!-- 9. Time to first item -->
<div class="section">
  <div class="section-header">
    <h2>Time from Signup to First Item Added</h2>
    <div style="display:flex;gap:8px;align-items:center">
      <select class="inline-filter" onchange="updateTimeChart(this.value)">
        <option value="all">All</option><option value="nonactive">Nonactive</option><option value="newbies">Newbies</option><option value="pros">Pros</option>
      </select>
      <button class="collapse-btn" onclick="toggle('m9')">Hide</button>
    </div>
  </div>
  <div class="section-body" id="m9">
    <canvas id="timeChart" height="220"></canvas>
    <div class="summary" style="margin-top:16px">
      <div class="card"><div class="num" style="color:#86608e;font-size:18px">${timeToFirst.medianHrs} hrs</div><div class="lbl">Median time to first item</div></div>
      <div class="card"><div class="num" style="color:#86608e;font-size:18px">${timeToFirst.avgHrs} hrs</div><div class="lbl">Average (skewed by outliers)</div></div>
      <div class="card"><div class="num" style="color:#86608e;font-size:18px">${timeToFirst.usersWithItems}</div><div class="lbl">Users who added ≥1 item</div></div>
    </div>
  </div>
</div>

<!-- 10. Session spread -->
<div class="section">
  <div class="section-header">
    <h2>Days Between First & Last Item (Session Spread)</h2>
    <div style="display:flex;gap:8px;align-items:center">
      <select class="inline-filter" onchange="updateSpreadChart(this.value)">
        <option value="all">All</option><option value="nonactive">Nonactive</option><option value="newbies">Newbies</option><option value="pros">Pros</option>
      </select>
      <button class="collapse-btn" onclick="toggle('m10')">Hide</button>
    </div>
  </div>
  <div class="section-body" id="m10">
    <p class="note">Among users who added 2+ items — proxy for how many sessions it took.</p>
    <canvas id="spreadChart" height="220"></canvas>
  </div>
</div>

<!-- 11. Nudge email -->
<div class="section">
  <div class="section-header"><h2>Checklist Nudge Email — Effect on Activity</h2><button class="collapse-btn" onclick="toggle('m11')">Hide</button></div>
  <div class="section-body" id="m11">
    <p class="note">${nudge.sent} users received this email. Did they add items after receiving it?</p>
    <canvas id="nudgeChart" height="200"></canvas>
    <div class="summary" style="margin-top:16px">
      <div class="card" style="background:#fff3cd"><div class="num" style="color:#856404;font-size:18px">${nudge.already_had_items}</div><div class="lbl">Already had items (mis-targeted)</div></div>
      <div class="card" style="background:#f8d7da"><div class="num" style="color:#842029;font-size:18px">${nudge.no_items_at_all}</div><div class="lbl">Still 0 items after email</div></div>
      <div class="card" style="background:#d1e7dd"><div class="num" style="color:#0f5132;font-size:18px">${nudge.converted_after}</div><div class="lbl">Converted after email</div></div>
    </div>
  </div>
</div>

<!-- 12. Abandon email -->
<div class="section">
  <div class="section-header"><h2>Abandon Email — Effect on Activity</h2><button class="collapse-btn" onclick="toggle('m12')">Hide</button></div>
  <div class="section-body" id="m12">
    <p class="note">${abandon.sent} users received this email — ${abandon.sent < 10 ? 'small sample, directional only.' : ''}</p>
    <canvas id="abandonChart" height="200"></canvas>
    <div class="summary" style="margin-top:16px">
      <div class="card" style="background:#d1e7dd"><div class="num" style="color:#0f5132;font-size:18px">${abandon.converted_after}</div><div class="lbl">Converted after email</div></div>
      <div class="card" style="background:#f8d7da"><div class="num" style="color:#842029;font-size:18px">${abandon.still_zero}</div><div class="lbl">Still 0 items after email</div></div>
    </div>
  </div>
</div>

<script>
const C = { nonactive:'#d9534f', newbies:'#f0a500', pros:'#5cb85c' };

function toggle(id) {
  const el = document.getElementById(id);
  const hidden = el.classList.toggle('hidden');
  el.previousElementSibling.querySelector('.collapse-btn').textContent = hidden ? 'Show' : 'Hide';
}

function pctLabel(value, ctx) {
  const total = ctx.chart.data.datasets.reduce((s,ds)=>s+(ds.data[ctx.dataIndex]||0),0);
  if (!total || value/total < 0.07) return '';
  return Math.round(value/total*100)+'%';
}

function doughnutPctLabel(value, ctx) {
  const total = ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
  return total && value > 0 ? Math.round(value/total*100)+'%' : '';
}

function barAbovePct(value, ctx) {
  const total = ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
  return total ? Math.round(value/total*100)+'%' : '';
}

// ── 1. Month chart ──
const monthRaw = ${JSON.stringify(monthKeys.map(k => byMonth[k]))};
const monthLabels = ${JSON.stringify(monthLabels)};
new Chart(document.getElementById('monthChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:monthLabels, datasets:[
    {label:'Nonactive', data:monthRaw.map(r=>r.nonactive), backgroundColor:C.nonactive, borderRadius:3},
    {label:'Newbies',   data:monthRaw.map(r=>r.newbies),   backgroundColor:C.newbies,   borderRadius:3},
    {label:'Pros',      data:monthRaw.map(r=>r.pros),      backgroundColor:C.pros,      borderRadius:3},
  ]},
  options:{responsive:true, plugins:{legend:{position:'top',labels:{font:{size:11}}}, datalabels:{color:'#fff',font:{size:10,weight:'bold'},formatter:pctLabel}},
    scales:{x:{stacked:true},y:{stacked:true,title:{display:true,text:'Users',font:{size:11}}}}}
});

// ── 2. Source chart ──
const sourceRaw = ${JSON.stringify(sourceKeys.map(k => sourceMap[k]))};
const srcLabels = ${JSON.stringify(srcLabels)};
new Chart(document.getElementById('sourceChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:srcLabels, datasets:[
    {label:'Nonactive', data:sourceRaw.map(r=>r.nonactive), backgroundColor:C.nonactive, borderRadius:3},
    {label:'Newbies',   data:sourceRaw.map(r=>r.newbies),   backgroundColor:C.newbies,   borderRadius:3},
    {label:'Pros',      data:sourceRaw.map(r=>r.pros),      backgroundColor:C.pros,      borderRadius:3},
  ]},
  options:{responsive:true, plugins:{legend:{position:'top',labels:{font:{size:11}}}, datalabels:{color:'#fff',font:{size:10,weight:'bold'},formatter:pctLabel}},
    scales:{x:{stacked:true},y:{stacked:true,title:{display:true,text:'Users',font:{size:11}}}}}
});

// ── 3. Funnel chart ──
const funnelData = ${JSON.stringify({ all:funnel.all, nonactive:funnel.nonactive, newbies:funnel.newbies, pros:funnel.pros })};
const funnelLabels = ${JSON.stringify(funnelLabels)};
const funnelSegColors = {all:'#86608e', nonactive:C.nonactive, newbies:C.newbies, pros:C.pros};

function funnelBgColors(data, seg) {
  return data.map((v,i,arr) => i===0 ? funnelSegColors[seg] : (arr[i-1]-v)/arr[0] > 0.08 ? '#d9534f' : funnelSegColors[seg]);
}
const funnelChart = new Chart(document.getElementById('funnelChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:funnelLabels, datasets:[{label:'Users', data:funnelData.all, backgroundColor:funnelBgColors(funnelData.all,'all'), borderRadius:4}] },
  options:{responsive:true,plugins:{legend:{display:false},
    datalabels:{anchor:'end',align:'end',color:'#444',font:{size:9,weight:'bold'},
      formatter(value,ctx){
        const data=ctx.chart.data.datasets[0].data;
        const p=Math.round(value/data[0]*100)+'%';
        if(ctx.dataIndex===0) return value+' (100%)';
        const drop=Math.round((data[ctx.dataIndex-1]-value)/data[ctx.dataIndex-1]*100);
        return value+' ('+p+')'+(drop>0?'\\n-'+drop+'%':'');
      }}},
    scales:{x:{ticks:{font:{size:10}}},y:{title:{display:true,text:'Users',font:{size:11}}}},layout:{padding:{top:24}}}
});
function updateFunnelChart(seg) {
  funnelChart.data.datasets[0].data = funnelData[seg];
  funnelChart.data.datasets[0].backgroundColor = funnelBgColors(funnelData[seg], seg);
  funnelChart.update();
}

// ── 4. Profile chart ──
const profileData = ${JSON.stringify({ nonactive: Object.values(profilePct.nonactive), newbies: Object.values(profilePct.newbies), pros: Object.values(profilePct.pros) })};
const profileLabels = ['Onboarding\\ncompleted','Due date\\nset','Feeling\\nfilled','Partner\\nlinked','Marketing\\nemails on'];
const profileChart = new Chart(document.getElementById('profileChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:profileLabels, datasets:[
    {label:'Nonactive', data:profileData.nonactive, backgroundColor:C.nonactive+'cc', borderRadius:3},
    {label:'Newbies',   data:profileData.newbies,   backgroundColor:C.newbies+'cc',   borderRadius:3},
    {label:'Pros',      data:profileData.pros,       backgroundColor:C.pros+'cc',      borderRadius:3},
  ]},
  options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11}}},
    datalabels:{anchor:'end',align:'end',color:'#444',font:{size:9,weight:'bold'},formatter:v=>v+'%',display:ctx=>ctx.dataset.data[ctx.dataIndex]>0}},
    scales:{x:{ticks:{font:{size:10}}},y:{min:0,max:110,title:{display:true,text:'% of segment',font:{size:11}},ticks:{callback:v=>v+'%'}}}}
});
function updateProfileChart(seg) {
  profileChart.data.datasets.forEach((ds,i) => ds.hidden = seg!=='all' && ['nonactive','newbies','pros'][i]!==seg);
  profileChart.update();
}

// ── 5. Store diversity chart ──
const storeDivData = ${JSON.stringify({ all: toArr(storeDiv.all, storeDivKeys), nonactive: toArr(storeDiv.nonactive, storeDivKeys), newbies: toArr(storeDiv.newbies, storeDivKeys), pros: toArr(storeDiv.pros, storeDivKeys) })};
const storeDivLabels = ${JSON.stringify(storeDivLabels)};
let currentStoreSeg = 'all';

function storeDivFormatter(value,ctx) {
  if(!value) return '';
  if(currentStoreSeg==='all'){
    const colTotal=ctx.chart.data.datasets.reduce((s,ds)=>s+(ds.data[ctx.dataIndex]||0),0);
    if(!colTotal||value/colTotal<0.07) return '';
    return Math.round(value/colTotal*100)+'%';
  } else {
    const segTotal=ctx.dataset.data.reduce((a,b)=>a+b,0);
    if(!segTotal||value/segTotal<0.04) return '';
    return Math.round(value/segTotal*100)+'%';
  }
}
const storeDivChart = new Chart(document.getElementById('storeDivChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:storeDivLabels, datasets:[
    {label:'Nonactive', data:[...storeDivData.nonactive], backgroundColor:C.nonactive, borderRadius:3},
    {label:'Newbies',   data:[...storeDivData.newbies],   backgroundColor:C.newbies,   borderRadius:3},
    {label:'Pros',      data:[...storeDivData.pros],       backgroundColor:C.pros,      borderRadius:3},
  ]},
  options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11}}},datalabels:{color:'#fff',font:{size:10,weight:'bold'},formatter:storeDivFormatter}},
    scales:{x:{stacked:true},y:{stacked:true,title:{display:true,text:'Users',font:{size:11}}}}}
});
function updateStoreDivChart(seg) {
  currentStoreSeg = seg;
  storeDivChart.data.datasets[0].data = seg==='nonactive'||seg==='all' ? [...storeDivData.nonactive] : [0,0,0,0];
  storeDivChart.data.datasets[1].data = seg==='newbies'||seg==='all'   ? [...storeDivData.newbies]   : [0,0,0,0];
  storeDivChart.data.datasets[2].data = seg==='pros'||seg==='all'       ? [...storeDivData.pros]     : [0,0,0,0];
  storeDivChart.update();
}

// ── 6. Top stores ──
const topStoreData = ${JSON.stringify(topStores)};
new Chart(document.getElementById('topStoresChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:topStoreData.map(s=>s[0]), datasets:[{label:'Items', data:topStoreData.map(s=>s[1]), backgroundColor:'#86608e', borderRadius:4}] },
  options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false},
    datalabels:{anchor:'end',align:'end',color:'#555',font:{size:10,weight:'bold'},
      formatter(v,ctx){const t=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);return v+' ('+Math.round(v/t*100)+'%)'}}},
    scales:{x:{title:{display:true,text:'Items added',font:{size:11}}},y:{ticks:{font:{size:11}}}},layout:{padding:{right:60}}}
});

// ── 7. Time to first item ──
const timeData = ${JSON.stringify({ all: toArr(timeToFirst.all, timeBucketKeys), nonactive: [0,0,0,0,0], newbies: toArr(timeToFirst.newbies, timeBucketKeys), pros: toArr(timeToFirst.pros, timeBucketKeys) })};
const timeBucketLabels = ['< 1 hour','1–24 hours','1–3 days','3–7 days','7–30 days'];
const timeColors = {all:'#86608e', nonactive:C.nonactive, newbies:C.newbies, pros:C.pros};
const timeChart = new Chart(document.getElementById('timeChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:timeBucketLabels, datasets:[{label:'Users', data:timeData.all, backgroundColor:'#86608e', borderRadius:4}] },
  options:{responsive:true,plugins:{legend:{display:false},
    datalabels:{anchor:'end',align:'end',color:'#555',font:{size:10,weight:'bold'},formatter:barAbovePct}},
    scales:{x:{title:{display:true,text:'Time since signup',font:{size:11}}},y:{title:{display:true,text:'Users',font:{size:11}}}}}
});
function updateTimeChart(seg) {
  timeChart.data.datasets[0].data = [...timeData[seg]];
  timeChart.data.datasets[0].backgroundColor = timeColors[seg];
  timeChart.update();
}

// ── 8. Session spread ──
const spreadData = ${JSON.stringify({ all: toArr(spread.all, spreadBucketKeys), nonactive: [0,0,0], newbies: toArr(spread.newbies, spreadBucketKeys), pros: toArr(spread.pros, spreadBucketKeys) })};
const spreadBucketLabels = ['Same day','1–7 days','7+ days'];
const spreadColors = {all:'#86608e', nonactive:C.nonactive, newbies:C.newbies, pros:C.pros};
const spreadChart = new Chart(document.getElementById('spreadChart'), {
  type:'bar', plugins:[ChartDataLabels],
  data:{ labels:spreadBucketLabels, datasets:[{label:'Users', data:spreadData.all, backgroundColor:'#86608e', borderRadius:4}] },
  options:{responsive:true,plugins:{legend:{display:false},
    datalabels:{anchor:'end',align:'end',color:'#555',font:{size:10,weight:'bold'},formatter:barAbovePct}},
    scales:{x:{title:{display:true,text:'Days between first and last item',font:{size:11}}},y:{title:{display:true,text:'Users',font:{size:11}}}}}
});
function updateSpreadChart(seg) {
  spreadChart.data.datasets[0].data = [...spreadData[seg]];
  spreadChart.data.datasets[0].backgroundColor = spreadColors[seg];
  spreadChart.update();
}

// ── 9. Nudge email ──
new Chart(document.getElementById('nudgeChart'), {
  type:'doughnut', plugins:[ChartDataLabels],
  data:{ labels:['Already had items (mis-targeted)','Still 0 items after email','Converted after email'],
    datasets:[{data:[${nudge.already_had_items},${nudge.no_items_at_all},${nudge.converted_after}], backgroundColor:['#f0a500','#d9534f','#5cb85c'], borderWidth:2}] },
  options:{responsive:true,plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:14}},
    datalabels:{color:'#fff',font:{size:12,weight:'bold'},formatter:doughnutPctLabel}}}
});

// ── 10. Abandon email ──
new Chart(document.getElementById('abandonChart'), {
  type:'doughnut', plugins:[ChartDataLabels],
  data:{ labels:['Converted after email','Still 0 items after email'],
    datasets:[{data:[${abandon.converted_after},${abandon.still_zero}], backgroundColor:['#5cb85c','#d9534f'], borderWidth:2}] },
  options:{responsive:true,plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:14}},
    datalabels:{color:'#fff',font:{size:12,weight:'bold'},formatter:doughnutPctLabel}}}
});
</script>
</body>
</html>`;
}

// Helper used inside the template
function toArr(obj, keys) { return keys.map(k => obj[k]||0); }

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    const data = await fetchData();
    const html = generateHTML(data);
    const outPath = path.join(__dirname, 'dashboard.html');
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`\nDone! Dashboard written to:\n  ${outPath}`);
    console.log(`\nOpen in browser: start ${outPath}`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
