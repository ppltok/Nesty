import {
  Car,
  Home,
  ShieldAlert,
  UtensilsCrossed,
  Baby,
  Droplets,
  Shirt,
  BedDouble,
  Gamepad2,
  Package,
  Users,
  HeartHandshake,
} from 'lucide-react'
import StrollerIcon from '../components/icons/StrollerIcon'

// Type definitions
export type ItemType = 'must' | 'treat'

export interface RecommendedProduct {
  name: string
  store: string
  url: string
  image: string
  price: number
}

export interface ItemInfo {
  description: string
  tip: string
  type: ItemType
  products?: RecommendedProduct[]
}

export interface Category {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  suggestedItems: string[]
}

// === Item data dictionary ===
export const ITEMS_DATA: Record<string, ItemInfo> = {
  // --- עגלות וטיולים ---
  'עגלה לתינוק מגיל לידה': {
    description: 'עגלה משולבת הכוללת אמבטיה (שכיבה לחודשים ראשונים) ומושב טיולון (ישיבה).',
    tip: 'מדדו את תא המטען והמעלית. האמבטיה היא רק ל-3 חודשים, אז השקיעו בטיולון שיהיה קל לקיפול ונוח לדחיפה.',
    type: 'must',
    products: [
      {
        name: 'Anex IQ Pro',
        store: 'בייבי סטאר',
        url: 'https://www.baby-star.co.il/products/40168487',
        image: 'https://www.baby-star.co.il/cdn/shop/files/medium-AnexIQ_Darke_2.webp?v=1768127011&width=1380',
        price: 6099,
      },
      {
        name: 'בוגבו Dragonfly',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/products/6767940-%D7%A2%D7%92%D7%9C%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%93%D7%A8%D7%92%D7%95%D7%9F-%D7%A4%D7%9C%D7%99%D7%99-%D7%97%D7%95%D7%9C-%D7%9E%D7%93%D7%91%D7%A8-%D7%A7%D7%95%D7%9E%D7%A4%D7%9C%D7%98-%D7%94%D7%9E%D7%9C%D7%90%D7%99-%D7%99%D7%AA%D7%97%D7%93%D7%A9-%D7%91%D7%97%D7%95%D7%93%D7%A9-%D7%A4%D7%91%D7%A8%D7%95%D7%90%D7%A8-%D7%91%D7%95%D7%92%D7%91%D7%95',
        image: 'https://motsesim.co.il/cdn/shop/files/fe96ade61037281a6b989c1e50e06db9.png?v=1751159422',
        price: 5990,
      },
      {
        name: 'Cybex Mios 3',
        store: 'Cybex',
        url: 'https://cybexonline.co.il/products/%D7%A2%D7%92%D7%9C%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-mios-3-mirage-grey-%D7%A2%D7%9D-%D7%A9%D7%9C%D7%93%D7%AA-chrome-brown',
        image: 'https://cybexonline.co.il/cdn/shop/files/CYB_23_INT_y225_Mios_Cot_CHBR_MIGR_print_medium_becc6b49-196d-40a5-b165-e82153ab2ca0.jpg?v=1725478821&width=600',
        price: 6190,
      },
    ],
  },
  'טיולון': {
    description: 'עגלה קלה וקומפקטית ("מטריה") המיועדת לתינוקות יושבים (מגיל 6 חודשים).',
    tip: 'לא לקנות ללידה! זה שדרוג לגיל חצי שנה כשהעגלה המשולבת נהיית כבדה ומסורבלת.',
    type: 'treat',
    products: [
      {
        name: 'טיולון לתינוק טוויגי קופר – Twigy Cooper',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%A2%D7%92%D7%9C%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%98%D7%95%D7%95%D7%99%D7%92%D7%99-%D7%A7%D7%95%D7%A4%D7%A8-twigy-cooper/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2026/01/141505.jpg',
        price: 449,
      },
      {
        name: 'עגלת טיולון YOYO³',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/stokke/yoyo/%d7%a2%d7%92%d7%9c%d7%aa-%d7%98%d7%99%d7%95%d7%9c%d7%95%d7%9f-yoyo%c2%b3/',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2025/01/YOYO-2-6-3-4-BLACK-FRAME-BLACK-WEB-1-scaled.webp',
        price: 2490,
      },
    ],
  },
  'מנשא לתינוק': {
    description: 'אביזר לנשיאת התינוק צמוד לגוף ההורה ("ידיים חופשיות").',
    tip: 'חובה למדוד! להתחלה מנשא בד נמתח שעוטף ומרגיע גזים, להמשך מנשא ילקוט לשמירה על הגב.',
    type: 'must',
    products: [
      {
        name: 'מנשא לתינוק Lamer X Soft',
        store: 'Lamer',
        url: 'https://la-mer.co.il/products/%D7%9E%D7%A0%D7%A9%D7%90-%D7%91%D7%93-lamer-x-soft',
        image: 'https://la-mer.co.il/cdn/shop/files/9269e28d93ef21964decb2c1bc2a6722.jpg?v=1721649124&width=1100',
        price: 549,
      },
      {
        name: 'מנשא מיני אייר',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/babybjorn/products/%D7%9E%D7%A0%D7%A9%D7%90-%D7%9E%D7%99%D7%A0%D7%99-%D7%90%D7%99%D7%99%D7%A8-%D7%90%D7%A4%D7%95%D7%A8',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4344066-A.jpg?v=1734446959&width=360',
        price: 720,
      },
    ],
  },
  'תיק החתלה': {
    description: 'תיק ייעודי עם תאים לבקבוקים וחיתולים שנתלה על העגלה.',
    tip: 'התיק "חי" על העגלה, הכי חשוב לבדוק שיש תופסנים נוחים לידית. כמות: תיק אחד איכותי מספיק.',
    type: 'must',
    products: [
      {
        name: 'תיק החתלה פרחוני',
        store: 'Zara',
        url: 'https://www.zara.com/il/he/%D7%AA%D7%99%D7%A7-%D7%94%D7%97%D7%AA%D7%9C%D7%94-%D7%A4%D7%A8%D7%97%D7%95%D7%A0%D7%99-p11593630.html',
        image: 'https://static.zara.net/assets/public/bd33/289c/1b3840cdad56/8dd8e67402aa/11593630002-e1/11593630002-e1.jpg?ts=1761841995825&w=1280',
        price: 269,
      },
      {
        name: 'Amara Large Bag',
        store: 'Leo & Cabs',
        url: 'https://leoandcubs.com/collections/new-collection/products/amara-large-bag',
        image: 'https://leoandcubs.com/cdn/shop/files/LEO29.1014185.webp?v=1762672938&width=1100',
        price: 509,
      },
    ],
  },
  'אביזרים לעגלות וטיולון': {
    description: 'ציוד נלווה: כיסוי גשם, רשת יתושים, ווים וארגונית.',
    tip: 'קנו רק לפי עונת הלידה (כיסוי גשם לחורף/רשת לקיץ). ארגונית לכידון (לטלפון ומוצץ) זה מאסט.',
    type: 'must',
    products: [
      {
        name: 'דיספנסר שקיות',
        store: 'Minene',
        url: 'https://www.minene.net/12315010',
        image: 'https://www.minene.net/media/catalog/product/cache/905247217201be89629513475763a2c6/1/2/12315010_19_1_1.jpg?v=1768738765',
        price: 22,
      },
      {
        name: 'מתלה גדול לעגלה',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/stroller-racks/products/%D7%9E%D7%AA%D7%9C%D7%94-%D7%92%D7%93%D7%95%D7%9C-%D7%9C%D7%A2%D7%92%D7%9C%D7%94',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-6200033-A.jpg?v=1734517047&width=900',
        price: 29,
      },
    ],
  },
  'צעצועים לעגלה': {
    description: 'צעצוע נתלה או קשת פעילות שמתחברת לעגלה.',
    tip: 'לא להעמיס. צעצוע אחד מתנדנד (עדיף שחור-לבן) זה די והותר כדי לא ליצור גירוי יתר.',
    type: 'treat',
    products: [
      {
        name: 'קשת לעגלה שחור לבן',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/qshtvt-l-glh/products/%D7%A7%D7%A9%D7%AA-%D7%9C%D7%A2%D7%92%D7%9C%D7%94-%D7%A9%D7%97%D7%95%D7%A8-%D7%9C%D7%91%D7%9F',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7520143-A.jpg?v=1734528011&width=720',
        price: 169,
      },
    ],
  },

  // --- בטיחות ברכב ---
  'כיסא בטיחות': {
    description: 'מושב בטיחות לרכב המתאים מגיל לידה ועד גיל מאוחר. קיים גם בגרסה מסתובבת 360° לכיוון הדלת.',
    tip: 'חובה לבטיחות. דגמים מסתובבים יקרים יותר אך חוסכים שבירת גב בחגירה ונחשבים לפינוק המשתלם ביותר. חובה להתקין נגד הכיוון עד גיל שנתיים לפחות.',
    type: 'must',
    products: [],
  },
  'סלקלים בטיחותיים': {
    description: 'מושב בטיחות נייד לתינוק (0-1 שנה) שניתן להוציא מהרכב.',
    tip: 'סלקל פינוק המאפשר ניידות (להעביר תינוק ישן), אך הוא בא במקום כיסא בטיחות מגיל לידה. אין צורך לקנות את שניהם, אם תרצו לחסוך עגלה - סלקל של דונה יכול להחליף את שלושתם!',
    type: 'treat',
    products: [
      {
        name: 'סל קל דונה',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/doona/products/%D7%A1%D7%9C-%D7%A7%D7%9C-%D7%93%D7%95%D7%A0%D7%94-x-%D7%9B%D7%97%D7%95%D7%9C-%D7%90%D7%95%D7%A7%D7%99%D7%99%D7%A0%D7%95%D7%A1-doona',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4090173-C.jpg?v=1734861754&width=540',
        price: 2890,
      },
      {
        name: 'סלקל צ’יקו קורי אסנשיאל – Chicco Kory Essential I-SIZE',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%a1%d7%9c%d7%a7%d7%9c-%d7%a6%d7%99%d7%a7%d7%95-%d7%a7%d7%95%d7%a8%d7%99-%d7%90%d7%a1%d7%a0%d7%a9%d7%99%d7%90%d7%9c-chicco-kory-essential-i-size/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2023/10/1-6.jpg',
        price: 899,
      },
    ],
  },
  'בסיסים לרכב': {
    description: 'מתקן קבוע (ISOFIX) המאפשר חיבור וניתוק מהיר של הסלקל.',
    tip: 'משדרג בטיחות ומונע טעויות קשירה בחגורות. נוח מאוד אם יש שני רכבים בבית.',
    type: 'treat',
    products: [
      {
        name: 'ג׳ואי - בסיס איזופיקס I-BASE שחור / BLACK',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%91%D7%A1%D7%99%D7%A1%D7%99%D7%9D-%D7%9C%D7%A8%D7%9B%D7%91/products/7742547-%D7%91%D7%A1%D7%99%D7%A1-%D7%90%D7%99%D7%96%D7%95%D7%A4%D7%99%D7%A7%D7%A1-i-base-%D7%A9%D7%97%D7%95%D7%A8-black-%D7%92-%D7%95%D7%99',
        image: 'https://motsesim.co.il/cdn/shop/files/2c5632b65643f5c32b9172318f8c9575.png?v=1753193983&width=1946',
        price: 499,
      },
      {
        name: 'ספורט ליין Sport Line בסיס סלקל FLEX',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/isofix-car-seat/products/%D7%91%D7%A1%D7%99%D7%A1-%D7%A1%D7%9C%D7%A7%D7%9C-flex',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-5800345-A.jpg?v=1736437318&width=1800',
        price: 549,
      },
    ],
  },
  'מוצרים משלימים לרכב': {
    description: 'מראה למושב האחורי (לראות את התינוק) וצלונים לחלונות.',
    tip: 'מראה היא חובה כדי לראות את התינוק כשהוא נגד הכיוון. צלון קריטי בקיץ הישראלי.',
    type: 'treat',
    products: [
      {
        name: 'מראת רכב לתינוק',
        store: 'KSP',
        url: 'https://ksp.co.il/web/item/358798',
        image: 'https://img.ksp.co.il/item/358798/b_1.jpg?v=1737365702',
        price: 99,
      },
    ],
  },

  // --- ריהוט ---
  'מיטת תינוק': {
    description: 'מיטת סורגים סטנדרטית שתשמש את התינוק עד גיל 2-3.',
    tip: 'הסטנדרט מצוין. הכי חשוב: תו תקן ומרווח סורגים תקין (עד 6 ס"מ) לבטיחות.',
    type: 'must',
    products: [
      {
        name: 'Ashi',
        store: 'בייבי לי',
        url: 'https://www.baby-lee.co.il/product-page/%D7%9E%D7%99%D7%98%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-140-70-%D7%A1-%D7%9E-ashi-cream',
        image: 'https://static.wixstatic.com/media/d20f5a_46a923faa1a34373bb277ef0c48be8dc~mv2.png/v1/fill/w_500,h_471,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d20f5a_46a923faa1a34373bb277ef0c48be8dc~mv2.png',
        price: 2490,
      },
      {
        name: 'מיטת תינוק ריי',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/segal-baby/beds/%D7%9E%D7%99%D7%98%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%A8%D7%99%D7%99-%D7%90%D7%92%D7%95%D7%96/',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2024/04/%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%9C%D7%9C%D7%90-%D7%A9%D7%9D-65.png',
        price: 2360,
      },
      {
        name: 'עריסה + מיטת תינוק',
        store: 'boomini',
        url: 'https://www.boomini.co.il/product/%D7%A2%D7%A8%D7%99%D7%A1%D7%94-%D7%9E%D7%99%D7%98%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-4-%D7%911-%D7%9E%D7%A2%D7%A5/',
        image: 'https://www.boomini.co.il/wp-content/uploads/2025/11/ChatGPT-Image-Nov-16-2025-11_22_59-AM.png',
        price: 2190,
      },
    ],
  },
  'מזרן לתינוק': {
    description: 'מזרן ייעודי למיטת תינוק עם צד קשיח וצד רך יותר.',
    tip: 'לא לחסוך פה. המזרן חייב להיות קשיח ושטוח למניעת חנק ומוות בעריסה.',
    type: 'must',
    products: [
      {
        name: 'מזרן אלוורה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/furniture-for-babies/mattresses-for-babies/%D7%9E%D7%96%D7%A8%D7%9F-%D7%90%D7%9C%D7%95%D7%95%D7%A8%D7%94-%D7%98%D7%A8%D7%99%D7%A4%D7%9C-%D7%93%D7%9C%D7%95%D7%A7%D7%A1-%D7%A6%D7%93-%D7%A7%D7%A9%D7%99%D7%97-%D7%A6%D7%93-%D7%95%D7%99%D7%A1%D7%A7%D7%95-%D7%9C%D7%9E%D7%99%D7%98%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-60X120-%D7%A1%22%D7%9E-OLI/p/mp-00342576',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/1289689611175.jpg',
        price: 550,
      },
      {
        name: 'מזרן מיטת תינוק בייביטק – דאבל נושם – BabyTech',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%96%D7%A8%D7%9F-%D7%9E%D7%99%D7%98%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%93%D7%90%D7%91%D7%9C-%D7%A0%D7%95%D7%A9%D7%9D/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2022/05/834301.jpg',
        price: 549,
      },
    ],
  },
  'שידת החתלה': {
    description: 'רהיט מגירות לאחסון בגדים שחלקו העליון משמש להחתלה.',
    tip: 'נוח להחתלה. ודאו שהגובה מתאים לגב שלכם וחובה לקבע לקיר למניעת התהפכות.',
    type: 'must',
    products: [
      {
        name: 'שידת החתלה סאנרייז רהיטי סגל',
        store: 'ibabylove',
        url: 'https://www.ibabylove.co.il/product/%d7%a9%d7%99%d7%93%d7%aa-%d7%94%d7%97%d7%aa%d7%9c%d7%94-%d7%a1%d7%90%d7%a0%d7%a8%d7%99%d7%99%d7%96-%d7%a8%d7%94%d7%99%d7%98%d7%99-%d7%a1%d7%92%d7%9c/',
        image: 'https://www.ibabylove.co.il/wp-content/uploads/2022/01/IMG_0205-1024x1024-1.jpg',
        price: 1390,
      },
      {
        name: 'שידת תינוק דגם דורית 0.8 לבן',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby-dresser/products/%D7%A9%D7%99%D7%93%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%93%D7%92%D7%9D-%D7%93%D7%95%D7%A8%D7%99%D7%AA-0-8',
        image: 'https://www.shilav.co.il/cdn/shop/files/dorit1.jpg?v=1735490564&width=1800',
        price: 700,
      },
      {
        name: 'שידת אחסנה דייניז אליסון שחור/עץ – Dainy’s Alison™ Dresser Black/Wood 120 cm',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%a9%d7%99%d7%93%d7%aa-%d7%90%d7%97%d7%a1%d7%a0%d7%94-%d7%93%d7%99%d7%99%d7%a0%d7%99%d7%96-%d7%90%d7%9c%d7%99%d7%a1%d7%95%d7%9f-%d7%a9%d7%97%d7%95%d7%a8-%d7%a2%d7%a5-dainys-alison-dress/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2023/11/1205031.jpg',
        price: 2199,
      },
    ],
  },
  'עריסה לתינוק': {
    description: 'מיטה קטנה וניידת המתאימה ל-3 החודשים הראשונים בלבד.',
    tip: 'משמשת רק לזמן קצר. חבל לקנות – עדיף לשכור לכמה חודשים.',
    type: 'treat',
    products: [
      {
        name: 'עריסה נצמדת LEAH שלד דמוי עץ חום/ בז׳',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%A2%D7%A8%D7%99%D7%A1%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7/products/7490463-%D7%A2%D7%A8%D7%99%D7%A1%D7%94-%D7%A0%D7%A6%D7%9E%D7%93%D7%AA-leah-%D7%A9%D7%9C%D7%93-%D7%93%D7%9E%D7%95%D7%99-%D7%A2%D7%A5-%D7%97%D7%95%D7%9D-%D7%91%D7%96-%D7%9E%D7%95%D7%A0%D7%94',
        image: 'https://motsesim.co.il/cdn/shop/files/9675ea6a1e825ea31c82b4a4f83be508.png?v=1750264052&width=1946',
        price: 899,
      },
      {
        name: 'עריסה קלאסית לבנה',
        store: 'שילב',
        url: 'https://www.shilav.co.il/products/%D7%A2%D7%A8%D7%99%D7%A1%D7%94-%D7%A7%D7%9C%D7%90%D7%A1%D7%99%D7%AA-%D7%9C%D7%91%D7%A0%D7%94',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7126103-B.jpg?v=1734447102&width=1800',
        price: 399,
      },
    ],
  },
  'לול וקמפינג': {
    description: 'מיטת רשת מתקפלת וניידת למשחק או לשינה מחוץ לבית.',
    tip: 'לול רשת (קמפינג) הוא הכי פרקטי: קל, זול ונייד לסבתא. לא דחוף ליום הראשון.',
    type: 'treat',
    products: [
      {
        name: 'לול בוגבו סטארדס שחור',
        store: 'אייס',
        url: 'https://motsesim.co.il/collections/%D7%9C%D7%95%D7%9C-%D7%95%D7%9C%D7%95%D7%9C%D7%99-%D7%A7%D7%9E%D7%A4%D7%99%D7%A0%D7%92/products/7984938-%D7%9C%D7%95%D7%9C-%D7%91%D7%95%D7%92%D7%91%D7%95-%D7%A1%D7%98%D7%90%D7%A8%D7%93%D7%A1-%D7%A9%D7%97%D7%95%D7%A8',
        image: 'https://motsesim.co.il/cdn/shop/files/2ac4918b43cae13d948d43c54b6d9411.png?v=1751798555&width=1946',
        price: 1599,
      },
    ],
  },
  'אביזרים לעיצוב חדר ילדים': {
    description: 'תמונות, שטיחים, מדפים ופריטי נוי לחדר הילדים.',
    tip: 'הימנעו מדברים כבדים שתלויים מעל המיטה. שטיח כביס הוא יתרון עצום (פליטות/אבק).',
    type: 'treat',
    products: [
      {
        name: 'מדבקות קיר פרחי בוהו',
        store: 'ponponi',
        url: 'https://www.ponponi.co.il/product/decals76/',
        image: 'https://www.ponponi.co.il/wp-content/uploads/2025/07/floresboho1rosa2.jpg',
        price: 179,
      },
    ],
  },

  // --- מוצרי בטיחות ---
  'מוניטור ואינטרקום': {
    description: 'מכשיר לשמיעה או צפייה בתינוק מחדר אחר.',
    tip: 'בבית במפלס אחד שומעים גם בלי זה. בבית גדול/ממ"ד – קחו דגם פשוט ואמין.',
    type: 'treat',
    products: [
      {
        name: 'מוניטור + מצלמה מעמד רצפתי דור 2 (Nanit)',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/our-brands-nanit/products/5848104-%D7%9E%D7%95%D7%A0%D7%99%D7%98%D7%95%D7%A8-%D7%9E%D7%A6%D7%9C%D7%9E%D7%94-%D7%9E%D7%A2%D7%9E%D7%93-%D7%A8%D7%A6%D7%A4%D7%AA%D7%99-%D7%93%D7%95%D7%A8-2-%D7%A0%D7%A0%D7%99%D7%98',
        image: 'https://motsesim.co.il/cdn/shop/files/dbf68bb7e1d1eb1e0ab1a7eb8508f984.png?v=1752055931',
        price: 1999,
      },
      {
        name: 'מוניטור וידאו לתינוקות קינזי לוגן VM3.5 לבן – Kinsey Logan Video Baby Monitor',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%95%D7%A0%D7%99%D7%98%D7%95%D7%A8-%D7%95%D7%99%D7%93%D7%90%D7%95-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7%D7%95%D7%AA-%D7%A7%D7%99%D7%A0%D7%96%D7%99-%D7%9C%D7%95%D7%92%D7%9F-kinsey-logan-vm3-5/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2025/09/141422-1.jpg',
        price: 599,
      },
      {
        name: 'פיג\'מה מנטרת תנועות נשימה (Nanit)',
        store: 'נאניט',
        url: 'https://nanit.co.il/product/%d7%a4%d7%99%d7%92%d7%9e%d7%94-%d7%9e%d7%a0%d7%98%d7%a8%d7%aa-%d7%a0%d7%a9%d7%99%d7%9e%d7%94/',
        image: 'https://nanit.co.il/wp-content/uploads/2022/12/Pajamas_Lifestyle_Gray.png',
        price: 69,
      },
    ],
  },
  'שערים ואביזרי בטיחות': {
    description: 'סורגים למדרגות, סוגרי מגירות ומגני פינות.',
    tip: 'התינוק לא זז בהתחלה. חכו לגיל חצי שנה (זחילה) ואז תמגנו את הבית לפי הצורך.',
    type: 'treat',
    products: [
      {
        name: 'בייבי מישל שער בטיחות \'ללא קדיחה\' BLOCK עם מנגנון טריקה ונעילה אוטומטי',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-safety/safety-gates-and-railings/%D7%A9%D7%A2%D7%A8-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA-%D7%9C%D7%9C%D7%90-%D7%A7%D7%93%D7%99%D7%97%D7%94-BLOCK-%D7%A2%D7%9D-%D7%9E%D7%A0%D7%92%D7%A0%D7%95%D7%9F-%D7%98%D7%A8%D7%99%D7%A7%D7%94-%D7%95%D7%A0%D7%A2%D7%99%D7%9C%D7%94-%D7%90%D7%95%D7%98%D7%95%D7%9E%D7%98%D7%99/p/mp-00351203',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/0748855433399.jpg',
        price: 199,
      },
    ],
  },

  // --- האכלה ---
  'בקבוקים': {
    description: 'מיכל להאכלה בתמ"ל או בחלב שאוב.',
    tip: 'כמות להתחלה: 2-3 בקבוקים קטנים (150 מ"ל). נסו מותג אחד לפני שקונים סט שלם.',
    type: 'must',
    products: [
      {
        name: 'מאמ Mam',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby-bottles/products/%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%9E%D7%90%D7%9E-%D7%90%D7%A0%D7%98%D7%99%D7%A7%D7%95%D7%9C%D7%99%D7%A7-130-%D7%9E%D7%9C-%D7%95%D7%9E%D7%95%D7%A6%D7%A5',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4216044-A.jpg?v=1734512520&width=1800',
        price: 49,
      },
      {
        name: 'טומי טיפי Tommee Tippee זוג בקבוקים מאויר 260 מל',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby-bottles/products/%D7%96%D7%95%D7%92-%D7%91%D7%A7%D7%91%D7%95%D7%A7%D7%99%D7%9D-%D7%9E%D7%90%D7%95%D7%99%D7%A8-260-%D7%9E%D7%9C-1',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-3801554-A.jpg?v=1740681045&width=1080',
        price: 99,
      },
    ],
  },
  'פטמות לבקבוקים': {
    description: 'החלק שדרכו התינוק יונק, מגיע בקצבי זרימה שונים.',
    tip: 'קריטי: לניובורן רק שלב 0 או 1 (זרימה איטית) למניעת חנק וסירוב הנקה.',
    type: 'must',
    products: [
      {
        name: 'מאמ Mam זוג פטמות 0',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/bottle-nipples/products/%D7%96%D7%95%D7%92-%D7%A4%D7%98%D7%9E%D7%95%D7%AA-0',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4218037-A.jpg?v=1734677045&width=1800',
        price: 39,
      },
    ],
  },
  'מוצצים ואביזריהם': {
    description: 'פטמת סיליקון/גומי להרגעה וקליפס לתפירה לבגד.',
    tip: 'תינוקות בררנים. כמות: 2-3 סוגים לטעימה. קליפס למוצץ הוא חובה.',
    type: 'must',
    products: [
      {
        name: 'ביבס - מוצץ לטקס מידה 1 COLOUR מומינים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/pacifiers-and-teethers/latex-sucking/%D7%9E%D7%95%D7%A6%D7%A5-%D7%9C%D7%98%D7%A7%D7%A1-%D7%9E%D7%99%D7%93%D7%94-1-COLOUR-%D7%9E%D7%95%D7%9E%D7%99%D7%A0%D7%99%D7%9D/p/706846',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/5713795273379.jpg',
        price: 79,
      },
      {
        name: 'מחזיק מוצץ עם שרשרת צ’יקו – Chicco Adaptable Easy Clip With Chain',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%9e%d7%97%d7%96%d7%99%d7%a7-%d7%9e%d7%95%d7%a6%d7%a5-%d7%a2%d7%9d-%d7%a9%d7%a8%d7%a9%d7%a8%d7%aa-%d7%a6%d7%99%d7%a7%d7%95-chicco-adaptable-easy-clip-with-chain/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/03/408411.jpg',
        price: 34,
      },
    ],
  },
  'מברשות בקבוקים': {
    description: 'מברשת צרה לניקוי פנימי של הבקבוק והפטמה.',
    tip: 'מברשת עם ספוג בקצה מנקה טוב יותר. החליפו כל חודש-חודשיים (צובר חיידקים).',
    type: 'must',
    products: [
      {
        name: 'מברשת ספוג לבקבוק ולפיטמה',
        store: '',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-bottle-sterilizers/%D7%9E%D7%91%D7%A8%D7%A9%D7%AA-%D7%A1%D7%A4%D7%95%D7%92-%D7%9C%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%95%D7%9C%D7%A4%D7%99%D7%98%D7%9E%D7%94/p/591931',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/735282160202.jpg',
        price: 33,
      },
    ],
  },
  'מייבש בקבוקים': {
    description: 'מתקן ייעודי לייבוש בקבוקים ואביזרים קטנים.',
    tip: 'חוסך מקום על השיש ומייבש מהיר. לא חובה קריטית, אבל מקל מאוד על החיים.',
    type: 'treat',
    products: [
      {
        name: 'מייבש בקבוקים מתקפל מפלסטיק NANNY - לבן',
        store: '',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-bottles/%D7%9E%D7%99%D7%99%D7%91%D7%A9-%D7%91%D7%A7%D7%91%D7%95%D7%A7%D7%99%D7%9D-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C-%D7%9E%D7%A4%D7%9C%D7%A1%D7%98%D7%99%D7%A7-NANNY-%D7%9C%D7%91%D7%9F/p/mp-00055712',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/8850980020541.jpg',
        price: 49,
      },
    ],
  },
  'סטריליזטורים': {
    description: 'מכשיר לחיטוי בקבוקים ומוצצים (במיקרוגל או חשמלי).',
    tip: 'הדגם למיקרוגל הוא הכי זול, מהיר ויעיל. אפשר להרתיח מים בסיר, אבל זה חוסך זמן יקר.',
    type: 'treat',
    products: [
      {
        name: 'bottle washer pro',
        store: 'Baby Brezza',
        url: 'https://babybrezza.co.il/products/bundle-pro-test',
        image: 'https://babybrezza.co.il/cdn/shop/files/file_500x.png?v=1763469550',
        price: 1490,
      },
      {
        name: 'Baby Brezza',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/sterilizers/products/%D7%A1%D7%98%D7%A8%D7%99%D7%9C%D7%99%D7%96%D7%98%D7%95%D7%A8-%D7%97%D7%A9%D7%9E%D7%9C%D7%99-%D7%95%D7%9E%D7%99%D7%99%D7%91%D7%A9',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-3801114-A_812bb9bb-33dc-48a3-965c-1d9ec2279c9a.jpg?v=1733671735&width=720',
        price: 649,
      },
    ],
  },
  'מחמם בקבוקים': {
    description: 'מכשיר חשמלי לחימום הבקבוק לטמפרטורה מדויקת.',
    tip: 'נדרש רק אם את מניקה ושואבת חלב אם — להאכלה בתמ"ל אין בכך צורך. גם בלעדיו אפשר להסתדר עם כוס מים חמים.',
    type: 'treat',
    products: [
      {
        name: 'מחמם בקבוקים וסטריליזטור קינזי לוגן – Kinsey Logan Bottle Warmer and Sterilizer',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%97%D7%9E%D7%9D-%D7%91%D7%A7%D7%91%D7%95%D7%A7%D7%99%D7%9D-%D7%95%D7%A1%D7%98%D7%A8%D7%99%D7%9C%D7%99%D7%96%D7%98%D7%95%D7%A8-%D7%A7%D7%99%D7%A0%D7%96%D7%99-%D7%9C%D7%95%D7%92%D7%9F-kinsey/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2025/10/141414.jpg',
        price: 199,
      },
    ],
  },
  'תרמוסים ומחלק מנות': {
    description: 'מיכל למים חמים וקופסה מחולקת לאבקת תמ"ל.',
    tip: 'חובה ליציאה מהבית אם לא מניקים: מים חמים ומחלק מנות מדוד לדרך.',
    type: 'treat',
    products: [
      {
        name: 'בקבוק נירוסטה בנפח 240 מ\'\'ל Rapidcool Cooler מבית Nuby',
        store: 'ksp',
        url: 'https://ksp.co.il/web/item/295622',
        image: 'https://img.ksp.co.il/item/295622/b_14.jpg?v=1709014774',
        price: 185,
      },
      {
        name: 'מחלק מנות 3 שכבות בצבע מנטה – נוחות בהאכלה מחוץ לבית',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/distributors-dishes/%D7%9E%D7%97%D7%9C%D7%A7-%D7%9E%D7%A0%D7%95%D7%AA-3-%D7%A9%D7%9B%D7%91%D7%95%D7%AA-%D7%91%D7%A6%D7%91%D7%A2-%D7%9E%D7%A0%D7%98%D7%94-%E2%80%93-%D7%A0%D7%95%D7%97%D7%95%D7%AA-%D7%91%D7%94%D7%90%D7%9B%D7%9C%D7%94-%D7%9E%D7%97%D7%95%D7%A5-%D7%9C%D7%91%D7%99%D7%AA/p/mp-00441679',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/3800171200981.jpg',
        price: 29,
      },
    ],
  },
  'טטרות': {
    description: 'ריבועי בד רב-שימושיים לפליטות, צלון, משטח וכיסוי.',
    tip: 'הדבר הכי שימושי בבית. כמות מומלצת: לפחות 10-15 יחידות.',
    type: 'must',
    products: [
      {
        name: 'חמישיית חיתולי טטרה מיננה תכלת – Minene',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%97%D7%9E%D7%99%D7%A9%D7%99%D7%99%D7%AA-%D7%97%D7%99%D7%AA%D7%95%D7%9C%D7%99-%D7%98%D7%98%D7%A8%D7%94-%D7%9E%D7%99%D7%A0%D7%A0%D7%94-%D7%AA%D7%9B%D7%9C%D7%AA-minene/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/02/88793.jpg',
        price: 69,
      },
    ],
  },
  'כיסא אוכל': {
    description: 'כיסא גבוה להאכלה ליד שולחן.',
    tip: 'לא דחוף לחודשים הראשונים — התינוק יתחיל לאכול מוצקים רק סביב גיל 6 חודשים. אפשר להשאיר למתנה או לרכוש קרוב לגיל.',
    type: 'treat',
    products: [
      {
        name: 'כיסא אוכל בוגבו ג\'ירף',
        store: 'bugaboo',
        url: 'https://www.bugaboo-distributor.co.il/product/bugaboo-giraffe-high-chair/',
        image: 'https://www.bugaboo-distributor.co.il/wp-content/uploads/%D7%91%D7%95%D7%92%D7%91%D7%95-%D7%92%D7%99%D7%A8%D7%A3-%D7%A2%D7%A5-%D7%91%D7%94%D7%99%D7%A8-%D7%9C%D7%91%D7%9F-650x650.jpg',
        price: 1355,
      },
      {
        name: 'Stokke',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/kysvt-vkl/products/%D7%9B%D7%99%D7%A1%D7%90-%D7%90%D7%95%D7%9B%D7%9C-%D7%98%D7%A8%D7%99%D7%A4-%D7%98%D7%A8%D7%90%D7%A4-%D7%9C%D7%91%D7%9F',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7300184-A.jpg?v=1734446778&width=1800',
        price: 1190,
      },
    ],
  },
  'סינרים לתינוק': {
    description: 'הגנה על הבגד מפני פליטות ואוכל.',
    tip: 'להתחלה רק סינרי בד ("בנדנה") לפליטות. כמות: 5-10 יחידות.',
    type: 'treat',
    products: [
      {
        name: 'זוג סינרים לתינוק עשויים בד מגבת עם ציפוי פנימי מונע רטיבות - ציפורים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/eating-aprons/%D7%96%D7%95%D7%92-%D7%A1%D7%99%D7%A0%D7%A8%D7%99%D7%9D-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%A2%D7%A9%D7%95%D7%99%D7%99%D7%9D-%D7%91%D7%93-%D7%9E%D7%92%D7%91%D7%AA-%D7%A2%D7%9D-%D7%A6%D7%99%D7%A4%D7%95%D7%99-%D7%A4%D7%A0%D7%99%D7%9E%D7%99-%D7%9E%D7%95%D7%A0%D7%A2-%D7%A8%D7%98%D7%99%D7%91%D7%95%D7%AA-%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D/p/mp-00413216',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7297219563591.jpg',
        price: 29,
      },
    ],
  },
  'בוסטר האכלה': {
    description: 'מושב פלסטיק שמתלבש על כיסא רגיל בבית.',
    tip: 'פתרון מעולה לדירות קטנות או לנסיעות, אבל רלוונטי רק כשהילד יושב (חצי שנה).',
    type: 'treat',
    products: [
      {
        name: 'מושב הגבהה לכיסא אוכל מעוצב 2 ב 1 - Cashmere בז\'',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-feeding-seats/%D7%9E%D7%95%D7%A9%D7%91-%D7%94%D7%92%D7%91%D7%94%D7%94-%D7%9C%D7%9B%D7%99%D7%A1%D7%90-%D7%90%D7%95%D7%9B%D7%9C-%D7%9E%D7%A2%D7%95%D7%A6%D7%91-2-%D7%91-1-Cashmere-%D7%91%D7%96/p/mp-00002596',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/74451106789.jpg',
        price: 199,
      },
    ],
  },

  // --- הנקה ---
  'משאבות הנקה ואביזריהן': {
    description: 'מכשיר ידני או חשמלי לשאיבת חלב אם.',
    tip: 'אל תקנו מראש! קחו מיד שרה או בסבסוד קופה. קודם תראו שההנקה זורמת.',
    type: 'treat',
    products: [
      {
        name: 'Biamba Pump SOft',
        store: 'Biamba',
        url: 'https://biamba.co.il/biamba-pump-soft/',
        image: 'https://biamba.co.il/wp-content/uploads/2023/07/PNG-%D7%A1%D7%95%D7%A4%D7%98-06-1-1-1.png.avif',
        price: 790,
      },
      {
        name: 'אנבלה משאבת חלב חשמלית',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/breastpumps/products/%D7%9E%D7%A9%D7%90%D7%91%D7%AA-%D7%97%D7%9C%D7%91-%D7%97%D7%A9%D7%9E%D7%9C%D7%99%D7%AA',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-3801335-A.jpg?v=1734522832&width=1800',
        price: 1190,
      },
    ],
  },
  'כריות הנקה': {
    description: 'כרית בצורת "ח" לתמיכה בתינוק בזמן הנקה.',
    tip: 'חשוב שתהיה קשיחה וצפופה כדי להרים את התינוק אליכם ולשמור על הגב.',
    type: 'treat',
    products: [
      {
        name: 'כרית הנקה',
        store: 'mama-sita',
        url: 'https://www.mama-sita.com/%D7%9E%D7%95%D7%A6%D7%A8/%D7%9B%D7%A8%D7%99%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-%D7%9C%D7%99%D7%97%D7%99%D7%93-%D7%90%D7%91%D7%9F/',
        image: 'https://www.mama-sita.com/wp-content/uploads/BAL_6037-B.jpg',
        price: 389,
      },
      {
        name: 'כרית הנקה - SUPER DELUXE PLATINUM',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/nursing-pillows/%D7%9B%D7%A8%D7%99%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-SUPER-DELUXE-PLATINUM/p/mp-00254005',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/705873002761.jpg',
        price: 349,
      },
    ],
  },
  'סינרי הנקה': {
    description: 'סינר רחב לכיסוי בזמן הנקה בציבור.',
    tip: 'להנקה בציבור – חפשו סינר עם קשת בצוואר לקשר עין ואוויר.',
    type: 'treat',
    products: [
      {
        name: 'סינר הנקה 100% כותנה טטרא - תכלת mountain',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/breastfeeding-aprons/%D7%A1%D7%99%D7%A0%D7%A8-%D7%94%D7%A0%D7%A7%D7%94-100%25-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%98%D7%98%D7%A8%D7%90-%D7%AA%D7%9B%D7%9C%D7%AA-mountain/p/mp-00417153',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7297219562563.jpg',
        price: 75,
      },
    ],
  },
  'רפידות ומגיני פטמות': {
    description: 'רפידות ספיגה לחזייה וכיסויי סיליקון לפטמה.',
    tip: 'רפידות הן חובה למניעת כתמים. מגיני פטמות – לקנות רק בהמלצת יועצת הנקה ולא מראש.',
    type: 'must',
    products: [
      {
        name: 'רפידות nursicare',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%A8%D7%A4%D7%99%D7%93%D7%95%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-%D7%98%D7%99%D7%A4%D7%95%D7%9C%D7%99%D7%95%D7%AA/',
        image: 'https://tzirim.co.il/app/uploads/2024/10/DSC_1116-Enhanced-NR-2-copy-Photoroom-Photoroom.png.webp',
        price: 91,
      },
    ],
  },
  'כורסאות הנקה': {
    description: 'כורסא נוחה ומתנדנדת לחדר התינוק.',
    tip: 'מותרות. כל כורסא נוחה בסלון עם הדום לרגליים תעשה את העבודה.',
    type: 'treat',
    products: [
      {
        name: 'כורסת הנקה רויאל לבן בד אפור',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%9B%D7%95%D7%A8%D7%A1%D7%90%D7%95%D7%AA-%D7%94%D7%A0%D7%A7%D7%94/products/6754856-%D7%9B%D7%95%D7%A8%D7%A1%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-%D7%A8%D7%95%D7%99%D7%90%D7%9C-%D7%9C%D7%91%D7%9F-%D7%91%D7%93-%D7%90%D7%A4%D7%95%D7%A8-%D7%98%D7%9C-%D7%A8%D7%94%D7%99%D7%98%D7%99-%D7%AA%D7%99%D7%A0%D7%95%D7%A7%D7%95%D7%AA',
        image: 'https://motsesim.co.il/cdn/shop/files/014596de9cf9f0e99253199e0d0f2d9d.png?v=1750834374&width=1946',
        price: 1190,
      },
      {
        name: 'כורסת הנקה מתנדנדת דייניז סקיילר שמנת – Dainy’s Skylar Ivory',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%9b%d7%95%d7%a8%d7%a1%d7%aa-%d7%94%d7%a0%d7%a7%d7%94-%d7%9e%d7%aa%d7%a0%d7%93%d7%a0%d7%93%d7%aa-%d7%93%d7%99%d7%99%d7%a0%d7%99%d7%96-%d7%a1%d7%a7%d7%99%d7%99%d7%9c%d7%a8-%d7%a9%d7%9e%d7%a0%d7%aa/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/11/141388.jpg',
        price: 999,
      },
    ],
  },

  // --- אמבט וטיפול בתינוק ---
  'אמבטיות ומעמדים': {
    description: 'אמבט פלסטיק לתינוק + רגליים להגבהה.',
    tip: 'חובה לקנות עם מעמד (רגליים) כדי לשמור על הגב!',
    type: 'must',
    products: [
      {
        name: 'אמבטיה סיליקון מתקפלת כולל מעמד צינורית ומושב אמבטיה דפני מתקפל',
        store: 'rainbowbaby',
        url: 'https://www.rainbowbaby.co.il/product/%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%A1%D7%99%D7%9C%D7%99%D7%A7%D7%95%D7%9F-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C%D7%AA-%D7%9B%D7%95%D7%9C%D7%9C-%D7%9E%D7%A2%D7%9E%D7%93-%D7%95%D7%A6%D7%99%D7%A0%D7%95%D7%A8%D7%99%D7%AA',
        image: 'https://www.rainbowbaby.co.il/images/itempics/1933_1810202517405313017_large.jpg',
        price: 349,
      },
      {
        name: 'בבה ג׳ו אמבטיה מעוצבת LUMA אפור',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby_bath_tubs/products/%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%9E%D7%A2%D7%95%D7%A6%D7%91%D7%AA-luma-%D7%90%D7%A4%D7%95%D7%A8-1',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4521341-A.jpg?v=1762761964&width=1800',
        price: 399,
      },
    ],
  },
  'מושבי אמבטיה': {
    description: 'מתקן ("דפני") שמחזיק את התינוק שוכב בתוך המים.',
    tip: 'היד השלישית שלכם. נותן ביטחון לקלח לבד. מוצר חובה להתחלה.',
    type: 'must',
    products: [
      {
        name: 'דפני לאמבטיה - לבן',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby_bath_tubs/products/%D7%9E%D7%95%D7%A9%D7%91-%D7%90%D7%9E%D7%91%D7%98-%D7%9E%D7%AA%D7%9B%D7%95%D7%95%D7%A0%D7%9F-%D7%9C%D7%91%D7%9F-1',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-6200235-A.jpg?v=1734522810&width=1800',
        price: 29,
      },
    ],
  },
  'מגבות לתינוק': {
    description: 'מגבת רכה עם "כובע" (קפוצ\'ון) בפינה.',
    tip: 'עדיף מגבות "ענק" שיעטפו גם בגיל שנתיים. כמות מומלצת: 2-3 מגבות.',
    type: 'must',
  },
  'מברשות וסט מניקור': {
    description: 'מספריים עדינים, פצירה ומברשת שיער רכה.',
    tip: 'הציפורניים שלהם חדות. מספריים עגולים או פצירה חשמלית הם חובה.',
    type: 'treat',
    products: [
      {
        name: 'סט מניקור וטיפוח לתינוק צ’יקו – Chicco Nail Care Set',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%A1%D7%98-%D7%9E%D7%A0%D7%99%D7%A7%D7%95%D7%A8-%D7%95%D7%98%D7%99%D7%A4%D7%95%D7%97-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-nail-care-set/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2019/09/100190.jpeg',
        price: 44,
      },
    ],
  },
  'תכשירי טיפול בתינוק': {
    description: 'סבון, שמפו, שמן ושמני עיסוי מותאמים לתינוק.',
    tip: 'פחות זה יותר. שמן אמבט עדיף על סבון שמייבש. המנעו מבישום.',
    type: 'must',
    products: [
      {
        name: 'פורטה שמן רחצה טיפולי לתינוק',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-wash/baby-bathing-oil/%D7%A4%D7%95%D7%A8%D7%98%D7%94-%D7%A9%D7%9E%D7%9F-%D7%A8%D7%97%D7%A6%D7%94-%D7%98%D7%99%D7%A4%D7%95%D7%9C%D7%99-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7/p/364340',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290013462039.jpg',
        price: 100,
      },
    ],
  },
  'מד חום למים': {
    description: 'צעצוע שצף ומודד את חום המים (לרוב 37 מעלות).',
    tip: 'מוצר חובה להורים טריים כדי למנוע כוויות. אל תסמכו על המרפק בהתחלה.',
    type: 'must',
    products: [
      {
        name: 'מדחום לאמבטיה טוויגי – Twigy Flawless™ Bath Thermometer',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%93%D7%97%D7%95%D7%9D-%D7%9C%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-flawless-bath-thermometer-3/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2021/05/1-13.jpg',
        price: 19,
      },
    ],
  },
  'צעצועים לאמבטיה': {
    description: 'ברווזים ומשחקי מים.',
    tip: 'מיותר לניובורן. אפשר לקנות בהמשך כשהם מתחילים לשחק במים.',
    type: 'treat',
    products: [
      {
        name: 'ערכת משחק אמבטיה - שבשבת פרח',
        store: 'hilisplay',
        url: 'https://hilisplay.com/products/%D7%A2%D7%A8%D7%9B%D7%AA-%D7%9E%D7%A9%D7%97%D7%A7%D7%99-%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%A9%D7%91%D7%A9%D7%91%D7%AA-%D7%A4%D7%A8%D7%97-%D7%9E%D7%91%D7%99%D7%AA-pit-toys',
        image: 'https://hilisplay.com/cdn/shop/files/b_2_18.jpg?v=1744579996&width=500',
        price: 55,
      },
    ],
  },
  'טבעות אמבטיה': {
    description: 'מושב ישיבה מפלסטיק לאמבטיה (לא שכיבה).',
    tip: 'מסוכן לשימוש לפני שהתינוק יושב יציב (סביב 7-8 חודשים).',
    type: 'treat',
    products: [
      {
        name: 'טבעת אמבט',
        store: 'נינו',
        url: 'https://nino.co.il/product/%D7%98%D7%91%D7%A2%D7%AA-%D7%90%D7%9E%D7%91%D7%98/',
        image: 'https://nino.co.il/wp-content/uploads/2025/12/LS-2.jpg',
        price: 99,
      },
    ],
  },

  // --- ביגוד ראשוני ---
  'בגדי גוף לתינוק': {
    description: 'חולצה שנסגרת למטה בתיקתק (מחזיק את החיתול).',
    tip: 'שכבה אחת יותר מכם. כמות: 7-10 יח\'. מידת NB מחזיקה חודש גג, הרוב 0-3.',
    type: 'must',
  },
  'מכנסיים ורגליות לתינוק': {
    description: 'מכנס עם רגלית סגורה (כמו גרב מובנה).',
    tip: 'בסיסי ביותר. כמות: 7-10 יח\'. ודאו שהגומי בבטן רך ולא לוחץ.',
    type: 'must',
  },
  'אוברולים לתינוקות': {
    description: 'בגד גוף ומכנס מחוברים ("וואנזי").',
    tip: 'הכי נוח לשינה. כמות: 4-6 יח\'. טיפ של אלופות: רק רוכסן!',
    type: 'must',
  },
  'סטים לתינוקות': {
    description: 'חליפות מעוצבות (ג\'ינסים, מכופתרים).',
    tip: 'ג\'ינסים וצווארונים זה לא נוח. ביומיום הכי טוב כותנה רכה ופשוטה.',
    type: 'treat',
  },
  'כובע לתינוק': {
    description: 'כובע כותנה רך לשמירת חום הראש.',
    tip: 'חובה ליציאה מבי"ח. כמות: 2-3 יח\'. בבית מחומם להוריד (סכנת חימום יתר).',
    type: 'must',
  },
  'כפפות לתינוק': {
    description: 'כפפות בד למניעת שריטות בפנים.',
    tip: 'נוטות ליפול. עדיף לקנות בגדי גוף עם שרוול מתהפך שמכסה את כף היד.',
    type: 'treat',
    products: [
      {
        name: 'שני זוגות כפפות לורנס',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%A9%D7%A0%D7%99-%D7%96%D7%95%D7%92%D7%95%D7%AA-%D7%9B%D7%A4%D7%A4%D7%95%D7%AA/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2023/02/87130.jpg',
        price: 19,
      },
    ],
  },
  'גרביים לתינוקות': {
    description: 'גרביים קטנות לחימום כף הרגל.',
    tip: 'תמיד נעלמות. כמות: 4-6 זוגות. עדיף רגליות (מכנס עם גרב) שסוגרות את הפינה.',
    type: 'treat',
    products: [
      {
        name: 'גרבי-בית - מיקס אפור',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-clothing/baby-socks/%D7%92%D7%A8%D7%91%D7%99-%D7%91%D7%99%D7%AA-%D7%9E%D7%99%D7%A7%D7%A1-%D7%90%D7%A4%D7%95%D7%A8/p/mp-00053119',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290117152935.jpg',
        price: 29,
      },
    ],
  },

  // --- מצעים ואקססוריז ---
  'Nest (קן לתינוק)': {
    description: 'כרית מעוצבת בצורת קן המספקת תחושת חיבוק וביטחון לתינוק.',
    tip: 'נהדר לשינה ליד ההורים או למנוחה בשעות היום. אסור להשתמש ללא השגחה ולא מומלץ לשינה לילית בטוחה.',
    type: 'treat',
    products: [
      {
        name: 'בייבי-נסט דגם Nescoffee',
        store: 'Naimi Baby',
        url: 'https://www.naimibaby.com/shop/%d7%91%d7%99%d7%99%d7%91%d7%99-%d7%a0%d7%a1%d7%98-%d7%93%d7%92%d7%9d-nescoffee/',
        image: 'https://www.naimibaby.com/wp-content/uploads/2025/10/IMG_5088.jpeg',
        price: 389,
      },
      {
        name: 'הריונית',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/toys-and-activities/activity-mats/%D7%91%D7%99%D7%99%D7%91%D7%99-%D7%A0%D7%A1%D7%98-%D7%90%D7%A8%D7%A0%D7%91%D7%95%D7%9F/p/mp-00351627',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290019119043.jpg',
        price: 249,
      },
    ],
  },
  'סדינים': {
    description: 'סדין גומי המותאם למזרן תינוק/עריסה.',
    tip: 'חייב להיות מתוח היטב. כמות מומלצת: 3-5 סדינים כי יש הרבה נזילות בהתחלה.',
    type: 'must',
    products: [
      {
        name: 'סדין למיטת תינוק',
        store: 'נינו',
        url: 'https://nino.co.il/product/54678213/',
        image: 'https://nino.co.il/wp-content/uploads/2025/07/sheet-Anemone-blossom-pp.jpg',
        price: 65,
      },
    ],
  },
  'שמיכות לתינוק': {
    description: 'שמיכות דקות (טריקו/מוסלין) או שמיכות עיטוף.',
    tip: 'שמיכת עיטוף (Swaddle) עוזרת להרגעה. כמות: 2-3 יחידות.',
    type: 'must',
    products: [
      {
        name: 'שמיכת אינטרלוק 2 שכבות- תכלת הדפס בייגלה',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%A9%D7%9E%D7%99%D7%9B%D7%95%D7%AA-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7/products/7271556-%D7%A9%D7%9E%D7%99%D7%9B%D7%AA-%D7%90%D7%99%D7%A0%D7%98%D7%A8%D7%9C%D7%95%D7%A7-2-%D7%A9%D7%9B%D7%91%D7%95%D7%AA-%D7%AA%D7%9B%D7%9C%D7%AA-%D7%94%D7%93%D7%A4%D7%A1-%D7%91%D7%99%D7%99%D7%92%D7%9C%D7%94-%D7%91%D7%95-%D7%91%D7%99',
        image: 'https://motsesim.co.il/cdn/shop/files/b2bc21208b087e6a87d07ae3b6b9f863.png?v=1751884985&width=1946',
        price: 59,
      },
      {
        name: 'שמיכת חורף דו צדדית פסים',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%A9%D7%9E%D7%99%D7%9B%D7%95%D7%AA-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7/products/5360526-%D7%A9%D7%9E%D7%99%D7%9B%D7%AA-%D7%97%D7%95%D7%A8%D7%A3-%D7%93%D7%95-%D7%A6%D7%93%D7%93%D7%99%D7%AA-%D7%A4%D7%A1%D7%99%D7%9D-%D7%91%D7%95-%D7%91%D7%99',
        image: 'https://motsesim.co.il/cdn/shop/files/01913ae458d7ca6a166870d1a4a8deff.png?v=1752149607&width=1946',
        price: 69,
      },
    ],
  },
  'משטחי החתלה': {
    description: 'משטח ספוג מצופה ניילון להנחה על השידה.',
    tip: 'רק משטח שעוונית/ניילון שקל לנקות במגבון ("ניגוב וזהו").',
    type: 'must',
    products: [
      {
        name: 'בייבי נסט ארנבון',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/diapering/diapering-surfaces-and-covers/%D7%9C%D7%99%D7%99%D7%A3-%D7%91%D7%99%D7%99%D7%91%D7%99%D7%96-%D7%9E%D7%A9%D7%98%D7%97-%D7%94%D7%97%D7%AA%D7%9C%D7%94-%D7%93%D7%99%D7%A1%D7%A0%D7%99-%D7%9E%D7%99%D7%A7%D7%99-%D7%95%D7%9E%D7%99%D7%A0%D7%99/p/686729',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290120932531.jpg',
        price: 17,
      },
    ],
  },
  'מגן ראש לתינוק': {
    description: 'כריות שטוחות שנקשרות לסורגי המיטה.',
    tip: 'אזהרת בטיחות: ארגוני הבריאות ממליצים על מיטה ריקה לחלוטין מחשש לחנק. אם קונים, ודאו שמהודק היטב ודק.',
    type: 'treat',
    products: [
      {
        name: 'מגן ראש לעריסה mix it סנאים',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/liners/products/%D7%9E%D7%92%D7%9F-%D7%A8%D7%90%D7%A9-%D7%9C%D7%A2%D7%A8%D7%99%D7%A1%D7%94-mix-it-%D7%A1%D7%A0%D7%90%D7%99%D7%9D',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7269026-A.jpg?v=1762252782&width=1800',
        price: 109,
      },
    ],
  },
  'נחשושים': {
    description: 'כריות ארוכות שתוחמות את המיטה.',
    tip: 'מסוכן! משרד הבריאות ממליץ לא להכניס למיטה בשינה (סכנת חנק).',
    type: 'treat',
    products: [
      {
        name: 'נחשוש לתינוק 100% כותנה - שמנת מיננה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-bedding/snake-pillow/%D7%A0%D7%97%D7%A9%D7%95%D7%A9-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-100%25-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%A9%D7%9E%D7%A0%D7%AA/p/mp-00342624',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7297629140719.jpg',
        price: 200,
      },
    ],
  },
  'כריות לתינוק': {
    description: 'כרית לראש התינוק.',
    tip: 'אסור לשימוש מתחת לגיל שנה (סכנת חנק ומוות בעריסה).',
    type: 'treat',
    products: [
      {
        name: 'כרית צמה למיטה אולימולי חום – Olimoli Baby Braided Pillow Sand',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9B%D7%A8%D7%99%D7%AA-%D7%A6%D7%9E%D7%94-%D7%9C%D7%9E%D7%99%D7%98%D7%94-%D7%90%D7%95%D7%9C%D7%99%D7%9E%D7%95%D7%9C%D7%99-%D7%97%D7%95%D7%9D-olimoli-baby-braided-pillow-sand/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2025/04/141420.jpg',
        price: 199,
      },
    ],
  },

  // --- צעצועים ---
  'מובייל לתינוק': {
    description: 'צעצוע מסתובב ומנגן שנתלה מעל המיטה.',
    tip: 'מצוין עד גיל 5 חודשים. חפשו צורות בשחור-לבן (קונטרסט).',
    type: 'treat',
    products: [
      {
        name: 'מובייל צ’יקו מקרין לתקרה אור ירח וכוכבים – Chicco Next 2 Moonlight',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%9e%d7%95%d7%91%d7%99%d7%99%d7%9c-%d7%9e%d7%a7%d7%a8%d7%99%d7%9f-%d7%9c%d7%aa%d7%a7%d7%a8%d7%94-%d7%90%d7%95%d7%a8-%d7%99%d7%a8%d7%97-%d7%95%d7%9b%d7%95%d7%9b%d7%91%d7%99%d7%9d-next-2-moonlight/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2022/06/98280.jpg',
        price: 189,
      },
      {
        name: 'טייני לאב Tiny love',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/bed-and-playpen-toys/products/%D7%9E%D7%95%D7%91%D7%99%D7%99%D7%9C-%D7%A7%D7%9C%D7%90%D7%A1%D7%99-%D7%97%D7%99%D7%95%D7%AA-%D7%91%D7%99%D7%A2%D7%A8',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7520087-A.jpg?v=1733671116&width=1800',
        price: 349,
      },
    ],
  },
  'טרמפולינות': {
    description: 'כיסא בד גמיש חצי-שכיבה, לעיתים רוטט.',
    tip: 'הבייביסיטר שלכם למקלחת. מעולה לזמן ערות קצר, לא לשינה.',
    type: 'treat',
    products: [
      {
        name: 'מובייל קלאסי חיות ביער',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/swings-and-bouncers/products/%D7%98%D7%A8%D7%9E%D7%A4%D7%95%D7%9C%D7%99%D7%A0%D7%94-%D7%A8%D7%9B%D7%94-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%A9%D7%97%D7%95%D7%A8-%D7%90%D7%A4%D7%95%D7%A8-%D7%9B%D7%94%D7%94',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4344022-A.jpg?v=1734703739&width=1800',
        price: 1210,
      },
      {
        name: 'טרמפולינה רכה כותנה שחור/אפור כהה',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%98%d7%a8%d7%9e%d7%a4%d7%95%d7%9c%d7%99%d7%a0%d7%94-%d7%97%d7%a9%d7%9e%d7%9c%d7%99%d7%aa-%d7%98%d7%95%d7%95%d7%99%d7%92%d7%99-%d7%9e%d7%a8%d7%91%d7%9c-%d7%91%d7%99%d7%99-%d7%9e%d7%a1%d7%92%d7%a8/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/03/40502.jpg',
        price: 699,
      },
    ],
  },
  'נדנדות': {
    description: 'מתקן חשמלי שמנדנד את התינוק להרגעה.',
    tip: 'הצלה לגזים, אבל תופס מקום. נסו להשיג יד שנייה או בהשאלה.',
    type: 'treat',
    products: [
      {
        name: 'נדנדה וטרמפולינת חשמלית לתינוק \'שיר\' עם 3 מצבי נידנוד, מצבי שכיבה/ישיבה וסיבוב 360 – אפורבהיר',
        store: 'הממלכה הקטנה',
        url: 'https://www.mommyshop.co.il/product/%d7%a0%d7%93%d7%a0%d7%93%d7%94-%d7%95%d7%98%d7%a8%d7%9e%d7%a4%d7%95%d7%9c%d7%99%d7%a0%d7%aa-%d7%97%d7%a9%d7%9e%d7%9c%d7%99%d7%aa-%d7%9c%d7%aa%d7%99%d7%a0%d7%95%d7%a7-%d7%a9%d7%99%d7%a8-%d7%a2-4/',
        image: 'https://www.mommyshop.co.il/wp-content/uploads/2025/09/4e29787a72e1c28c0bc738494391fb63-733x1024.jpg',
        price: 339,
      },
      {
        name: 'ספורט ליין נדנדה ג\'יגל בז\'',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/swings/products/%D7%A0%D7%93%D7%A0%D7%93%D7%94-%D7%92%D7%99%D7%92%D7%9C-%D7%91%D7%96',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-5800335-A.jpg?v=1734525288&width=1800',
        price: 1190,
      },
    ],
  },
  'אוניברסיטה לתינוק': {
    description: 'משטח פעילות עם קשתות וצעצועים תלויים.',
    tip: 'חובה להתפתחות ("זמן בטן"). ודאו שנכנס למכונת כביסה.',
    type: 'treat',
    products: [
      {
        name: 'מוכר חיצוניבאתר בלבד',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/toys-and-activities/toys-for-learning-and-development/%D7%90%D7%95%D7%A0%D7%99%D7%91%D7%A8%D7%A1%D7%99%D7%98%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7%D7%95%D7%AA-%D7%9B%D7%95%D7%9C%D7%9C-5-%D7%A6%D7%A2%D7%A6%D7%95%D7%A2%D7%99%D7%9D-%D7%9E%D7%A2%D7%A5/p/mp-00410358',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/210210343759.jpg',
        price: 179,
      },
      {
        name: 'Hilis',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/taf-toys/activity-surfaces/360-savanna-jym/',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2023/02/242bdac7872e820d8d3b6fc678487229.jpg',
        price: 270,
      },
    ],
  },
  'שמיכות פעילות': {
    description: 'שטיח מרופד להנחה על הרצפה.',
    tip: 'משטח מבודד לרצפה. רלוונטי בעיקר לשלב הזחילה (חצי שנה).',
    type: 'treat',
    products: [
      {
        name: 'אוניברסיטה לתינוקות כולל 5 צעצועים מעץ',
        store: 'אמיגו',
        url: 'https://www.amigo.co.il/product/%D7%A4%D7%99%D7%A9%D7%A8-%D7%A4%D7%A8%D7%99%D7%99%D7%A1-%D7%9E%D7%96%D7%A8%D7%9F-%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C-%D7%91%D7%A6%D7%95%D7%A8%D7%AA-%D7%A4%D7%A0%D7%93/',
        image: 'https://www.amigo.co.il/wp-content/uploads/2025/11/71KwQOfuvlL._AC_UF8941000_QL80_-1.jpg',
        price: 149,
      },
    ],
  },
  'נשכנים ורעשנים': {
    description: 'צעצועי אחיזה ונשיכה לפה.',
    tip: 'רלוונטי רק מגיל 3 חודשים (תפיסה). אחד או שניים יספיקו.',
    type: 'treat',
    products: [
      {
        name: 'מארז נשכנים לפעוטות',
        store: 'אמיגו',
        url: 'https://www.amigo.co.il/product/%D7%9E%D7%90%D7%A8%D7%96-%D7%A8%D7%A2%D7%A9%D7%A0%D7%99%D7%9D-%D7%9C%D7%A4%D7%A2%D7%95%D7%98%D7%95%D7%AA/',
        image: 'https://www.amigo.co.il/wp-content/uploads/2025/07/602772647171-scaled.jpg',
        price: 49,
      },
    ],
  },
  'שמיכי לתינוק': {
    description: 'חתיכת בד קטנה עם ראש בובה ("חפץ מעבר").',
    tip: 'חפץ מעבר מרגיע. ודאו שאין חלקים קטנים שיכולים להיתלש.',
    type: 'treat',
    products: [
      {
        name: 'שמיכי מבד טדי דובי',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%A9%D7%9E%D7%99%D7%9B%D7%99-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7/products/7909491-%D7%A9%D7%9E%D7%99%D7%9B%D7%99-%D7%9E%D7%91%D7%93-%D7%98%D7%93%D7%99-%D7%93%D7%95%D7%91%D7%99-%D7%9C%D7%95%D7%A8%D7%94-%D7%A1%D7%95%D7%95%D7%99%D7%A1%D7%A8%D7%94',
        image: 'https://motsesim.co.il/cdn/shop/files/e6aa76abe6c7757a29b0b979559b7bd1.png?v=1751786471&width=1946',
        price: 49,
      },
    ],
  },

  // --- הכנה ללידה ולאמא ---
  'תחתונים חד-פעמיים / רשת': {
    description: 'תחתונים חד-פעמיים או מרשת לימים הראשונים לאחר הלידה.',
    tip: 'קחי לבית החולים חבילה אחת. נוחים יותר מתחתונים רגילים עם תחבושות גדולות.',
    type: 'must',
    products: [
      {
        name: 'תחתוני רשת',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/care/feminine-hygiene-products/after-birth/postpartum-web-briefs/%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%99-%D7%A8%D7%A9%D7%AA-L-XL/p/649540',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290118204114.jpg',
        price: 19,
      },
    ],
  },
  'תחבושות לאחר לידה': {
    description: 'תחבושות גדולות וסופגות במיוחד לימים הראשונים אחרי הלידה.',
    tip: 'קני מידה גדולה. בבית החולים בדרך כלל מספקים, אבל כדאי שיהיה בבית.',
    type: 'must',
    products: [
      {
        name: 'תחבושות היגייניות לאחר לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/care/feminine-hygiene-products/after-birth/postpartum-web-briefs/%D7%AA%D7%97%D7%91%D7%95%D7%A9%D7%95%D7%AA-%D7%94%D7%99%D7%92%D7%99%D7%99%D7%A0%D7%99%D7%95%D7%AA-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94-0-2/p/671440',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/5060420233445.jpg',
        price: 33,
      },
    ],
  },
  'בקבוק פרי': {
    description: 'בקבוק לשטיפה עדינה במקום נייר טואלט לאחר הלידה.',
    tip: 'מוצר קטן שעושה הבדל ענק. ממלאים מים פושרים ושוטפים בעדינות.',
    type: 'must',
    products: [
      {
        name: 'בקבוק שטיפה לאחר לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-bottle-sterilizers/%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%A9%D7%98%D7%99%D7%A4%D7%94-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94/p/696449',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/5060420232721.jpg',
        price: 89,
      },
    ],
  },
  'שמן שקדים (עיסוי פרינאום)': {
    description: 'שמן טבעי לעיסוי פרינאום בשבועות האחרונים להריון.',
    tip: 'מתחילים משבוע 34. עיסוי יומי יכול לעזור בגמישות הרקמות ולמנוע קרעים.',
    type: 'treat',
    products: [
      {
        name: 'שמן שקדים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/care/dermocosmetics/body-care-dermocosmetics/%D7%A9%D7%9E%D7%9F-%D7%A9%D7%A7%D7%93%D7%99%D7%9D/p/440950',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290103435561.jpg',
        price: 26,
      },
    ],
  },
  'פדים מגנזיום / קרים': {
    description: 'פדים מרגיעים לאזור הפרינאום לאחר הלידה.',
    tip: 'שמי במקפיא לפני הלידה. מקלים על נפיחות וכאבים באזור.',
    type: 'treat',
    products: [
      {
        name: 'קומפרסים מגנזיום סולפאט 35% לתפרים אחרי לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/health/other-pharmacy-products/skin/%D7%A7%D7%95%D7%9E%D7%A4%D7%A8%D7%A1%D7%99%D7%9D-%D7%9E%D7%92%D7%A0%D7%96%D7%99%D7%95%D7%9D-%D7%A1%D7%95%D7%9C%D7%A4%D7%90%D7%98-35%25-%D7%9C%D7%AA%D7%A4%D7%A8%D7%99%D7%9D-%D7%90%D7%97%D7%A8%D7%99-%D7%9C%D7%99%D7%93%D7%94/p/577584',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290111598951.jpg',
        price: 34,
      },
    ],
  },
  'כרית ישיבה (דונאט)': {
    description: 'כרית בצורת טבעת להקלה בישיבה לאחר הלידה.',
    tip: 'מומלץ במיוחד אם היו תפרים. הופכת את הישיבה לנסבלת בימים הראשונים.',
    type: 'treat',
    products: [
      {
        name: 'כרית ישיבה עם חור מויסקו ג\'ל',
        store: 'wheelchairs',
        url: 'https://www.wheelchairs.co.il/%D7%9B%D7%A8%D7%99%D7%AA-%D7%99%D7%A9%D7%99%D7%91%D7%94-%D7%A2%D7%9D-%D7%97%D7%95%D7%A8-%D7%9E%D7%95%D7%99%D7%A1%D7%A7%D7%95-%D7%92%D7%9C',
        image: 'https://www.wheelchairs.co.il/content/images/thumbs/newThumbsDir/p_0000740_-.jpeg',
        price: 385,
      },
    ],
  },
  'מכשיר TENS (שיכוך צירים)': {
    description: 'מכשיר חשמלי קטן ששולח פולסים לשיכוך כאבי צירים.',
    tip: 'אפשר לשכור במקום לקנות. עוזר בשלבים המוקדמים של הלידה.',
    type: 'treat',
    products: [
      {
        name: 'כרית לטחורים ולפצעי לחץ',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/elle-tens-2/',
        image: 'https://tzirim.co.il/app/uploads/2024/10/%D7%98%D7%A0%D7%A1-2-Photoroom.png.webp',
        price: 359,
      },
    ],
  },
  'כדור פיזיו': {
    description: 'כדור גדול לתרגולים ותנוחות במהלך ההריון והלידה.',
    tip: 'מעולה לישיבה בהריון ולהקלה על כאבי גב. בלידה עוזר לפתיחת האגן.',
    type: 'treat',
    products: [
      {
        name: 'כדור פיזיו כדור פילאטיס 75 ס"מ כולל משאבה - כחול',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/sport-and-outdoors/exercise-and-fitness/physio-ball/%D7%9B%D7%93%D7%95%D7%A8-%D7%A4%D7%99%D7%96%D7%99%D7%95-%D7%9B%D7%93%D7%95%D7%A8-%D7%A4%D7%99%D7%9C%D7%90%D7%98%D7%99%D7%A1-75-%D7%A1%22%D7%9E-%D7%9B%D7%95%D7%9C%D7%9C-%D7%9E%D7%A9%D7%90%D7%91%D7%94-%D7%9B%D7%97%D7%95%D7%9C/p/mp-00048045',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/1228128110343.jpg',
        price: 78,
      },
    ],
  },

  // --- תוספות לאחים ---
  'עגלות תאומים/אחים': {
    description: 'עגלה לשני ילדים (לרוחב או לאורך).',
    tip: 'בישראל מומלץ רוחב עד 75 ס"מ למעבר בדלתות.',
    type: 'treat',
    products: [
      {
        name: 'גאזל Gazelle S2 - S2 / ערכת עגלת תאומים/אחים סייבקס גאזל S2 עם 2 עריסות + 2 מושבי טיולון צבע בז’ – Cybex Gazelle S2',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%a2%d7%a8%d7%9b%d7%aa-%d7%a2%d7%92%d7%9c%d7%aa-%d7%aa%d7%90%d7%95%d7%9e%d7%99%d7%9d-%d7%90%d7%97%d7%99%d7%9d-%d7%a1%d7%99%d7%99%d7%91%d7%a7%d7%a1-%d7%92%d7%90%d7%96%d7%9c-s2-%d7%a2%d7%9d-2-%d7%a2/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/12/90210-1.jpg',
        price: 7490,
      },
      {
        name: 'ערכת עגלת תאומים/אחים סייבקס גאזל S2 עם עריסה + מושב טיולון – Cybex Gazelle S2',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%A2%D7%A8%D7%9B%D7%AA-%D7%A2%D7%92%D7%9C%D7%AA-%D7%AA%D7%90%D7%95%D7%9E%D7%99%D7%9D-%D7%90%D7%97%D7%99%D7%9D-%D7%A1%D7%99%D7%99%D7%91%D7%A7%D7%A1-%D7%92%D7%90%D7%96%D7%9C-s2-%D7%A2%D7%9D-%D7%A2/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/12/90229-.jpg',
        price: 6190,
      },
      {
        name: 'עגלת דונקי 5 אחים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/trolleys-and-cases/baby-carriages/%D7%A2%D7%92%D7%9C%D7%AA-%D7%AA%D7%90%D7%95%D7%9E%D7%99%D7%9D-%D7%90%D7%95-%D7%90%D7%97%D7%99%D7%9D-FLICKFOLD-%D7%A2%D7%9D-%D7%92%D7%92%D7%95%D7%A0%D7%99%D7%9D-%D7%92%D7%93%D7%95%D7%9C%D7%99%D7%9D-%D7%95%D7%9E%D7%A6%D7%91-%D7%A9%D7%9B%D7%99%D7%91%D7%94-%D7%9C%D7%92%D7%99%D7%9C-%D7%9C%D7%99%D7%93%D7%94-%D7%99%D7%A8%D7%95%D7%A7-%D7%9E%D7%A8%D7%95%D7%95%D7%94/p/mp-00438768',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/0748855433924.jpg',
        price: 1690,
      },
    ],
  },
  'טרמפיסט לעגלה': {
    description: 'משטח גלגלים שמתחבר לעגלה לעמידת ילד.',
    tip: 'מיועד אך ורק לאח גדול שרוצה "טרמפ".',
    type: 'treat',
    products: [
      {
        name: 'טרמפיסט לעגלה – Click & Roll',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/trolleys-and-cases/parts-and-accessories-for-strollers-and-carriers/%D7%98%D7%A8%D7%9E%D7%A4%D7%99%D7%A1%D7%98-%D7%9C%D7%A2%D7%92%D7%9C%D7%94-%E2%80%93-Click-%26-Roll/p/mp-00268849',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290114706896.jpg',
        price: 549,
      },
    ],
  },
  'בוסטרים לרכב': {
    description: 'מושב הגבהה ללא רצועות פנימיות.',
    tip: 'מושב לילדים גדולים (גיל 4 ומעלה). לא רלוונטי לתינוק החדש.',
    type: 'treat',
    products: [
      {
        name: 'Logico L i-Size R129',
        store: 'גרקו',
        url: 'https://gracobaby.co.il/products/product/155115770',
        image: 'https://storage.googleapis.com/bambino_new_cms_storage/bambino-wp-uploads/55115770_IMG_2661.jpg.webp',
        price: 349,
      },
    ],
  },
}

// === Categories list ===
export const CATEGORIES: Category[] = [
  {
    id: 'general',
    name: 'כללי',
    icon: Package,
    color: 'from-[#9e9e9e] to-[#757575]',
    suggestedItems: [],
  },
  {
    id: 'strollers',
    name: 'עגלות וטיולים',
    icon: StrollerIcon,
    color: 'from-[#86608e] to-[#6d4e74]',
    suggestedItems: [
      'עגלה לתינוק מגיל לידה',
      'טיולון',
      'מנשא לתינוק',
      'תיק החתלה',
      'אביזרים לעגלות וטיולון',
      'צעצועים לעגלה',
    ],
  },
  {
    id: 'car_safety',
    name: 'בטיחות ברכב',
    icon: Car,
    color: 'from-[#7a5582] to-[#624469]',
    suggestedItems: [
      'כיסא בטיחות',
      'סלקלים בטיחותיים',
      'בסיסים לרכב',
      'מוצרים משלימים לרכב',
    ],
  },
  {
    id: 'furniture',
    name: 'ריהוט',
    icon: Home,
    color: 'from-[#a891ad] to-[#917a96]',
    suggestedItems: [
      'מיטת תינוק',
      'מזרן לתינוק',
      'שידת החתלה',
      'עריסה לתינוק',
      'לול וקמפינג',
      'כיסא אוכל',
      'אביזרים לעיצוב חדר ילדים',
    ],
  },
  {
    id: 'safety',
    name: 'מוצרי בטיחות',
    icon: ShieldAlert,
    color: 'from-[#86608e] to-[#6d4e74]',
    suggestedItems: ['מוניטור ואינטרקום'],
  },
  {
    id: 'feeding',
    name: 'האכלה',
    icon: UtensilsCrossed,
    color: 'from-[#b9a4bd] to-[#a891ad]',
    suggestedItems: [
      'בקבוקים',
      'פטמות לבקבוקים',
      'מוצצים ואביזריהם',
      'מברשות בקבוקים',
      'מייבש בקבוקים',
      'סטריליזטורים',
      'מחמם בקבוקים',
      'תרמוסים ומחלק מנות',
      'טטרות',
      'סינרים לתינוק',
    ],
  },
  {
    id: 'nursing',
    name: 'הנקה',
    icon: Baby,
    color: 'from-[#a891ad] to-[#917a96]',
    suggestedItems: [
      'משאבות הנקה ואביזריהן',
      'כריות הנקה',
      'סינרי הנקה',
      'רפידות ומגיני פטמות',
      'כורסאות הנקה',
    ],
  },
  {
    id: 'bath',
    name: 'אמבט וטיפול בתינוק',
    icon: Droplets,
    color: 'from-[#c9c2cb] to-[#b5adb8]',
    suggestedItems: [
      'אמבטיות ומעמדים',
      'מושבי אמבטיה',
      'מגבות לתינוק',
      'מברשות וסט מניקור',
      'תכשירי טיפול בתינוק',
      'מד חום למים',
      'צעצועים לאמבטיה',
      'טבעות אמבטיה',
    ],
  },
  {
    id: 'clothing',
    name: 'ביגוד ראשוני',
    icon: Shirt,
    color: 'from-[#86608e] to-[#6d4e74]',
    suggestedItems: [
      'בגדי גוף לתינוק',
      'מכנסיים ורגליות לתינוק',
      'אוברולים לתינוקות',
    ],
  },
  {
    id: 'bedding',
    name: 'מצעים ואקססוריז',
    icon: BedDouble,
    color: 'from-[#a891ad] to-[#917a96]',
    suggestedItems: [
      'Nest (קן לתינוק)',
      'סדינים',
      'שמיכות לתינוק',
      'משטחי החתלה',
      'נחשושים',
    ],
  },
  {
    id: 'toys',
    name: 'צעצועים',
    icon: Gamepad2,
    color: 'from-[#c9c2cb] to-[#b5adb8]',
    suggestedItems: [
      'מובייל לתינוק',
      'טרמפולינות',
      'נדנדות',
      'אוניברסיטה לתינוק',
      'שמיכות פעילות',
      'נשכנים ורעשנים',
      'שמיכי לתינוק',
    ],
  },
  {
    id: 'birth_prep',
    name: 'הכנה ללידה ולאמא',
    icon: HeartHandshake,
    color: 'from-[#f472b6] to-[#db2777]',
    suggestedItems: [
      'תחתונים חד-פעמיים / רשת',
      'תחבושות לאחר לידה',
      'בקבוק פרי',
      'שמן שקדים (עיסוי פרינאום)',
      'פדים מגנזיום / קרים',
      'כרית ישיבה (דונאט)',
      'מכשיר TENS (שיכוך צירים)',
      'כדור פיזיו',
    ],
  },
  {
    id: 'siblings',
    name: 'תוספות לאחים / תאומים',
    icon: Users,
    color: 'from-[#7a5582] to-[#624469]',
    suggestedItems: [
      'עגלות תאומים/אחים',
      'טרמפיסט לעגלה',
      'בוסטרים לרכב',
    ],
  },
]
