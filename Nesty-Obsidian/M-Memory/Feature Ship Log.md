# Feature Ship Log

> What was built, when, and what we learned. A chronological record of shipped features.

---

## December 2024

### Universal Baby Registry (Web App) — Phase 1 MVP
**What:** Complete web application with auth, onboarding, dashboard, item management, and public registry sharing.
**Stack:** React + TypeScript + Vite + Supabase + TailwindCSS
**Key decisions:** [[Architecture Decision Log|ADR-002]] (Supabase), [[Architecture Decision Log|ADR-003]] (Trust-based purchase model)
**Outcome:** Working product at https://ppltok.github.io/Nesty

### Chrome Extension v1.0 (JSON-LD)
**What:** Chrome extension that extracts product data from any e-commerce site using JSON-LD structured data.
**Key decisions:** [[Architecture Decision Log|ADR-001]] (JSON-LD over DOM scraping), [[Architecture Decision Log|ADR-004]] (Background script session)
**Outcome:** Published on Chrome Web Store. 41KB package, ~95% extraction accuracy.

### AliExpress Platform Support
**What:** Platform-specific extractor for AliExpress, handling bundle deals, modals, and the `window.runParams` data source.
**Lesson:** [[Lessons Learned|L-007]] — Must keep extraction logic synced between web and extension.
**Key files:** `productExtraction.ts` lines 103-283, `content.js` lines 525-778

### Amazon Platform Support
**What:** Amazon-specific extraction with USD → ILS currency conversion.
**Conversion rate:** 3.19
**Key files:** Added to both `productExtraction.ts` and `content.js`

---

## 2025

### Nesty Dashboard — Internal BI Platform (In Progress)
**What:** Internal analytics dashboard at dashboard.nestyil.com. Covers: 7-stage user funnel, registry economics, store/category distribution, Chrome extension uplift, pregnancy timeline insights, gift giver behavior, and affiliate monetization data.
**Stack:** React + TypeScript + Vite + Supabase (read-only) + GA4
**Pages:** Overview, Funnel, Growth, People, Stores, Categories, Economics, Extension, Gifts, Timeline, Email, Settings
**Key metric:** North Star = "Registries that received at least one gift in last 30 days"
**Location:** `nesty-dashboard/` directory
**Status:** In development
**See:** [[Nesty Dashboard]]

### Price Agent (In Progress)
**What:** Price comparison engine for smart price alerts.
**Location:** `price-agent/` directory
**Status:** In development

---

## April 2026

### Co-Parent Registry Management — Full Feature
**Date shipped:** April 6, 2026
**PRD:** [[Co-Parent Registry Management]]
**Git commit:** `56bcdf7` — "Add co-parent registry management: invite partner, shared checklist & gifts"

**What:** Full co-parent sharing — owner invites partner by email, partner gets equal access to manage the registry, checklist, gifts, and statistics. Token-based invite with 7-day expiry. Branded Hebrew email via Resend. Automatic 24-hour nudge for pending invitations.

**User trigger:** Real user feedback — "חיפשתי פיצר שנראה לי הכרחי ולא מצאתי — קיימת דרך לצרף מייל של הורה נוסף לנהל איתי את רשימת הציוד?"

**Architecture decisions:** [[Architecture Decision Log|ADR-006]] — Single `partner_id` column over junction table. ON DELETE SET NULL preserves registry when partner leaves.

**Database changes:**
- `ALTER TABLE registries ADD COLUMN partner_id UUID` (FK → profiles, ON DELETE SET NULL)
- New table: `registry_invitations` (id, registry_id, invited_by, invited_email, status, invitation_token, expires_at)
- 4 new indexes: partner_id, invitation_token, invited_email, registry_id
- RLS policies updated on 6 tables: registries, items, purchases, checklist_preferences, contributions, price_alerts
- New RLS policies on registry_invitations
- Migration file: `supabase/migrations/20260405_co_parent_registry.sql`

**Edge Functions created (4 new):**
- `send-invitation` — Creates invitation record + sends branded Nesty email via Resend
- `accept-invitation` — Validates token, links partner_id, handles existing-registry edge case
- `nudge-invitation` — 24h reminder to invited person + notification to owner (spam tip)
- `send-feature-drop` — One-time blast to all users announcing the feature

**Frontend changes:**
- `nesty-web/src/types/index.ts` — Added `partner_id` to Registry interface, new `RegistryInvitation` type
- `nesty-web/src/contexts/AuthContext.tsx` — Two-step registry query (owner first, partner fallback), new `isRegistryOwner` flag
- `nesty-web/src/pages/Settings.tsx` — Full "שיתוף הורה נוסף" section: invite form, pending status with spam tip, partner display with remove option
- `nesty-web/src/pages/InviteAccept.tsx` — **New page** — Token validation, auth flow, accept/decline, handles: wrong account, existing registry (archive option), expired, already used
- `nesty-web/src/pages/Dashboard.tsx` — "רשימה משותפת עם [name]" indicator pill
- `nesty-web/src/pages/Checklist.tsx` — Changed all queries to use `registry.owner_id` so both parents share the same checklist
- `nesty-web/src/hooks/useStatistics.ts` — Same fix for shared checklist stats
- `nesty-web/src/App.tsx` — Added `/invite/:token` route, added to public routes list

**Extension changes:**
- `extension/final-version/content.js` — Registry query changed from `owner_id=eq.${userId}` to `or=(owner_id.eq.${userId},partner_id.eq.${userId})`

**CI/CD changes:**
- `.github/workflows/scheduled-emails.yml` — Added `nudge-invitation` step to daily cron job (runs at 10:00 Israel time)

**Email templates (Nesty design system):**
- Invitation email: Branded purple gradient, Heebo font, "מזמין/ה אותך לנהל יחד", 3 feature cards, 7-day expiry note
- Nudge email (24h): "[Owner] עדיין מחכה לך!", simplified CTA
- Owner notification: "ההזמנה עדיין ממתינה" + spam tip + resend button
- Feature drop email: "ביקשתן — קיבלתן! 💜" — sent to 25 active users on April 6, 2026

**Edge cases handled:**
- Owner clicks own invite link → "ההזמנה הזו לא בשבילך" with explanation
- Invited person already has a registry → Choice: join partner's or keep own (archive)
- Invited person has account but no registry → Seamless accept
- Invited person has no account → Sign up flow → redirect back to invite
- Invitation expired → Clear message + ask owner to resend
- Invitation already accepted → "ההזמנה כבר מומשה" + link to dashboard
- Duplicate invite to same email → Blocked with "already pending" error
- Partner removed → `partner_id` set to NULL, partner loses access, account stays

**Lessons learned:**
- [[Lessons Learned|L-008]]: PostgREST schema cache must be reloaded after DDL changes
- [[Lessons Learned|L-009]]: Resend API `to` field requires array format, not string
- [[Lessons Learned|L-010]]: `.or()` + `.maybeSingle()` conflicts with permissive public RLS policies

**Metrics to track:**
- Invitation send rate (target: >30% of owners)
- Acceptance rate (target: >70%)
- Shared registry item uplift (target: 40%+ more items)
- Partner 7-day retention (target: >50%)

### Onboarding: "How did you hear about us?"
**Date shipped:** April 7, 2026
**What:** New onboarding step 5 asking users how they discovered Nesty. Options: Facebook, Instagram, Google, TikTok, Friend Referral, Other. Data saved to `profiles.referral_source`.
**Why:** Track acquisition channels for marketing optimization. Prepared for future Google and TikTok ad campaigns.
**Key files:** `Onboarding.tsx` (new step 5), `types/index.ts` (Profile.referral_source), migration `20260407_referral_source.sql`

### Image Extraction Fixes + Extraction Reports System
**Date shipped:** April 7, 2026
**What:** 5 fixes for product image extraction:
1. `resolveUrl()` helper for relative/protocol-relative image URLs
2. Edge Function returns `finalUrl` after redirects
3. Non-product page detection (Article/BlogPosting → clear Hebrew error)
4. `onError` handlers on all item images in Dashboard + PublicRegistry
5. `extraction_reports` table + auto-reporting on extraction failures
**Key files:** `productExtraction.ts`, `extract-product/index.ts`, `validate-images/index.ts`, `Dashboard.tsx`, `PublicRegistry.tsx`
**Lessons:** [[Lessons Learned|L-008 through L-011]]

### Price Drop Agent Deployment
**Date shipped:** April 7, 2026
**What:** Daily price monitoring agent deployed. Checks up to 50 items per run, fetches live prices with exchange rate support (USD/EUR/GBP → ILS), sends branded email alerts on drops ≥5%.
**Key files:** `check-prices/index.ts` (Edge Function), `send-email/index.ts` (price_drop email type), migration `20260324_add_price_monitoring_columns.sql`
**Cron:** Daily at 10:00 IST via GitHub Actions
**Dashboard:** PriceAlertsPage in nesty-dashboard — shows drops found, total savings, check logs, success rate

### Dashboard: 3 New Pages
**Date shipped:** April 7, 2026
**What:** Added to nesty-dashboard:
1. **Extraction Reports** (`/extraction-reports`) — Bug reports table with KPIs (total, unreviewed, unique domains), error type & domain charts, sortable table with status filtering
2. **Acquisition Sources** (`/acquisition`) — "Where do users come from?" with referral_source breakdown, donut chart, conversion metrics
3. **Price Alerts** (`/price-alerts`) — Price drops found, total savings (₪), avg savings %, check success rate, logs table
**Key files:** `ExtractionReportsPage.tsx`, `AcquisitionPage.tsx`, `PriceAlertsPage.tsx`, `App.tsx`, `Sidebar.tsx`

### Git Cleanup
**Date:** April 7, 2026
**What:** Added all previously untracked project files to git: nesty-dashboard/, price-agent/, Nesty-Obsidian/, updated .gitignore for node_modules, build output, Claude worktrees, Obsidian system files.

### Dashboard: Checklist Analytics Page
**Date shipped:** April 13, 2026
**What:** New Checklist Analytics page in the internal dashboard, providing full visibility into how users interact with the pregnancy preparation checklist.

**Why:** Checklist was the #2 feature (57% adoption, 73 of 128 users) but the team had zero analytics on it. Without data, the feature wasn't being improved. This page enables data-driven decisions about checklist engagement.

**Key metrics discovered:**
- 57% adoption rate (73/128 users opened checklist)
- 55.1% average completion rate among active users
- 8.2% notes adoption (very low — product insight)
- 175 items rejected, 12 custom items added

**Page contents:**
- 4 KPI cards (Adoption, Avg Completion, Notes Adoption, Items Rejected)
- 5-stage Engagement Funnel (Total Users → Opened → Engaged 5+ → Active 10+ → Power 50%+)
- Users by Category donut chart
- Completion Distribution bar chart
- Category Completion Rates stacked bar chart (Checked vs Rejected)
- Check Activity by Day of Week bar chart
- Most Popular Items table
- Most Rejected Items table
- Custom Items word cloud
- Per-User Breakdown table

**Test account filtering:** `tom@ppltok.com` excluded from all statistics.

**Database changes:**
- Added `checked_at TIMESTAMPTZ` column to `checklist_preferences` (tracks WHEN items are checked)
- Backfilled from `updated_at` for existing records
- 3 new indexes for analytics queries
- Added public SELECT RLS policy on `checklist_preferences` (was missing — dashboard couldn't read data)
- Migration: `supabase/migrations/20260412_checklist_analytics.sql`

**Key files:** `ChecklistAnalyticsPage.tsx`, `App.tsx` (route), `Sidebar.tsx` (nav item), `nesty-web/src/pages/Checklist.tsx` (checked_at tracking)

**Lessons:** [[Lessons Learned|L-012]] — Recharts Fragment wrapping bug

### Dashboard: Bar Chart Axis Labels Fix (Global)
**Date shipped:** April 13, 2026
**What:** Fixed missing axis tick labels and titles on ALL bar charts across the entire dashboard.

**Root cause:** `BarChartComponent.tsx` wrapped `<XAxis>` and `<YAxis>` in React Fragments (`<>...</>`) inside a conditional ternary. Recharts uses `React.Children` scanning to find axis components — Fragments hide children from this scan, so axes never rendered.

**Fix applied:**
1. `BarChartComponent.tsx` — Replaced Fragment wrapping with single XAxis/YAxis using spread props for conditional configuration
2. `TrendChart.tsx` — Replaced Recharts `label` prop (clipped by SVG) with HTML-based axis title divs
3. `TimelinePage.tsx` — Converted 2 direct Recharts bar charts from `label` prop to HTML-based axis labels
4. All pages audited and verified: Overview, Funnel, Economics, Stores, Categories, Extension, Gifts, Growth, Timeline, Email, Acquisition, Checklist, Price Alerts

**Key files:** `BarChartComponent.tsx`, `TrendChart.tsx`, `TimelinePage.tsx`
**Lessons:** [[Lessons Learned|L-012]]

---

## Template

```markdown
### [Feature Name]
**What:** [Brief description]
**Stack/Tools:** [Technologies used]
**Key decisions:** [Links to ADRs]
**Lessons:** [Links to lessons learned]
**Key files:** [Primary files created/modified]
**Outcome:** [Result — metrics, status]
```

See also: [[Architecture Decision Log]], [[Lessons Learned]], [[Roadmap]]
