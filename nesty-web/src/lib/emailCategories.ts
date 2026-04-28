// Frontend mirror of supabase/functions/_shared/email-categories.ts.
// Keep keys + column names in sync with the Deno file — the unsubscribe edge
// function verifies against the same list.

export type EmailCategoryKey = 'weekly' | 'reminders' | 'features' | 'prices'

export interface EmailCategoryInfo {
  /** DB column on `profiles` that governs this category. */
  column: string
  label_he: string
  description_he: string
  /** Emoji shown in the UI row header. */
  emoji: string
}

export const EMAIL_CATEGORIES: Record<EmailCategoryKey, EmailCategoryInfo> = {
  weekly: {
    column: 'email_weekly_pregnancy',
    label_he: 'עדכון שבועי להריון',
    description_he: 'מעקב השבוע שלך, התפתחות התינוק ופעולות מומלצות',
    emoji: '🤰',
  },
  reminders: {
    column: 'email_engagement_reminders',
    label_he: 'תזכורות והמלצות',
    description_he: 'עידוד להוסיף פריטים, לשתף עם המשפחה וכד׳',
    emoji: '🔔',
  },
  features: {
    column: 'email_feature_announcements',
    label_he: 'עדכוני מוצר והטבות',
    description_he: "פיצ'רים חדשים, קמפיינים ומבצעים",
    emoji: '✨',
  },
  prices: {
    column: 'email_price_alerts',
    label_he: 'התראות על ירידות מחיר',
    description_he: 'כשמחיר של פריט ברשימה שלך יורד',
    emoji: '📉',
  },
}

export const CATEGORY_ORDER: EmailCategoryKey[] = ['weekly', 'reminders', 'features', 'prices']
