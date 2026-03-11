import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Weekly pregnancy data (weeks 12-40) ──────────────────────────────
interface WeekData {
  week: number
  fruit: string
  fruitEmoji: string
  length: string
  weight: string
  development: string
  body: string
  tips: string
}

const WEEKLY_DATA: WeekData[] = [
  {
    week: 12, fruit: 'ליים', fruitEmoji: '🍈',
    length: '5.4 ס"מ', weight: '14 גרם',
    development: 'אבן דרך חשובה: כל האיברים החיוניים נוכחים בגוף! הרפלקסים של העובר מתפתחים במהירות, והוא מסוגל לפתוח ולסגור את אצבעותיו, לבצע תנועות מציצה, ואפילו לכווץ את פניו. הכליות מתחילות לתפקד ולייצר שתן. מערכת העיכול מתחילה להתפתח, והמעיים חוזרים לתוך הבטן.',
    body: 'הרחם שלך מתרחב ויוצא מהאגן, מה שיכול להקל מעט על הלחץ על שלפוחית השתן. הבחילות ותסמיני בוקר נוספים מתחילים לעתים להירגע, ואת עשויה להרגיש עלייה ברמות האנרגיה. ייתכן שתשימי לב לכתמים כהים קטנים המופיעים על עור הפנים.',
    tips: 'הקפידי על תזונה מאוזנת ועשירה בסיבים, ברזל וסידן.קבעי תור לשקיפות עורפית אם עוד לא עשית זאת.המשיכי בתרגילי קיגל לחיזוק רצפת האגן.רענני את מלתחתך למכנסי הריון נוחים.',
  },
  {
    week: 13, fruit: 'לימון', fruitEmoji: '🍋',
    length: '7.4 ס"מ', weight: '23 גרם',
    development: 'מיתרי הקול נוצרים, וטביעות האצבע הייחודיות מופיעות. המוח מפתח פיתולים מורכבים. העובר בולע ומתאמן על מציצה. השלייה מתפקדת במלואה.',
    body: 'ברוכה הבאה לשליש השני! רמות האנרגיה לרוב עולות, והבחילות שוככות. הרחם עולה מעל לאגן. ייתכנו שינויים קלים בחניכיים (דימום קל בצחצוח).',
    tips: 'הקפידי על צחצוח עדין ומעקב שיניים שגרתי.פנקי את עצמך במסאז\' הריון עדין.המשיכי לזוז בחוכמה ובפעילות גופנית מתונה.',
  },
  {
    week: 14, fruit: 'תפוז', fruitEmoji: '🍊',
    length: '8.7 ס"מ', weight: '43 גרם',
    development: 'העור העדין מכוסה בפלומה עדינה (Lanugo) כדי לשמור על חום הגוף. העובר מתאמן על הבעות פנים. עצמותיו ממשיכות להתקשות.',
    body: 'ייתכן שתרגישי כאבים עמומים או דקירות בצדי הבטן (Round Ligament Pain) עקב מתיחת הרחם הגדל. בטן קטנה מתחילה לעתים לצוץ.',
    tips: 'הקפידי על נעליים נוחות ותומכות.מרחי קרם הגנה לפנים (למניעת פיגמנטציה).צלמי תמונה ראשונה של הבטן למזכרת.',
  },
  {
    week: 15, fruit: 'אגס', fruitEmoji: '🍐',
    length: '10.1 ס"מ', weight: '70 גרם',
    development: 'העובר מסוגל לשמוע קולות חיצוניים, אם כי הם נשמעים כנראה עמומים. עיניו פונות קדימה אך עדיין עצומות. הגפיים ממשיכות לצמוח ולהתארך.',
    body: 'נפיחות באף או גודש (pregnancy rhinitis) נפוצה מאוד. ייתכן שתרגישי סחרחורות עקב שינויים בזרימת הדם.',
    tips: 'השתמשי בתרסיס מי מלח לאף סתום.קומי לאט משכיבה לישיבה כדי למנוע סחרחורות פתאומיות.שתי הרבה מים כדי לשמור על לחות הגוף.',
  },
  {
    week: 16, fruit: 'אבוקדו', fruitEmoji: '🥑',
    length: '11.6 ס"מ', weight: '100 גרם',
    development: 'העצמות מתקשות והשרירים מתחזקים. העובר מזיז את מפרקיו ובועט. מערכת העצבים פועלת ביעילות. ניתן לזהות בברור את מין העובר באולטרסאונד.',
    body: 'תנועות העובר הראשונות ("פרפרים" בבטן) מתחילות לעתים להיות מורגשות. הבטן בולטת יותר. הצרבות עשויות להופיע עקב לחץ על הקיבה.',
    tips: 'קבעי תור לסקירת מערכות מוקדמת (שבועות 14-17).התחילי לישון באופן קבוע על הצד (עדיף צד שמאל).המשיכי בתרגילי קיגל לחיזוק רצפת האגן.',
  },
  {
    week: 17, fruit: 'בצל', fruitEmoji: '🧅',
    length: '13 ס"מ', weight: '140 גרם',
    development: 'העור העדין מקבל צבע ורוד. שכבת שומן מתחילה להצטבר מתחת לעור. טביעות האצבע ברורות וייחודיות.',
    body: 'ייתכן שתשימי לב לסימני מתיחה עדינים (Stretch Marks) המופיעים על הבטן, החזה או הירכיים. המשקל מתחיל לעלות בקצב יציב יותר.',
    tips: 'הקפידי על מריחת קרם לחות עשיר על הבטן.המשיכי לזוז בחוכמה ובפעילות גופנית מתונה.הרימי רגליים כשאת יושבת כדי להקל על בצקות.',
  },
  {
    week: 18, fruit: 'מלפפון', fruitEmoji: '🥒',
    length: '14.2 ס"מ', weight: '190 גרם',
    development: 'האוזניים מגיעות למיקומן הסופי, והעובר שומע קולות באופן ברור יותר. פיהוקים ושיהוקים נפוצים. התנועות הופכות לברורות וקלות לזיהוי.',
    body: 'ייתכן שתשימי לב לדליות (ורידים בולטים) המופיעות ברגליים עקב עלייה בנפח הדם. התכווצויות שרירים בלילה נפוצות יותר.',
    tips: 'הקפידי על גרבי לחץ אם את עומדת הרבה.דברי או שרי אל הבטן – היא מקשיבה.בדקי עם הרופא/ה לגבי תוסף מגנזיום.',
  },
  {
    week: 19, fruit: 'מנגו', fruitEmoji: '🥭',
    length: '15.3 ס"מ', weight: '240 גרם',
    development: 'שכבה שמנונית ולבנה (Vernix Caseosa) מכסה את עורו כדי להגן עליו במי השפיר. מערכת החושים ממשיכה להתפתח. פיתולי המוח מתחדדים.',
    body: 'לחץ עמום עשוי להופיע בבטן התחתונה עקב מתיחת הרצועות התומכות ברחם. ייתכן שתחושי עייפות מוגברת עקב קשיי שינה.',
    tips: 'השתמשי בכרית היריון נוחה לתמיכה בבטן ובגב בזמן השינה.קומי לאט משכיבה לישיבה כדי למנוע סחרחורות.שקלי יוגה להריון.',
  },
  {
    week: 20, fruit: 'בטטה', fruitEmoji: '🍠',
    length: '25.6 ס"מ', weight: '300 גרם',
    development: 'אמצע ההיריון! העובר מתאמן על נשימה בתוך מי השפיר. מערכת העיכול מתפקדת. המוח פעיל מאוד.',
    body: 'הטבור עשוי להתחיל לבלוט החוצה. הבטן כבר ברורה מאוד. תנועות העובר הופכות לחזקות ותכופות יותר.',
    tips: 'חגגו את חצי הדרך!.קבעי תור לסקירת מערכות מאוחרת (שבועות 20-24).דברי עם המלווה על תוכנית הלידה.',
  },
  {
    week: 21, fruit: 'בננה', fruitEmoji: '🍌',
    length: '26.7 ס"מ', weight: '360 גרם',
    development: 'בלוטות הטעם מפותחות, והעובר מסוגל להבחין בין טעמים המגיעים ממי השפיר. מחזורי שינה וערות קבועים מתחילים להיווצר. עורו העדין מקבל צבע ורדרד.',
    body: 'הצרבות עשויות להחמיר עקב לחץ על הקיבה. התכווצויות שרירים ברגליים, בעיקר בלילה, הופכות לנפוצות יותר. ייתכן שתחושי נפיחות קלה.',
    tips: 'העדיפי ארוחות קטנות ותכופות.בדקי עם הרופא על תוסף מגנזיום אם יש התכווצויות.הרימי רגליים כשאת יושבת.',
  },
  {
    week: 22, fruit: 'פלפל אדום', fruitEmoji: '🌶️',
    length: '27.8 ס"מ', weight: '430 גרם',
    development: 'העובר מסוגל להבחין בין אור לחושך, אף על פי שעיניו עדיין עצומות. מיתרי הקול ממשיכים להתפתח. המוח גדל במהירות.',
    body: 'לחץ עמום עשוי להופיע בבטן התחתונה עקב מתיחת הרצועות התומכות ברחם. תנועות העובר חזקות ותכופות.',
    tips: 'הקפידי על גרבי לחץ אם עומדת הרבה.שקלי קניית כרית שינה להריון.המשיכי בתרגילי קיגל לחיזוק רצפת האגן.',
  },
  {
    week: 23, fruit: 'אשכולית', fruitEmoji: '🍊',
    length: '28.9 ס"מ', weight: '500 גרם',
    development: 'ריאות העובר מתפתחות במהירות כדי להתכונן לנשימה. העובר נראה כעת כמו מיני-תינוק, עם שפתיים, גבות וציפורניים עדינות. עצמותיו ממשיכות להתקשות.',
    body: 'לחץ מוגבר מופיע על הסרעפת, מה שעלול לגרום לקוצר נשימה קל. ייתכן שתשימי לב לכתמים כהים נוספים על עור הפנים. תנועות העובר חזקות ותכופות מאוד.',
    tips: 'הרימי רגליים כשאת יושבת כדי להקל על בצקות.הימנעי מעמידה ממושכת.התחילי מעקב ספירת תנועות פעמיים ביום.',
  },
  {
    week: 24, fruit: 'רימון', fruitEmoji: '🍎',
    length: '30 ס"מ', weight: '600 גרם',
    development: 'הריאות מתחילות לייצר חומר (Surfactant) המאפשר להן להיפתח ולהיסגר בזמן הנשימה. העובר בעל חוש שיווי משקל מפותח, והוא מסוגל להבחין בין כיוונים.',
    body: 'תנועות העובר הופכות חזקות ותכופות, ולעתים ניתן להבחין בהן דרך עור הבטן. הבטן בולטת מאוד. ייתכנו כאבי גב תחתון מוגברים.',
    tips: 'קבעי תור לבדיקת העמסת סוכר (שבועות 24-28).הימנעי מהרמת משאות כבדים.בדקי את התאמת נעליך.',
  },
  {
    week: 25, fruit: 'חציל', fruitEmoji: '🍆',
    length: '34.6 ס"מ', weight: '660 גרם',
    development: 'מערכת החושים ממשיכה להתחדד, והעובר מגיב למגע ולצלילים דרך הבטן. המוח גדל ומפתח פיתולים מורכבים. העובר צובר שומן מתחת לעור.',
    body: 'לחץ עמום עשוי להופיע בבטן התחתונה עקב מתיחת הרצועות התומכות ברחם. תנועות העובר חזקות ותכופות מאוד. הבטן בולטת מאוד.',
    tips: 'שוחחי עם מלווי לידה על תוכנית הלידה.קראי על התמודדות עם כאב בלידה.המשיכי למרוח קרם לבטן.',
  },
  {
    week: 26, fruit: 'זוקיני', fruitEmoji: '🥒',
    length: '35.6 ס"מ', weight: '760 גרם',
    development: 'העיניים מתחילות להיפתח בהדרגה, אף על פי שראייתו עדיין מוגבלת. פיתולי המוח ממשיכים להתפתח. ריאות העובר כמעט בשלות לחלוטין.',
    body: 'קשיי נשימה קלים עשויים להופיע עקב לחץ על הסרעפת. ייתכנו התכווצויות שרירים מוגברות ברגליים, בעיקר בלילה. הצרבות עשויות להחמיר.',
    tips: 'שתי הרבה מים ואכלי סיבים תזונתיים.נוחי על הצד כדי להקל על כאבי גב.התחילי לחפש ציוד כבד (עגלה, מיטה).',
  },
  {
    week: 27, fruit: 'כרוב', fruitEmoji: '🥬',
    length: '36.6 ס"מ', weight: '870 גרם',
    development: 'העובר מסוגל לזהות צלילים חיצוניים, כגון קולות המלווים. שנת חלום (REM) נצפית לראשונה, מה שמרמז על כך שהעובר חולם. המוח גדל במהירות.',
    body: 'תנועות העובר חזקות ותכופות מאוד. הלחץ על השלפוחית עולה. הצרבות עשויות להחמיר. ייתכנו בצקות מוגברות בידיים וברגליים.',
    tips: 'התחילי מעקב תנועות עובר באופן סדיר.המשיכי לזוז בחוכמה ובפעילות גופנית מתונה.שוחחי עם מיילדת על מהלך הלידה.',
  },
  {
    week: 28, fruit: 'חסה', fruitEmoji: '🥬',
    length: '37.6 ס"מ', weight: '1 ק"ג',
    development: 'העובר הגיע למשקל של קילו שלם! מערכת החיסון מתחילה לתפקד, והעצמות חזקות אך גמישות מספיק כדי לעבור בתעלת הלידה.',
    body: 'ברוכה הבאה לשליש השלישי! תנועות העובר חזקות ותכופות מאוד. הצרבות עשויות להחמיר. ייתכנו בצקות מוגברות. ייתכנו צירים מדומים (Braxton Hicks).',
    tips: 'קבעי תור לרופא לחיסון שעלת.שוחחי עם המלווה על תוכנית הלידה המעודכנת.קני מוצרי היגיינה רכים (פדים, תחתונים חד פעמיים).',
  },
  {
    week: 29, fruit: 'כרובית', fruitEmoji: '🥦',
    length: '38.6 ס"מ', weight: '1.15 ק"ג',
    development: 'העובר צובר שומן מתחת לעור בקצב מהיר. מערכת הנשימה ממשיכה להתפתח, והריאות מייצרות חומר נוסף (Surfactant). המוח גדל ומפתח פיתולים מורכבים.',
    body: 'לחץ עמום עשוי להופיע בבטן התחתונה. תנועות העובר חזקות ותכופות מאוד. ייתכנו בצקות מוגברות. תכיפות למתן שתן עולה.',
    tips: 'העדיפי ארוחות קטנות מאוד ותכופות.התחילי לחשוב על תיק הלידה.קבעי תור למעקב גדילה (הערכת משקל).',
  },
  {
    week: 30, fruit: 'ברוקולי', fruitEmoji: '🥦',
    length: '39.9 ס"מ', weight: '1.3 ק"ג',
    development: 'המוח מקבל את הקמטים והפיתולים שאופייניים לו, כדי לאחסן יותר תאי עצב. העובר מתחיל לייצר בעצמו כדוריות דם אדומות.',
    body: 'לחץ עמום עשוי להופיע בבטן התחתונה. תנועות העובר חזקות ותכופות מאוד. הצרבות עשויות להחמיר. בצקות מוגברות בידיים וברגליים. ייתכנו צירים מדומים.',
    tips: 'ודאי שכיסא הבטיחות מותקן ברכב.הכינו אוכל מוקפא לימים הראשונים.צלמו תמונה משפחתית של הבטן.',
  },
  {
    week: 31, fruit: 'קוקוס', fruitEmoji: '🥥',
    length: '41.1 ס"מ', weight: '1.5 ק"ג',
    development: 'העובר צובר שומן מתחת לעור בקצב מהיר מאוד. המוח גדל ומפתח פיתולים מורכבים. כל חמשת החושים עובדים ומעבדים מידע מהסביבה.',
    body: 'קשיי נשימה עשויים להתגבר עקב לחץ על הסרעפת. תכיפות למתן שתן עולה. תנועות העובר חזקות ותכופות. ייתכנו צירים מדומים.',
    tips: 'קבעי תור לבדיקת משטח GBS (שבועות 35-37).ארגנו את תיק הלידה.קראו על התמודדות עם צירים.',
  },
  {
    week: 32, fruit: 'פומלה', fruitEmoji: '🍊',
    length: '42.4 ס"מ', weight: '1.7 ק"ג',
    development: 'רוב התינוקות מתחילים להתהפך בשלב זה מטה. פלומת השיער הדקה נושרת בהדרגה, ושכבת השומן הופכת משמעותית יותר.',
    body: 'תנועות העובר חזקות ותכופות מאוד, ולעתים ניתן להבחין בהן דרך עור הבטן. הבטן בולטת מאוד. הצרבות עשויות להחמיר. ייתכנו צירים מדומים.',
    tips: 'בצעו עיסוי פרינאום כהכנה ללידה (בהתייעצות עם דולה או מיילדת).ארגנו את החדר של התינוק.שוחחו עם המלווה על רצונות הלידה.',
  },
  {
    week: 33, fruit: 'דלורית', fruitEmoji: '🎃',
    length: '43.7 ס"מ', weight: '1.9 ק"ג',
    development: 'העובר צובר שומן מתחת לעור בקצב מהיר. מערכת הנשימה כמעט בשלה לחלוטין. העצמות חזקות אך עצמות הגולגולת נשארות גמישות לאפשר מעבר בתעלה.',
    body: 'לחץ עמום עשוי להופיע בבטן התחתונה עקב מתיחת הרצועות התומכות ברחם. תכיפות למתן שתן עולה. תנועות העובר חזקות ותכופות מאוד.',
    tips: 'הכריזו על זמני מנוחה מוחלטים.דברי עם בן/בת הזוג על חלוקת תפקידים.הכינו תיק מלווה (עם אוכל ובגדים).',
  },
  {
    week: 34, fruit: 'אננס', fruitEmoji: '🍍',
    length: '45 ס"מ', weight: '2.1 ק"ג',
    development: 'מערכת העיכול והריאות כמעט בשלות לגמרי. העובר בעל חוש טעם מפותח מאוד, והוא מסוגל להבחין בין טעמים המגיעים ממי השפיר.',
    body: 'קשיי נשימה קלים עשויים להופיע עקב לחץ על הסרעפת. ייתכנו התכווצויות שרירים מוגברות ברגליים בלילה. הצרבות עשויות להחמיר.',
    tips: 'השלימו קניות אחרונות לתינוק.בדקו את מסלול הנסיעה לבית החולים.התפנקו בפדיקור/מניקור עדין.',
  },
  {
    week: 35, fruit: 'פפאיה', fruitEmoji: '🍈',
    length: '46.2 ס"מ', weight: '2.4 ק"ג',
    development: 'הכליות פועלות במלואן והכבד מייצר פסולת. העובר בעל חוש שיווי משקל מפותח מאוד. מערכת החושים מפותחת כמעט לחלוטין.',
    body: 'תנועות העובר חזקות (נראות יותר כמתיחות). הלחץ על השלפוחית עולה. הצרבות עשויות להחמיר. ייתכנו בצקות מוגברות.',
    tips: 'הכינו את עמדת ההחתלה.ודאו שהכיסא הבטיחות תקין ומותקן.נשמו עמוק.',
  },
  {
    week: 36, fruit: 'קייל', fruitEmoji: '🥬',
    length: '47.4 ס"מ', weight: '2.6 ק"ג',
    development: 'העובר בולע את פלומת השיער וההפרשות (Vernix) מה שמרכיב את הצואה הראשונה שלו (מקוניום). ההכנות לחיים בחוץ בעיצומן.',
    body: 'תנועות העובר חזקות ותכופות. הצרבות עשויות להחמיר. ייתכנו בצקות מוגברות. לחץ בבטן התחתונה (התבססות באגן). את עשויה לחוש שחם לך רוב הזמן.',
    tips: 'ודאו שתיק הלידה מונח ברכב.שוחחו עם מלווה הלידה על תוכנית הלידה הסופית.השלימו כביסה לתינוק.',
  },
  {
    week: 37, fruit: 'מנגולד', fruitEmoji: '🥬',
    length: '48.6 ס"מ', weight: '2.9 ק"ג',
    development: 'העובר נחשב כעת במועד (Full Term)! כל המערכות מוכנות לפעולה מחוץ לרחם. מחזורי שינה וערות קבועים מבוססים.',
    body: 'קשיי נשימה עשויים להירגע מעט אם העובר התבסס למטה, אך לחץ על האגן יגבר. ייתכנו התכווצויות שרירים והפרשה צמיגית (הפקק הרירי).',
    tips: 'הקשיבו לגופך ועקבי אחרי צירים.דברי עם בן/בת הזוג על ההכנה לשוב הביתה.נשמי ונוחי המון.',
  },
  {
    week: 38, fruit: 'אבטיח קטן', fruitEmoji: '🍉',
    length: '49.8 ס"מ', weight: '3.1 ק"ג',
    development: 'כל האיברים בשלים לחיים בחוץ. המוח מפותח כמעט לחלוטין. בשלב זה העובר מתמקד רק בהעלאת משקל וצבירת כוח.',
    body: 'לחץ בבטן התחתונה הופך משמעותי יותר. הבטן בולטת מאוד וצפופה. ייתכנו צירים מדומים חזקים יותר. ייתכנו בצקות מוגברות.',
    tips: 'מלאי דלק ברכב.ארגנו את תיק התינוק המלא.דברי עם קרובי משפחה על ביקור אחרון לפני.',
  },
  {
    week: 39, fruit: 'מלון', fruitEmoji: '🍈',
    length: '50.7 ס"מ', weight: '3.3 ק"ג',
    development: 'העובר מקבל "בוסט" אחרון של נוגדנים מהשלייה שלך לחיזוק המערכת החיסונית לקראת היציאה. עורו חלק ומוכן.',
    body: 'ייתכן שתחוו "קינון" - רצון עז לנקות ולארגן. תכיפות למתן שתן עולה. תנועות העובר הופכות לדחיפות ומתיחות בגלל חוסר המקום.',
    tips: 'הכריזו על זמני שקט מוחלטים.דברי עם המיילדת על אפשרויות התמודדות עם כאב.שתי הרבה מים.',
  },
  {
    week: 40, fruit: 'דלעת', fruitEmoji: '🎃',
    length: '51.2 ס"מ', weight: '3.5 ק"ג',
    development: 'שבוע התל"מ (תאריך לידה משוער) נכנס לתוקף! התינוק אפוי לגמרי, מכורבל בתנוחת עובר ומוכן לפגוש אותך!',
    body: 'הלחץ בבטן התחתונה חזק מאוד. צירים מדומים עשויים להיות תכופים וסדירים יותר. חוסר נוחות כללית והמתנה דרוכה הם חלק טבעי מהשבוע הזה.',
    tips: 'נשמי. מעקב היריון עודף יתחיל כעת. היי סבלנית — זה יקרה בקרוב.קראו על הכנה להנקה.סנני הודעות בנייד במידת הצורך.',
  },
]

// ── Symptom detection from body text ─────────────────────────────────
const SYMPTOM_MAP: Array<{ keyword: string; emoji: string; label: string }> = [
  { keyword: 'בחילות', emoji: '🤢', label: 'בחילות' },
  { keyword: 'צרבת', emoji: '🔥', label: 'צרבת' },
  { keyword: 'כאבי גב', emoji: '🦴', label: 'כאבי גב' },
  { keyword: 'בצקות', emoji: '🦵', label: 'בצקות' },
  { keyword: 'נפוח', emoji: '🦵', label: 'רגליים נפוחות' },
  { keyword: 'קוצר נשימה', emoji: '😮‍💨', label: 'קוצר נשימה' },
  { keyword: 'עייפות', emoji: '😴', label: 'עייפות' },
  { keyword: 'התכווצויות', emoji: '💪', label: 'התכווצויות' },
  { keyword: 'סחרחורות', emoji: '😵', label: 'סחרחורות' },
  { keyword: 'צירים מדומים', emoji: '⚡', label: 'צירים מדומים' },
  { keyword: 'Braxton', emoji: '⚡', label: 'צירים מדומים' },
  { keyword: 'לחץ', emoji: '⬇️', label: 'לחץ באגן' },
  { keyword: 'תכיפות', emoji: '🚽', label: 'תכיפות במתן שתן' },
  { keyword: 'שתן', emoji: '🚽', label: 'תכיפות במתן שתן' },
  { keyword: 'דליות', emoji: '🩸', label: 'דליות' },
  { keyword: 'סימני מתיחה', emoji: '✨', label: 'סימני מתיחה' },
  { keyword: 'גודש', emoji: '🤧', label: 'גודש באף' },
]

function extractSymptoms(bodyText: string): Array<{ emoji: string; label: string }> {
  const found: Array<{ emoji: string; label: string }> = []
  const seenLabels = new Set<string>()
  for (const s of SYMPTOM_MAP) {
    if (bodyText.includes(s.keyword) && !seenLabels.has(s.label)) {
      found.push({ emoji: s.emoji, label: s.label })
      seenLabels.add(s.label)
      if (found.length >= 3) break
    }
  }
  return found
}

// ── Parse tips from raw text ─────────────────────────────────────────
const TIP_EMOJIS = ['💡', '📋', '🎯', '🛒', '🩺', '🧘', '💪', '🌙', '🥗', '👶']

function parseTips(rawTips: string): Array<{ emoji: string; text: string }> {
  // Remove header prefixes like "טיפים:" or "משימות:"
  let cleaned = rawTips.replace(/^(טיפים|משימות|תזונה ובדיקות)\s*:?\s*/i, '')
  // Split by period
  const parts = cleaned.split('.').map(t => t.trim()).filter(t => t.length > 10)
  return parts.slice(0, 3).map((text, i) => ({
    emoji: TIP_EMOJIS[i % TIP_EMOJIS.length],
    text,
  }))
}

// ── Calculate pregnancy week from due date ───────────────────────────
function calculatePregnancyWeek(dueDate: Date): number {
  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()
  const weeksRemaining = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))
  return 40 - weeksRemaining
}

// ── Generate weekly email HTML ───────────────────────────────────────
function generateWeeklyEmailHtml(
  firstName: string,
  weekData: WeekData,
): string {
  const progressPercent = Math.round((weekData.week / 40) * 100)
  const weeksRemaining = 40 - weekData.week
  const symptoms = extractSymptoms(weekData.body)
  const tips = parseTips(weekData.tips)

  // Build symptom pills HTML
  const symptomHtml = symptoms.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${symptoms.map((s, i) => `
          ${i > 0 ? '<td width="4%"></td>' : ''}
          <td style="background:#fff;border-radius:12px;padding:14px 16px;text-align:center;border:1.5px solid #e8daf5;">
            <div style="font-size:24px;margin-bottom:6px;">${s.emoji}</div>
            <p style="margin:0;font-size:12px;font-weight:700;color:#5a4470;">${s.label}</p>
          </td>
        `).join('')}
      </tr>
    </table>
  ` : ''

  // Build tips HTML
  const tipsHtml = tips.map((tip, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${i < tips.length - 1 ? '18' : '0'}px;">
      <tr>
        <td style="vertical-align:top;padding-left:16px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#3b1f6b;">${tip.emoji} ${tip.text.substring(0, 40)}${tip.text.length > 40 ? '' : ''}</p>
          <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">${tip.text}</p>
        </td>
        <td width="48" style="vertical-align:top;">
          <div style="width:42px;height:42px;background:#f0e8ff;border-radius:12px;text-align:center;line-height:42px;font-size:20px;">${tip.emoji}</div>
        </td>
      </tr>
    </table>
    ${i < tips.length - 1 ? '<div style="height:1px;background:#f0e8ff;margin-bottom:18px;"></div>' : ''}
  `).join('')

  // Shorten the development text for the email (first 2 sentences)
  const devSentences = weekData.development.split(/(?<=[.!])\s+/).slice(0, 3).join(' ')

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>Nesty — שבוע ${weekData.week} 🌿</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    :root { color-scheme: light only; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f0fa;font-family:'Heebo',sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;">
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
                  <span style="font-size:12px;color:#a087c0;font-weight:600;">שבוע ${weekData.week} · העדכון שלך</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO CARD -->
        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:44px 40px 40px;overflow:hidden;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#ffffffa6;text-transform:uppercase;">העדכון השבועי שלך</p>
            <h1 style="margin:0 0 10px;font-size:46px;font-weight:800;color:#ffffff;line-height:1.1;">
              שבוע ${weekData.week} 🌿
            </h1>
            <p style="margin:0 0 28px;font-size:16px;color:#ffffffe6;line-height:1.8;font-weight:400;">
              היי <strong style="font-weight:800;color:#ffffff;">${firstName}</strong> — הגעת לשבוע ${weekData.week}! התינוק שלך בגודל של ${weekData.fruit} ${weekData.fruitEmoji} ומתפתח בקצב מדהים. 💜
            </p>
            <div style="background:#ffffff33;border-radius:100px;height:7px;margin-bottom:9px;">
              <div style="background:#ffffff;height:7px;width:${progressPercent}%;border-radius:100px;"></div>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right"><span style="font-size:12px;color:#ffffff8c;">שבוע 1</span></td>
                <td align="center"><span style="font-size:12px;color:#ffffff;font-weight:700;">${progressPercent}% הושלם ✨</span></td>
                <td align="left"><span style="font-size:12px;color:#ffffff8c;">שבוע 40</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- BABY SIZE CARD -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="44%" style="background:#fff;border-radius:20px;padding:28px 20px;text-align:center;vertical-align:middle;border:1.5px solid #e8daf5;">
                  <div style="font-size:80px;line-height:1;margin-bottom:14px;">${weekData.fruitEmoji}</div>
                  <p style="margin:0 0 4px;font-size:20px;font-weight:800;color:#3b1f6b;">${weekData.fruit}</p>
                  <p style="margin:0;font-size:11px;font-weight:700;color:#a087c0;letter-spacing:0.05em;">גודל התינוק השבוע</p>
                </td>
                <td width="4%"></td>
                <td width="52%" style="vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#fff;border-radius:14px;padding:17px 20px;border:1.5px solid #e8daf5;">
                        <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#a087c0;text-transform:uppercase;">אורך</p>
                        <p style="margin:0;font-size:28px;font-weight:800;color:#3b1f6b;">${weekData.length}</p>
                      </td>
                    </tr>
                    <tr><td style="height:8px;"></td></tr>
                    <tr>
                      <td style="background:#fff;border-radius:14px;padding:17px 20px;border:1.5px solid #e8daf5;">
                        <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#a087c0;text-transform:uppercase;">משקל</p>
                        <p style="margin:0;font-size:28px;font-weight:800;color:#3b1f6b;">${weekData.weight}</p>
                      </td>
                    </tr>
                    <tr><td style="height:8px;"></td></tr>
                    <tr>
                      <td style="background:linear-gradient(135deg,#ede0ff,#dcc8f8);border-radius:14px;padding:17px 20px;border:1.5px solid #d0b0f0;">
                        <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#7c4dbd;text-transform:uppercase;">נותרו</p>
                        <p style="margin:0;font-size:28px;font-weight:800;color:#3b1f6b;">${weeksRemaining} <span style="font-size:15px;color:#8a5dc0;font-weight:500;">שבועות 💜</span></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- BABY DEVELOPMENT -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">👶 התפתחות התינוק</span>
            </div>
            <h2 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#3b1f6b;">מה קורה בפנים 🔬</h2>
            <p style="margin:0;font-size:15px;line-height:1.9;color:#5a4470;">
              ${devSentences}
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- MOM'S BODY -->
        <tr>
          <td style="background:#fdf6ff;border-radius:20px;padding:32px 36px;border:1.5px solid #e0ccf5;">
            <div style="display:inline-block;background:#ead5ff;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">🤰 הגוף שלך השבוע</span>
            </div>
            <h2 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#3b1f6b;">איך את עשויה להרגיש 💜</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.9;color:#5a4470;">
              ${weekData.body}
            </p>
            ${symptomHtml}
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- TIPS -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">💡 טיפים לשבוע ${weekData.week}</span>
            </div>
            ${tipsHtml}
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- NESTY CTA -->
        <tr>
          <td style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:32px 36px;text-align:center;">
            <div style="display:inline-block;background:#ffffff1f;border-radius:100px;padding:6px 16px;margin-bottom:20px;">
              <span style="font-size:12px;font-weight:700;color:#d4b0f5;">✨ צ׳קליסט ורשימה</span>
            </div>
            <h2 style="margin:0 0 14px;font-size:22px;font-weight:700;color:#f5eeff;line-height:1.4;">תפקדי את הרשימה ותתקדמי 💜</h2>
            <p style="margin:0 0 28px;font-size:14px;color:#ffffffa6;line-height:1.8;">
              הצ׳קליסט מחכה לך באפליקציה — סמני מה כבר הספקת ותראי כמה התקדמת! ✨
            </p>
            <a href="https://nestyil.com/checklist" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.02em;text-decoration:none;padding:15px 36px;border-radius:100px;">פתחי את Nesty</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- CHROME EXTENSION CTA -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <div style="display:inline-block;background:#e8f5e9;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#2e7d32;">🧩 טיפ חשוב</span>
            </div>
            <h3 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#3b1f6b;line-height:1.4;">התקיני את התוסף לכרום</h3>
            <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#7a6090;max-width:400px;margin-left:auto;margin-right:auto;">
              גלשי בכל אתר קניות, לחצי על כפתור Nesty — והמוצר מתווסף ישירות לרשימה שלך. זה ממש קסם! ✨
            </p>
            <a href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll" style="display:inline-block;background:linear-gradient(135deg,#7c4dbd,#9b62d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:100px;">🧩 הוסיפי לכרום — חינם</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- WARM CLOSING -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:28px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">🌸</p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#5a4470;">
              שבוע ${weekData.week} הוא רגע מדהים במסע שלך.<br/>
              <strong style="color:#7c4dbd;">אנחנו כאן איתך — כל צעד בדרך.</strong>
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- SCHEDULE A CALL / CONTACT -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <div style="display:inline-block;background:#fce4ec;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#c62828;">💬 צריכה עזרה?</span>
            </div>
            <h3 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#3b1f6b;line-height:1.4;">אנחנו כאן בשבילך</h3>
            <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#7a6090;max-width:400px;margin-left:auto;margin-right:auto;">
              יש שאלה? רוצה עזרה? קבעי שיחת זום קצרה (5 דקות) ונעזור לך.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:10px;">
                  <a href="https://calendar.app.google/Cu8AZgor4zohXxqUA" style="display:block;background:linear-gradient(135deg,#7c4dbd,#9b62d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:100px;text-align:center;">📅 קבעי שיחה קצרה</a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="mailto:tom@ppltok.com" style="display:block;background:#f3edff;color:#7c4dbd;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:100px;border:1.5px solid #e8daf5;text-align:center;">✉️ שלחי לנו מייל</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0 0 8px;font-size:13px;color:#a087c0;">
              נשלח באהבה על ידי <strong style="color:#7c4dbd;">Nesty</strong>
            </p>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
              <a href="https://nestyil.com/settings" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>
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
</html>`
}

// ── Main handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Optional: pass { user_id } to send to a specific user (for testing)
    let targetUserId: string | null = null
    try {
      const body = await req.json()
      targetUserId = body?.user_id || null
    } catch {
      // No body = process all users
    }

    // Query eligible profiles
    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, due_date, marketing_emails, last_weekly_email_week')

    if (targetUserId) {
      query = query.eq('id', targetUserId)
    } else {
      // Only users who opted in to marketing emails and have a due date
      query = query
        .eq('marketing_emails', true)
        .not('due_date', 'is', null)
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      throw new Error(`Failed to query profiles: ${profilesError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No eligible users found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const results: Array<{ email: string; week: number; status: string }> = []

    for (const profile of profiles) {
      try {
        if (!profile.due_date) continue

        const dueDate = new Date(profile.due_date)
        const currentWeek = calculatePregnancyWeek(dueDate)

        // Only send for weeks 12-40
        if (currentWeek < 12 || currentWeek > 40) {
          results.push({ email: profile.email, week: currentWeek, status: 'out_of_range' })
          continue
        }

        // Check if already sent for this week
        if (profile.last_weekly_email_week === currentWeek && !targetUserId) {
          results.push({ email: profile.email, week: currentWeek, status: 'already_sent' })
          continue
        }

        // Find week data
        const weekData = WEEKLY_DATA.find(w => w.week === currentWeek)
        if (!weekData) {
          results.push({ email: profile.email, week: currentWeek, status: 'no_data' })
          continue
        }

        // Generate email HTML
        const firstName = profile.first_name || profile.email.split('@')[0]
        const html = generateWeeklyEmailHtml(firstName, weekData)

        // Send via Resend
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Nesty <noreply@nestyil.com>',
            to: [profile.email],
            subject: `🌿 שבוע ${currentWeek} — ${firstName}, התינוק שלך בגודל של ${weekData.fruit} ${weekData.fruitEmoji}`,
            html,
          }),
        })

        const resData = await res.json()

        if (!res.ok) {
          console.error(`Failed to send to ${profile.email}:`, resData)
          results.push({ email: profile.email, week: currentWeek, status: `error: ${resData.message || 'unknown'}` })
          continue
        }

        // Update last sent week
        await supabaseAdmin
          .from('profiles')
          .update({ last_weekly_email_week: currentWeek })
          .eq('id', profile.id)

        results.push({ email: profile.email, week: currentWeek, status: 'sent' })
      } catch (err) {
        console.error(`Error processing ${profile.email}:`, err)
        results.push({ email: profile.email, week: 0, status: `error: ${String(err)}` })
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: profiles.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in send-weekly-emails:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
