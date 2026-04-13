# Nesty Dashboard

> Internal analytics and business intelligence platform. Lives at `dashboard.nestyil.com`.

---

## What It Is

The Nesty Dashboard is an internal-only analytics platform that connects directly to the production [[Supabase]] database and Google Analytics 4. It gives the team real-time visibility into user engagement, the conversion funnel, registry economics, store/category distribution, and affiliate monetization potential.

**This is NOT the user-facing dashboard** (that's the Dashboard page in the main web app). This is the internal BI tool for the Nesty team.

---

## Why It Exists

Before this dashboard, Nesty was blind beyond signup counts. The team couldn't answer:
- Where do users drop off in the funnel?
- Which stores do users buy from? (Critical for affiliate deals)
- What's the average registry value? (Critical for monetization pitch)
- How does Chrome extension usage affect registry quality?
- What categories are most popular?

---

## The North Star Metric

> **Number of registries that received at least one gift in the last 30 days**

This captures the full value chain: signup → onboarding → add items → share → gift giver purchases. If this grows, the product is working.

---

## Architecture

**Location:** `nesty-dashboard/` in the repo
**Stack:** React + TypeScript + Vite + [[Supabase]] + [[TailwindCSS]]
**Hosting:** `dashboard.nestyil.com` (subdomain, separate deployment)
**Auth:** Google sign-in with email allowlist (internal team only)
**Data sources:** Supabase production DB (read-only) + Google Analytics 4

---

## Pages

| Page | What It Shows |
|---|---|
| **Overview** | North Star metric, key KPIs, mini funnel, trending |
| **Funnel** | 7-stage user journey with drop-off rates |
| **Growth** | User signups, retention, cohort analysis, virality |
| **People** | User browser/explorer (individual user journeys) |
| **Stores** | Store distribution by count, value, purchase rate |
| **Categories** | Category breakdown: items, value, purchase rate |
| **Economics** | Registry value, completion rate, gift metrics |
| **Extension** | Chrome extension adoption, uplift analysis |
| **Gifts** | Gift giver behavior, confirmation rates, timing |
| **Timeline** | Pregnancy-timeline view (weeks before due date) |
| **Email** | Email campaign metrics and engagement |
| **Acquisition** | User source tracking (referral_source from onboarding) |
| **Checklist** | Checklist engagement: adoption, completion, category breakdown, per-user data |
| **Price Alerts** | Price monitoring agent: drops found, savings, check logs, success rate |
| **Bug Reports** | Extraction failure reports by domain and error type |
| **Settings** | Dashboard configuration, allowlist management |
| **Login** | Google OAuth for team access |

---

## The 7-Stage Funnel

```
Stage 1: Signed Up
    ↓ (Drop-off → Onboarding friction)
Stage 2: Completed Onboarding
    ↓ (Drop-off → Don't see value yet)
Stage 3: Added First Item to Registry
    ↓ (Drop-off → Extension not installed / manual too hard)
Stage 4: Added 5+ Items
    ↓ (Drop-off → Registry feels incomplete)
Stage 5: Shared Registry Link
    ↓ (Drop-off → Not ready / doesn't know how to share)
Stage 6: Registry Viewed by Gift Giver
    ↓ (Drop-off → Gift givers don't convert)
Stage 7: Received a Gift
```

This funnel directly maps to product decisions — each drop-off points to a different intervention.

---

## Key Metrics for Affiliate Pitch

These are the numbers that sell affiliate partnerships with stores:

| Metric | What It Tells a Store Partner |
|---|---|
| Average Registry Value | Total purchase volume potential |
| Registry Completion Rate | How likely items get bought |
| Average Gift Value | Typical transaction size |
| Items from Store X | Direct relevance to the store |
| Total Value from Store X | Revenue potential |
| Gift Giver Conversion | How often viewers buy |

---

## Extension Uplift Tracking

The dashboard tracks Chrome extension impact:
- Extension install rate
- Items added via extension vs. manual/paste
- Registry size comparison: extension users vs. non-extension users
- Store distribution from extension-added items

This data proves the extension's value and guides [[Extension Platform Support Flow|which platforms to support next]].

---

## Pregnancy Timeline View

Unique to Nesty: engagement measured by "weeks before due date" instead of "days since signup." This reveals when parents are most active and helps time email campaigns and feature launches.

Data source: `profiles.due_date` combined with `items.created_at` and `purchases.created_at`.

---

## Component Structure

```
nesty-dashboard/src/
├── pages/
│   ├── OverviewPage.tsx
│   ├── FunnelPage.tsx
│   ├── GrowthPage.tsx
│   ├── PeoplePage.tsx
│   ├── StoresPage.tsx
│   ├── CategoriesPage.tsx
│   ├── EconomicsPage.tsx
│   ├── ExtensionPage.tsx
│   ├── GiftsPage.tsx
│   ├── TimelinePage.tsx
│   ├── EmailPage.tsx
│   ├── AcquisitionPage.tsx
│   ├── ChecklistAnalyticsPage.tsx
│   ├── PriceAlertsPage.tsx
│   ├── ExtractionReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── LoginPage.tsx
├── components/
│   ├── charts/      # Chart components (recharts/chart.js)
│   ├── layout/      # Dashboard layout, sidebar
│   ├── shared/      # Reusable dashboard components
│   └── ui/          # Base UI primitives
├── contexts/        # Auth and data contexts
├── hooks/           # Custom data-fetching hooks
├── lib/             # Supabase client, utils
└── types/           # Dashboard-specific types
```

---

## Relationship to Main App

The dashboard reads from the **same Supabase database** as the main Nesty web app. It does NOT write to it. This separation ensures:
- Dashboard can't accidentally modify production data
- Auth is completely separate (team allowlist vs. user auth)
- Can be deployed independently on a different subdomain

## Chart Components

The dashboard uses two reusable chart wrapper components built on Recharts:

### BarChartComponent (`components/charts/BarChartComponent.tsx`)
Supports horizontal and vertical layouts, stacked bars, angled tick labels, and HTML-based axis titles.

**Props:** `data`, `bars` (key/color/label/stackId), `height`, `layout`, `xKey`, `xAxisLabel`, `yAxisLabel`, `xTickAngle`, `xTickFormatter`

### TrendChart (`components/charts/TrendChart.tsx`)
Line chart with multiple series, data point labels (auto-hidden when >30 points), and HTML-based axis titles.

**Props:** `data`, `lines` (key/color/label), `xKey`, `height`, `xAxisLabel`, `yAxisLabel`

### Critical: Axis Label Pattern

**Always pass `xAxisLabel` and `yAxisLabel` props** when using these components. Axis titles are rendered as HTML `<div>` elements outside the SVG (not Recharts' built-in `label` prop, which gets clipped).

**Never wrap Recharts children in Fragments.** See [[Lessons Learned|L-012]] for the full story.

If a page uses direct Recharts (not the wrapper), follow the same HTML-based axis title pattern:
- Y-axis: Absolutely positioned div with `writing-mode: vertical-rl` and `rotate(180deg)`
- X-axis: Centered div below the `ResponsiveContainer`

---

See also: [[Supabase]], [[Vision and North Star]], [[Roadmap]], [[Feature Ship Log]]
