import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { asset } from '../lib/assets'

export default function Privacy() {
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
        <h1 className="text-4xl font-bold text-[#1d192b] mb-8">מדיניות פרטיות</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-[#49454f]">
          <p className="text-lg leading-relaxed">
            ב-Nesty, אנחנו מחויבים להגן על הפרטיות שלכם בהתאם לחוק הגנת הפרטיות, התשמ"א-1981
            ותקנותיו, לרבות תקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.
            מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלכם.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">1. מי אנחנו</h2>
            <p>
              Nesty היא פלטפורמה לניהול רשימות מתנות לתינוקות המופעלת על ידי באבו קפיטל בע"מ, חברה רשומה בישראל.
              אנו מחויבים לשמור על פרטיות המידע שלכם ולנהוג בו באחריות ובשקיפות.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">2. מידע שאנו אוספים</h2>
            <p>אנו אוספים את סוגי המידע הבאים:</p>

            <h3 className="text-xl font-bold text-[#1d192b] mt-6">מידע שאתם מספקים לנו ישירות:</h3>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>פרטי רישום:</strong> שם, כתובת אימייל, סיסמה (מוצפנת)</li>
              <li><strong>פרטי פרופיל:</strong> תאריך לידה משוער של התינוק (אופציונלי)</li>
              <li><strong>כתובת למשלוח:</strong> רחוב, עיר, מיקוד, מספר טלפון (אם תבחרו לשתף)</li>
              <li><strong>תוכן הרשימה:</strong> מוצרים שהוספתם, העדפות, הערות</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1d192b] mt-6">מידע שנאסף אוטומטית:</h3>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה</li>
              <li><strong>מידע שימוש:</strong> דפים שנצפו, זמני גישה, פעולות באתר</li>
              <li><strong>עוגיות:</strong> מזהים לניהול הפעלה והעדפות (ראו סעיף 7)</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1d192b] mt-6">מידע מצדדים שלישיים:</h3>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>התחברות חברתית:</strong> אם תבחרו להתחבר דרך Google, נקבל את שמכם וכתובת האימייל</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">3. מטרות השימוש במידע</h2>
            <p>אנו משתמשים במידע שלכם למטרות הבאות בלבד:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>הפעלת השירות:</strong> יצירת חשבון, ניהול רשימות, שיתוף עם אורחים</li>
              <li><strong>תקשורת שירות:</strong> שליחת התראות על מתנות שנרכשו, עדכוני מערכת</li>
              <li><strong>שיפור השירות:</strong> ניתוח שימוש לצורך שיפור חוויית המשתמש</li>
              <li><strong>אבטחה:</strong> זיהוי ומניעת שימוש לרעה, הונאות או פגיעה באבטחה</li>
              <li><strong>עמידה בחוק:</strong> מילוי דרישות חוקיות וצווים שיפוטיים</li>
              <li><strong>שיווק:</strong> שליחת עדכונים שיווקיים (רק אם הסכמתם במפורש)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">4. שיתוף מידע עם צדדים שלישיים</h2>
            <p>
              <strong>אנו לא מוכרים ולא משכירים את המידע האישי שלכם לצדדים שלישיים.</strong>
            </p>
            <p className="mt-4">אנו עשויים לשתף מידע במקרים המוגבלים הבאים:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong>עם נותני מתנות:</strong> שם וכתובת למשלוח (רק אם בחרתם לשתף את הכתובת).
                אם הגדרתם את הכתובת כ"פרטית", נותני המתנות יראו רק את שמכם ויצטרכו ליצור איתכם קשר לתיאום משלוח.
              </li>
              <li>
                <strong>ספקי שירות:</strong> חברות המספקות לנו שירותי תשתית (אחסון, אימייל, אנליטיקס).
                ספקים אלה מחויבים בחוזה לשמור על סודיות המידע.
              </li>
              <li>
                <strong>דרישות חוקיות:</strong> בתגובה לצווים שיפוטיים או דרישות חוקיות תקפות.
              </li>
              <li>
                <strong>הגנה על זכויות:</strong> כאשר נדרש להגן על הזכויות, הבטיחות או הרכוש שלנו או של אחרים.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">5. אבטחת מידע</h2>
            <p>
              אנו מיישמים אמצעי אבטחה בהתאם לתקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017, כולל:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>הצפנה:</strong> כל התקשורת מוצפנת באמצעות SSL/TLS</li>
              <li><strong>סיסמאות:</strong> סיסמאות מאוחסנות בצורה מוצפנת (hashed)</li>
              <li><strong>גישה מוגבלת:</strong> רק עובדים מורשים בעלי צורך עסקי יכולים לגשת למידע</li>
              <li><strong>ניטור:</strong> מעקב שוטף אחר פעילות חשודה במערכות</li>
              <li><strong>גיבויים:</strong> גיבוי מאובטח של המידע</li>
            </ul>
            <p className="mt-4">
              למרות מאמצינו, אין מערכת מאובטחת לחלוטין. במקרה של פריצה למערכות, נודיע לכם
              ולרשויות הרלוונטיות בהתאם לחוק.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">6. זכויותיכם לפי חוק הגנת הפרטיות</h2>
            <p>בהתאם לחוק הגנת הפרטיות הישראלי, יש לכם את הזכויות הבאות:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong>זכות עיון:</strong> לבקש לעיין במידע האישי שאנו מחזיקים עליכם
              </li>
              <li>
                <strong>זכות תיקון:</strong> לבקש תיקון מידע שגוי או לא מדויק
              </li>
              <li>
                <strong>זכות מחיקה:</strong> לבקש מחיקת המידע שלכם (בכפוף למגבלות חוקיות)
              </li>
              <li>
                <strong>ביטול הסכמה:</strong> לבטל הסכמה לקבלת דיוור שיווקי בכל עת
              </li>
              <li>
                <strong>העברת מידע:</strong> לקבל את המידע שלכם בפורמט מובנה
              </li>
            </ul>
            <p className="mt-4">
              למימוש זכויותיכם, פנו אלינו דרך{' '}
              <Link to="/contact" className="text-[#6750a4] hover:underline">
                טופס יצירת הקשר
              </Link>
              . נענה לפנייתכם תוך 30 יום כנדרש בחוק.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">7. עוגיות (Cookies)</h2>
            <p>אנו משתמשים בסוגי העוגיות הבאים:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong>עוגיות הכרחיות:</strong> לניהול הזדהות ושמירת העדפות הפעלה
              </li>
              <li>
                <strong>עוגיות אנליטיקה:</strong> להבנת אופן השימוש באתר ושיפורו (Google Analytics)
              </li>
            </ul>
            <p className="mt-4">
              ניתן לשנות את הגדרות העוגיות בדפדפן שלכם. שימו לב שחסימת עוגיות הכרחיות
              עלולה לפגוע בתפקוד האתר.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">8. תקופת שמירת מידע</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong>חשבון פעיל:</strong> המידע נשמר כל עוד החשבון שלכם פעיל
              </li>
              <li>
                <strong>לאחר מחיקת חשבון:</strong> המידע יימחק תוך 30 יום, למעט מידע שנדרש
                לשמור לפי חוק (עד 7 שנים לצרכי מס)
              </li>
              <li>
                <strong>גיבויים:</strong> גיבויים יימחקו תוך 90 יום ממועד מחיקת החשבון
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">9. העברת מידע מחוץ לישראל</h2>
            <p>
              המידע שלכם עשוי להיות מאוחסן על שרתים מחוץ לישראל (שירותי ענן כגון AWS או Supabase).
              אנו מוודאים שספקים אלה עומדים בתקני אבטחה מחמירים ומחויבים בהסכמים להגנה על המידע.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">10. קטינים</h2>
            <p>
              השירות מיועד למשתמשים בני 18 ומעלה. אנו לא אוספים ביודעין מידע מקטינים.
              אם נודע לנו שאספנו מידע מקטין, נמחק אותו מיד.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">11. שינויים במדיניות</h2>
            <p>
              אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>יפורסמו באתר עם תאריך העדכון</li>
              <li>ישלחו בהודעה לכתובת האימייל שלכם</li>
              <li>ייכנסו לתוקף 14 יום לאחר הפרסום, אלא אם נדרש אחרת בחוק</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1d192b]">12. יצירת קשר ותלונות</h2>
            <p>
              לשאלות, בקשות או תלונות בנוגע למדיניות הפרטיות או לטיפול במידע שלכם:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                פנו אלינו דרך{' '}
                <Link to="/contact" className="text-[#6750a4] hover:underline">
                  טופס יצירת הקשר
                </Link>
              </li>
            </ul>
            <p className="mt-4">
              אם אינכם מרוצים מהטיפול בתלונתכם, תוכלו לפנות לרשות להגנת הפרטיות במשרד המשפטים.
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
