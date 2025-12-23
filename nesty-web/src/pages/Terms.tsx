import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { asset } from '../lib/assets'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#fffbff] text-[#1d192b]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fffbff]/80 backdrop-blur-xl border-b border-[#e7e0ec] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#1d192b] mb-8">תנאי שימוש</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-[#49454f]">
          <p className="text-lg leading-relaxed">
            ברוכים הבאים ל-Nesty! תנאי שימוש אלה מסדירים את השימוש שלכם באתר ובשירותים שלנו.
            אנא קראו תנאים אלה בעיון לפני השימוש באתר.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">1. הגדרות</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>"החברה"</strong> - באבו קפיטל בע"מ, המפעילה את אתר Nesty</li>
              <li><strong>"האתר"</strong> - אתר האינטרנט nestyil.com המופעל על ידי החברה</li>
              <li><strong>"השירות"</strong> - שירות ניהול רשימות מתנות לתינוקות המוצע באתר</li>
              <li><strong>"משתמש"</strong> - כל אדם הגולש או משתמש באתר ו/או בשירות</li>
              <li><strong>"רשימה"</strong> - רשימת מתנות שנוצרה על ידי משתמש רשום</li>
              <li><strong>"נותן מתנה"</strong> - אדם הצופה ברשימה ומעוניין לרכוש מתנה</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">2. קבלת התנאים</h2>
            <p>
              בשימוש באתר Nesty, אתם מסכימים לתנאי שימוש אלה במלואם. אם אינכם מסכימים לתנאים,
              אנא הימנעו משימוש באתר. תנאים אלה מהווים הסכם מחייב בינכם לבין Nesty.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">3. תיאור השירות</h2>
            <p>
              Nesty היא פלטפורמה חינמית לניהול רשימות מתנות לתינוקות. השירות מאפשר:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>יצירת רשימות מתנות מותאמות אישית</li>
              <li>הוספת מוצרים מכל חנות באינטרנט באמצעות תוסף כרום</li>
              <li>שיתוף הרשימה עם חברים ומשפחה</li>
              <li>קבלת התראות על מתנות שנרכשו</li>
              <li>ניהול ומעקב אחר המתנות ברשימה</li>
            </ul>
            <p className="mt-4">
              <strong>חשוב:</strong> Nesty אינה חנות ואינה מוכרת מוצרים. האתר מהווה פלטפורמה לניהול רשימות בלבד.
              כל רכישה מתבצעת ישירות מול החנויות השונות, ותנאי הרכישה, האחריות והביטול הם בהתאם לתנאי אותה חנות.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">4. הרשמה וחשבון משתמש</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>עליכם לספק מידע מדויק ועדכני בעת ההרשמה</li>
              <li>אתם אחראים לשמירה על סודיות פרטי הגישה שלכם (סיסמה ופרטי התחברות)</li>
              <li>עליכם להיות בני 18 ומעלה לשימוש בשירות</li>
              <li>אתם אחראים לכל הפעילות המתבצעת תחת החשבון שלכם</li>
              <li>יש להודיע לנו מיד על כל שימוש בלתי מורשה בחשבון</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">5. שימוש מותר והתחייבויות המשתמש</h2>
            <p>בשימוש בשירות, אתם מתחייבים:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>לא להעלות תוכן פוגעני, בלתי חוקי, מאיים, גזעני, משמיץ או פורנוגרפי</li>
              <li>לא לפגוע בפרטיות של אחרים או לאסוף מידע עליהם ללא הסכמה</li>
              <li>לא לנסות לפרוץ, לשבש או להפריע למערכות האתר</li>
              <li>לא להשתמש בשירות למטרות מסחריות ללא אישור מראש ובכתב</li>
              <li>לא להתחזות לאדם או גוף אחר</li>
              <li>לא להפר זכויות קניין רוחני של צדדים שלישיים</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">6. רכישת מתנות</h2>
            <p>
              כאשר נותן מתנה מסמן שרכש פריט מהרשימה:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>הרכישה מתבצעת ישירות מהחנות בה נמכר המוצר</li>
              <li>Nesty אינה צד לעסקה ואינה אחראית לתהליך הרכישה, המשלוח, או האחריות על המוצר</li>
              <li>ביטולים, החזרות ותביעות יש להפנות ישירות לחנות בה בוצעה הרכישה</li>
              <li>על רכישות מחנויות ישראליות חל חוק הגנת הצרכן, התשמ"א-1981</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">7. קניין רוחני</h2>
            <p>
              כל הזכויות בתוכן האתר, העיצוב, הלוגו, הקוד, והמותג "Nesty" שייכות ל-Nesty ומוגנות
              בחוקי זכויות יוצרים ובאמנות בינלאומיות. אין להעתיק, להפיץ, לשכפל או לעשות שימוש מסחרי
              בתוכן ללא אישור מראש ובכתב.
            </p>
            <p className="mt-4">
              תוכן שמעלים משתמשים (כגון תמונות מוצרים) נשאר בבעלותם, אך בהעלאתו לאתר הם מעניקים
              ל-Nesty רישיון שימוש לא בלעדי לצורך הפעלת השירות.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">8. הגבלת אחריות</h2>
            <p>
              השירות מסופק "כמות שהוא" (AS IS) ו"כפי שזמין" (AS AVAILABLE). Nesty אינה אחראית:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>לנזקים ישירים או עקיפים הנובעים משימוש או אי-יכולת לעשות שימוש בשירות</li>
              <li>לאובדן מידע, הפרעות בשירות או תקלות טכניות</li>
              <li>לתוכן, איכות או זמינות של מוצרים ברשימות</li>
              <li>לעסקאות שבוצעו בין משתמשים לבין חנויות צד שלישי</li>
              <li>למידע שגוי שהוזן על ידי משתמשים</li>
            </ul>
            <p className="mt-4">
              בכל מקרה, אחריות Nesty לא תעלה על הסכום ששילמתם עבור השירות (כיום: חינם).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">9. שיפוי</h2>
            <p>
              אתם מסכימים לשפות את Nesty, עובדיה ושותפיה מפני כל תביעה, נזק, הוצאה או אובדן
              הנובעים משימושכם באתר, מהפרת תנאי שימוש אלה, או מהפרת זכויות צד שלישי.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">10. שינויים בתנאים ובשירות</h2>
            <p>
              Nesty שומרת לעצמה את הזכות לעדכן תנאים אלה או לשנות את השירות בכל עת.
              שינויים מהותיים יפורסמו באתר ו/או ישלחו בהודעה למשתמשים רשומים. המשך השימוש
              לאחר השינויים מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">11. סיום השירות</h2>
            <p>
              Nesty רשאית להפסיק או להשעות את הגישה שלכם לשירות בכל עת, במיוחד במקרה של הפרת תנאי השימוש.
              אתם רשאים למחוק את חשבונכם בכל עת דרך הגדרות החשבון.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">12. דין חל וסמכות שיפוט</h2>
            <p>
              על תנאי שימוש אלה יחולו דיני מדינת ישראל בלבד. לבתי המשפט המוסמכים במחוז תל אביב-יפו
              תהא סמכות השיפוט הבלעדית בכל סכסוך הנוגע לתנאים אלה או לשימוש באתר.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">13. יצירת קשר</h2>
            <p>
              לשאלות בנוגע לתנאי השימוש או לכל עניין אחר, ניתן לפנות אלינו דרך{' '}
              <Link to="/contact" className="text-[#6750a4] hover:underline">
                טופס יצירת הקשר
              </Link>
              .
            </p>
          </section>

          <p className="text-sm text-[#79747e] mt-12">
            עודכן לאחרונה: דצמבר 2024
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-[#fffbff] border-t border-[#e7e0ec]">
        <div className="max-w-4xl mx-auto px-6 text-center text-[#49454f] text-sm">
          © {new Date().getFullYear()} Nesty. כל הזכויות שמורות.
        </div>
      </footer>
    </div>
  )
}
