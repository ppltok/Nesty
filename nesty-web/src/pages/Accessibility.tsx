import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { asset } from '../lib/assets'

export default function Accessibility() {
  const lastUpdated = '3 במאי 2026'

  return (
    <div className="min-h-screen bg-[#fffbff] text-[#1d192b]" dir="rtl">
      <header className="sticky top-0 z-50 bg-[#fffbff]/80 backdrop-blur-xl border-b border-[#e7e0ec] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="חזרה לדף הבית של Nesty">
            <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-[#6750a4] hover:text-[#503e85] transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לדף הבית
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#1d192b] mb-8">הצהרת נגישות</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-[#49454f]">
          <p className="text-lg leading-relaxed">
            ב-Nesty אנחנו מאמינות ומאמינים ששירות צריך להיות נגיש לכולן ולכולם, כולל אנשים עם מוגבלות.
            אתר נגיש הוא אתר המאפשר לאנשים עם מוגבלות לגלוש בו באותה רמת יעילות והנאה כמו שאר הגולשים,
            ולעיתים תוך שימוש בטכנולוגיות מסייעות (כגון תוכנות הקראת מסך).
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">המחויבות שלנו לנגישות</h2>
            <p>
              אתר Nesty מופעל על ידי חברת באבו קפיטל בע"מ. אנחנו פועלות ופועלים להתאמת האתר
              לדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013,
              ולתקן הישראלי ת"י 5568 ברמת AA, המבוסס על הנחיות WCAG 2.0 הבינלאומיות.
            </p>
            <p>
              אנו רואות ורואים בנגישות תהליך מתמשך - ממשיכים לשפר את האתר ולהתאים אותו עבור כלל המשתמשות והמשתמשים.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">התאמות נגישות באתר</h2>
            <p>במהלך פיתוח האתר הוקדשה תשומת לב להיבטים הבאים:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>מבנה סמנטי של דפי האתר (כותרות, אזורים, רשימות) המאפשר ניווט בקוראי מסך.</li>
              <li>תמיכה בניווט מלא באמצעות מקלדת.</li>
              <li>טקסטים חלופיים (alt) לתמונות בעלות משמעות.</li>
              <li>התאמה לכיווניות מימין לשמאל (RTL) ולשפה העברית.</li>
              <li>שימוש בצבעים בעלי ניגודיות גבוהה לטקסט המרכזי.</li>
              <li>תוויות (labels) לשדות טפסים והודעות שגיאה ברורות.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">דרכים לשיפור התצוגה לאנשים עם מוגבלות</h2>
            <p>הדפדפן שלך מציע מספר כלים מובנים שיכולים לשפר את חוויית הגלישה באתר:</p>

            <h3 className="text-xl font-bold text-[#1d192b] mt-6">הגדלת טקסט ושינוי גודל</h3>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>הגדלה:</strong> Ctrl + ‎+‎ (במקינטוש: Cmd + ‎+‎)</li>
              <li><strong>הקטנה:</strong> Ctrl + ‎−‎ (במקינטוש: Cmd + ‎−‎)</li>
              <li><strong>איפוס:</strong> Ctrl + 0 (במקינטוש: Cmd + 0)</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1d192b] mt-6">שינוי צבעים, גודל גופן ופונט</h3>
            <p>
              בכל הדפדפנים המודרניים ניתן להגדיר העדפות תצוגה אישיות - גודל גופן, סוג גופן, וצבעי ברירת מחדל -
              דרך הגדרות הדפדפן (Settings / הגדרות), בתפריט "מראה" או "נגישות". ההגדרות שתבחרי יחולו על כל אתר שתבקרי בו.
            </p>

            <h3 className="text-xl font-bold text-[#1d192b] mt-6">תוכנות הקראת מסך</h3>
            <p>
              האתר תוכנן לעבוד עם תוכנות הקראת מסך נפוצות, ביניהן NVDA ו-JAWS במחשב,
              ו-VoiceOver ו-TalkBack במכשירים ניידים.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">מגבלות נגישות ידועות</h2>
            <p>
              למרות מאמצינו, ייתכן שתיתקלי בחלקים באתר שטרם הונגשו במלואם או שאינם מתפקדים בצורה מיטבית
              עם טכנולוגיות מסייעות. אנחנו פועלות ופועלים לתקן ולשפר את הנגישות באופן שוטף.
            </p>
            <p>
              אם נתקלת בבעיית נגישות באתר, נשמח לקבל ממך פנייה בהקדם - נטפל בה במהירות האפשרית.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">פנייה לרכז הנגישות</h2>
            <p>
              לפניות בנושאי נגישות, להצעות לשיפור או לדיווח על תקלות, ניתן ליצור איתנו קשר:
            </p>
            <ul className="list-none space-y-2 mr-4">
              <li><strong>שם רכז הנגישות:</strong> תום מרגוב</li>
              <li><strong>אימייל:</strong> <a href="mailto:tom@ppltok.com" className="text-[#6750a4] hover:text-[#503e85] underline">tom@ppltok.com</a></li>
              <li><strong>חברה מפעילה:</strong> באבו קפיטל בע"מ</li>
            </ul>
            <p>
              אנו מתחייבות ומתחייבים לטפל בכל פנייה בנושאי נגישות בתוך זמן סביר ולהשיב לפונה בהקדם.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">תקנים ועדכונים</h2>
            <p>
              האתר נבחן ומתעדכן באופן שוטף בהתאם לתקן הישראלי <strong>ת"י 5568</strong> ברמת AA
              ולהנחיות <strong>WCAG 2.0</strong> הבינלאומיות.
            </p>
            <p className="text-sm text-[#49454f]">
              <strong>תאריך עדכון אחרון של הצהרת הנגישות:</strong> {lastUpdated}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
