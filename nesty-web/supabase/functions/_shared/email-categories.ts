// Single source of truth for email preference categories.
//
// Every marketing email category is represented by:
//   - a URL-safe short key (used in token URLs and the /settings/emails UI)
//   - the profile column it maps to
//   - a Hebrew user-facing label
//   - a short description for the preferences UI
//
// The `all` entry is the master kill-switch. Clicking "הסר מרשימת תפוצה" on
// an email that doesn't match a specific category (or a future sweeping
// unsubscribe link) should use `all` to flip the master off in one shot.
//
// Keep this file in sync with the frontend mirror at
// nesty-web/src/lib/emailCategories.ts - or better, import from this file
// when Deno/Vite interop is set up. For now the list is small enough to
// duplicate safely.

export type EmailCategoryKey = 'weekly' | 'reminders' | 'features' | 'prices' | 'all'

export interface EmailCategoryInfo {
  column: string
  label_he: string
  description_he: string
}

export const EMAIL_CATEGORIES: Record<EmailCategoryKey, EmailCategoryInfo> = {
  weekly: {
    column: 'email_weekly_pregnancy',
    label_he: 'עדכון שבועי להריון',
    description_he: 'מעקב השבוע שלך, התפתחות התינוק ופעולות מומלצות',
  },
  reminders: {
    column: 'email_engagement_reminders',
    label_he: 'תזכורות והמלצות',
    description_he: 'עידוד להוסיף פריטים, לשתף עם המשפחה וכד׳',
  },
  features: {
    column: 'email_feature_announcements',
    label_he: 'עדכוני מוצר והטבות',
    description_he: "פיצ'רים חדשים, קמפיינים ומבצעים",
  },
  prices: {
    column: 'email_price_alerts',
    label_he: 'התראות על ירידות מחיר',
    description_he: 'כשמחיר של פריט ברשימה שלך יורד',
  },
  all: {
    column: 'marketing_emails',
    label_he: 'כל הדיוור השיווקי',
    description_he: 'מבטל את כל סוגי האימיילים השיווקיים בבת אחת',
  },
}

export function isValidCategory(key: string): key is EmailCategoryKey {
  return key in EMAIL_CATEGORIES
}
