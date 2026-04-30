import {
  GiftIcon,
  StrollerIcon,
  CarSeatIcon,
  CribIcon,
  MonitorIcon,
  BottleIcon,
  NursingIcon,
  BathIcon,
  OnesieIcon,
  PillowIcon,
  TeddyIcon,
  MomHeartIcon,
  SiblingsIcon,
} from '../components/icons/categoryIcons'

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
    tip: 'תמדדי את תא המטען והמעלית לפני שאת מתאהבת בדגם. האמבטיה איתך רק 3 חודשים — שווה להשקיע בטיולון קל לקיפול ונוח לדחיפה.',
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
    tip: 'לא ליום הראשון. זה שדרוג לגיל חצי שנה, כשהעגלה המשולבת מתחילה להרגיש כבדה ומסורבלת.',
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
      {
        name: 'בוגבו בטרפליי 2',
        store: 'bugaboo',
        url: 'https://www.bugaboo-distributor.co.il/product/bugaboo-butterfly/',
        image: 'https://www.bugaboo-distributor.co.il/wp-content/uploads/1-1-650x650.png',
        price: 2790,
      },
    ],
  },
  'מנשא לתינוק': {
    description: 'אביזר לנשיאת התינוק צמוד לגוף ההורה ("ידיים חופשיות").',
    tip: 'כדאי למדוד לפני. להתחלה מנשא בד נמתח שעוטף ומרגיע גזים, ובהמשך מנשא ילקוט שישמור על הגב שלך.',
    type: 'treat',
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
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4344066-A.jpg?v=1734446959',
        price: 720,
      },
      {
        name: 'מנשא Artipoope',
        store: 'Artipoppe',
        url: 'https://shop.artipoppe.com/zeitgeist-baby-carrier/1028-zeitgeist-baby-argus-oat',
        image: 'https://shop.artipoppe.com/27680/zeitgeist-baby-argus-oat.jpg',
        price: 1090,
      },
    ],
  },
  'תיק החתלה': {
    description: 'תיק עם תאים לבקבוקים ולחיתולים, שנתלה על העגלה.',
    tip: 'התיק חי על העגלה, אז הדבר הכי חשוב הוא תופסנים נוחים לידית. אחד טוב מספיק.',
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
      {
        name: 'תיק החתלה בשילוב רקמה',
        store: 'Terminal X',
        url: 'https://www.terminalx.com/r468368263?color=18218',
        image: 'https://media.terminalx.com/pub/media/catalog/product/cache/f112238e8de94b6d480bd02e7a9501b8/r/4/r468368263-11767513603.jpg?image_type_mobile=webp_jpeg_like_70',
        price: 199,
      },
    ],
  },
  'אביזרים לעגלות וטיולון': {
    description: 'ציוד נלווה: כיסוי גשם, רשת יתושים, ווים וארגונית.',
    tip: 'תוסיפי רק לפי עונת הלידה — כיסוי גשם לחורף, רשת יתושים לקיץ. ארגונית לכידון (לטלפון ולמוצץ) זה הדבר שתשמחי שלקחת.',
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
      {
        name: 'טבעת התפתחות לתינוקות',
        store: 'דרא',
        url: 'https://www.darahome.com/collections/play-time/products/activity-rattle-deer-friends?variant=40048376447089',
        image: 'https://www.darahome.com/cdn/shop/products/4303831_0f60f262-18b0-40aa-b6c0-0539d467ea96_1024x1024.jpg?v=1734378949',
        price: 169,
      },
    ],
  },
  'צעצועים לעגלה': {
    description: 'צעצוע נתלה או קשת פעילות שמתחברת לעגלה.',
    tip: 'בלי להעמיס. צעצוע אחד מתנדנד, עדיף שחור-לבן, יותר ממספיק — אל תיצרי גירוי יתר.',
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
    tip: 'הפריט היחיד שנדרש בחוק בישראל — בלעדיו לא תוציאי תינוק מבית החולים ברכב פרטי. חובה תקן UN R129 (i-Size) או EU R44, ונגד הכיוון עד גיל שנתיים לפחות. דגמים מסתובבים יקרים יותר אך חוסכים שבירת גב בחגירה. אל תקני יד שנייה אם את לא יודעת 100% את ההיסטוריה (תאונות / חריגת תוקף).',
    type: 'must',
    products: [
      {
        name: 'כיסא בטיחות איזי Turn B',
        store: 'שילב',
        url: 'https://www.shilav.co.il/products/%D7%9B%D7%99%D7%A1%D7%90-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA-%D7%90%D7%99%D7%96%D7%99-turn-b-%D7%9E%D7%98%D7%90%D7%9C%D7%99%D7%A7-%D7%9E%D7%9C%D7%90%D7%A0%D7%92',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-6618193-A.jpg?v=1734446825&width=1080',
        price: 1390,
      },
      {
        name: 'כיסא בטיחות + בסיס Pruu אפור',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%9B%D7%99%D7%A1%D7%90%D7%95%D7%AA-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA/products/%D7%9B%D7%99%D7%A1%D7%90-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA-%D7%91%D7%A1%D7%99%D7%A1-pruu-%D7%90%D7%A4%D7%95%D7%A8-%D7%9E%D7%A2%D7%95%D7%A0%D7%9F-thunder',
        image: 'https://motsesim.co.il/cdn/shop/files/Nuna_PRUU_Thunder_Front_NI_HR_GL_8x8_000.webp?v=1754297069',
        price: 2399,
      },
      {
        name: 'כיסא בטיחות טוויגי סייף גארד פלוס',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9B%D7%99%D7%A1%D7%90-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA-%D7%A1%D7%99%D7%99%D7%A3-%D7%92%D7%90%D7%A8%D7%93-%D7%A4%D7%9C%D7%95%D7%A1-%D7%98%D7%95%D7%95%D7%99%D7%92%D7%99-twigy-safeguard-plus/?attribute_pa_color=%25d7%25a9%25d7%259e%25d7%25a0%25d7%25aa-ivory&tw_source=google&tw_adid=&tw_campaign=22294827738&tw_kwdid=&gad_source=1&gad_campaignid=22301392682&gbraid=0AAAAAC2FMluZ4w5O-wAdryOgNsN_5yp9V&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV_JZZWJjLWHGENFobxhjPQ2lR5PhHki088j_D_T-PxKarnMdb3YIgQaAi3AEALw_wcB',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/06/84222-1.jpg',
        price: 699,
      },
    ],
  
  },
  'סלקלים בטיחותיים': {
    description: 'מושב בטיחות נייד לתינוק (0-1 שנה) שניתן להוציא מהרכב.',
    tip: 'מתוק לניידות — אפשר להעביר תינוק ישן בלי להעיר. הוא בא במקום כיסא בטיחות מגיל לידה, אז אין צורך בשניהם. אם את רוצה לחסוך גם בעגלה, סלקל דונה ממלא את שלושת התפקידים.',
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
      {
        name: 'סלקל Cloud G i-Size plus Almond Beige',
        store: 'cybex',
        url: 'https://cybexonline.co.il/products/%D7%A1%D7%9C%D7%A7%D7%9C-cloud-g-i-size-almond-beige',
        image: 'https://cybexonline.co.il/cdn/shop/files/cyb_24_eu_y090_cloudg_albe_plus_recline_canopy_1914fda2ff6c0770.jpg?v=1754205411&width=493',
        price: 1699,
      },
    ],
  },
  'בסיסים לרכב': {
    description: 'מתקן קבוע (ISOFIX) המאפשר חיבור וניתוק מהיר של הסלקל.',
    tip: 'משדרג בטיחות ומונע טעויות בחגירה. ממש נוח אם יש שני רכבים בבית.',
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
    tip: 'מראה היא חובה כדי לראות את התינוק כשהוא יושב נגד הכיוון — בלעדיה את נוסעת בלי מושג מה קורה מאחור. צלון קריטי בקיץ הישראלי.',
    type: 'must',
    products: [
      {
        name: 'מראת רכב לתינוק',
        store: 'KSP',
        url: 'https://ksp.co.il/web/item/358798',
        image: 'https://img.ksp.co.il/item/358798/b_1.jpg?v=1737365702',
        price: 99,
      },
      {
        name: 'זוג צלונים לחלונות הרכב צ\'יקו',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%96%D7%95%D7%92-%D7%A6%D7%9C%D7%95%D7%A0%D7%99%D7%9D-%D7%9C%D7%97%D7%9C%D7%95%D7%A0%D7%95%D7%AA-%D7%94%D7%A8%D7%9B%D7%91-%D7%A6%D7%99%D7%A7%D7%95-chicco-sunshades-2pcs/?attribute_pa_color=black-%25d7%25a9%25d7%2597%25d7%2595%25d7%25a8-%25d7%259e%25d7%2590%25d7%2595%25d7%2599%25d7%2599%25d7%25a8&tw_source=google&tw_adid=&tw_campaign=21970436568&tw_kwdid=&gad_source=1&gad_campaignid=21980753485&gbraid=0AAAAAC2FMlsLojToKdLfhMGAMIOJSDbb3&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV_oeHNHfGGIrBvmwJSTDZxTGdQMy10dnDH_3gf8ebVYTHpPzsdUEcAaAhsiEALw_wcB',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/07/2-17.jpg',
        price: 59.9,
      },
      {
        name: 'שלט תינוק באוטו',
        store: 'צ׳וציק',
        url: 'https://www.zuzik.co.il/items/5684010-%D7%A9%D7%9C%D7%98-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%91%D7%90%D7%95%D7%98%D7%95-%D7%91%D7%99%D7%99%D7%91%D7%99%D7%A7%D7%95',
        image: 'https://aicdn.speedsize.com/0e98e5fc-9f0e-4eed-9afa-7ebd127e2cc5/https://d3m9l0v76dty0.cloudfront.net/system/photos/11523962/large/93f9a142c8c09d30f40630a08b1ca607.jpg',
        price: 9.9,
      },
    ],
  },

  // --- ריהוט ---
  'מיטת תינוק': {
    description: 'מיטת סורגים סטנדרטית שתשמש את התינוק עד גיל 2-3.',
    tip: 'הסטנדרט מצוין. הכי חשוב — תו תקן ומרווח סורגים עד 6 ס"מ, זה מה שהופך אותה לבטוחה.',
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
    tip: 'לא לחסוך פה. המזרן חייב להיות קשיח, שטוח, ומתאים בדיוק לעריסה (בלי רווחים בצדדים) — לפי הנחיות בטיחות שינה. עדיף חדש, לא יד שנייה.',
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
      {
        name: 'מזרן לתינוק עמינח דגם סנונית',
        store: 'Baby star',
        url: 'https://www.baby-star.co.il/products/89540',
        image: 'https://www.baby-star.co.il/cdn/shop/files/4953da0969f9d98bebc8097d2d35d081_858e7a19-e18d-4ffe-a75a-0de6e838b3f1.webp?v=1763588465',
        price: 749,
      },
    ],
  },
  'שידת החתלה': {
    description: 'רהיט מגירות לאחסון בגדים שחלקו העליון משמש להחתלה.',
    tip: 'נוח מאוד להחתלה. בדקי שהגובה מתאים לגב שלך, וחשוב לקבע אותה לקיר כדי שלא תתהפך.',
    type: 'must',
    products: [
      {
        name: 'שידה לחדר תינוק בליסמו 120 ס"מ',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/segal-baby/outlet/%D7%A9%D7%99%D7%93%D7%94-%D7%91%D7%9C%D7%99%D7%A1%D7%9E%D7%95-120-%D7%A1%D7%9E/',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2024/04/Дизайн-без-названия-2.jpg',
        price: 1190,
      },
      {
        name: 'שידת תינוק דגם דורית 0.8 לבן',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby-dresser/products/%D7%A9%D7%99%D7%93%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%93%D7%92%D7%9D-%D7%93%D7%95%D7%A8%D7%99%D7%AA-0-8',
        image: 'https://www.shilav.co.il/cdn/shop/files/dorit1.jpg?v=1735490564&width=1800',
        price: 700,
      },
      {
        name: 'Ashi - Cream שידה',
        store: 'בייבי לי',
        url: 'https://www.baby-lee.co.il/product-page/ashi-cream-%D7%A9%D7%99%D7%93%D7%94',
        image: 'https://static.wixstatic.com/media/d20f5a_13eb66972a644166a3c3a4db710a2fb4~mv2.png/v1/fill/w_498,h_496,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d20f5a_13eb66972a644166a3c3a4db710a2fb4~mv2.png',
        price: 2190,
      },
    ],
  },
  'עריסה לתינוק': {
    description: 'מיטה קטנה וניידת המתאימה ל-3 החודשים הראשונים בלבד.',
    tip: 'איתך רק לכמה חודשים. במקום לקנות, שווה לשכור.',
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
      {
        name: 'עריסה נצמדת למיטה ALMA',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/furniture-for-babies/cradles/%D7%A2%D7%A8%D7%99%D7%A1%D7%94-%D7%A0%D7%A6%D7%9E%D7%93%D7%AA-%D7%9C%D7%9E%D7%99%D7%98%D7%94-ALMA-%D7%A2%D7%9C%D7%9E%D7%94-%D7%A8%D7%99%D7%A4%D7%95%D7%93-%D7%90%D7%A4%D7%95%D7%A8-%D7%A9%D7%9C%D7%93-%D7%93%D7%9E%D7%95%D7%99-%D7%A2%D7%A5-SPORTLINE/p/mp-00441860',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290113215795.jpg',
        price: 790,
      },
    ],
  },
  'לול וקמפינג': {
    description: 'מיטת רשת מתקפלת וניידת למשחק או לשינה מחוץ לבית.',
    tip: 'לול רשת (קמפינג) הוא הכי פרקטי — קל, זול ונייד לסבתא. לא ליום הראשון.',
    type: 'treat',
    products: [
      {
        name: 'לול בוגבו סטארדס שחור',
        store: 'אייס',
        url: 'https://motsesim.co.il/collections/%D7%9C%D7%95%D7%9C-%D7%95%D7%9C%D7%95%D7%9C%D7%99-%D7%A7%D7%9E%D7%A4%D7%99%D7%A0%D7%92/products/7984938-%D7%9C%D7%95%D7%9C-%D7%91%D7%95%D7%92%D7%91%D7%95-%D7%A1%D7%98%D7%90%D7%A8%D7%93%D7%A1-%D7%A9%D7%97%D7%95%D7%A8',
        image: 'https://motsesim.co.il/cdn/shop/files/2ac4918b43cae13d948d43c54b6d9411.png?v=1751798555&width=1946',
        price: 1599,
      },
      {
        name: 'לול קמפינג ענק SIMPLY שחור כוכבים',
        store: 'Oli Baby',
        url: 'https://www.olibaby.co.il/items/6197072?adscale=1&utm_campaign=PMax_IL+%5BGoogle%5D+PMAX+GOOGLE&utm_id=23318833852&utm_medium=paid+shopping&device=c&creativeId=&network=x&utm_source=google&site_source_name=adscale_pmax&gad_source=1&gad_campaignid=23309670852&gbraid=0AAAAABujzrwZ49LqfLDa0_oOTZnXW5WdD&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV_0p4RKSYmzlDFLrjAb60m_w2q_Lm1FAicdz3m6TrV19WY-9w39yGoaAj91EALw_wcB',
        image: 'https://d3m9l0v76dty0.cloudfront.net/system/photos/12979409/large/484d65715905540d1ab44837c76127aa.jpg',
        price: 249,
      },
      {
        name: 'לול קמפינג / מיטה ניידת לתינוק דגם פאני',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/furniture-for-babies/cribs/%D7%9C%D7%95%D7%9C-%D7%A7%D7%9E%D7%A4%D7%99%D7%A0%D7%92-%D7%9E%D7%99%D7%98%D7%94-%D7%A0%D7%99%D7%99%D7%93%D7%AA-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%93%D7%92%D7%9D-%D7%A4%D7%90%D7%A0%D7%99-%D7%A9%D7%97%D7%95%D7%A8-%D7%90%D7%A4%D7%95%D7%A8/p/mp-00146807',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/0748855430640.jpg',
        price: 279,
      },
    ],
  },
  'אביזרים לעיצוב חדר ילדים': {
    description: 'תמונות, שטיחים, מדפים ופריטי נוי לחדר התינוק.',
    tip: 'בלי דברים כבדים שתלויים מעל המיטה. שטיח כביס שווה זהב — בין הפליטות לאבק.',
    type: 'treat',
    products: [
      {
        name: 'מדבקות קיר פרחי בוהו',
        store: 'ponponi',
        url: 'https://www.ponponi.co.il/product/decals76/',
        image: 'https://www.ponponi.co.il/wp-content/uploads/2025/07/floresboho1rosa2.jpg',
        price: 179,
      },
      {
        name: 'כדורים פורחים מעץ',
        store: 'Terminal X',
        url: 'https://www.terminalx.com/r414932048?gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-KhM0o0lfZhBIOyOkEV02EMtK6iiHeR35kfYaoNWiuFpP1R4hNtQYaApl9EALw_wcB&gad_campaignid=22041160523&gad_source=1&utm_campaign=20_acquisition_shopping_home&utm_medium=cpc&utm_source=google&color=8975',
        image: 'https://media.terminalx.com/pub/media/catalog/product/cache/webp/f112238e8de94b6d480bd02e7a9501b8/r/4/r414932048-11758433267_jpeg_like_70.webp',
        price: 189,
      },
      {
        name: 'בימבה 1930 רטרו בעיצוב וינטג\'',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/toys-and-games/riding-toys/scooters/%D7%91%D7%99%D7%9E%D7%91%D7%94-1930-%D7%A8%D7%98%D7%A8%D7%95-%D7%91%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%95%D7%99%D7%A0%D7%98%D7%92\'-%D7%A2%D7%9D-%D7%92%D7%9C%D7%92%D7%9C%D7%99-EVA-%D7%A9%D7%A7%D7%98%D7%99%D7%9D,-%D7%A6%D7%95%D7%A4%D7%A8-%D7%95%D7%AA%D7%90-%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%9C%D7%91%D7%9F/p/mp-00197362?gad_source=1&gad_campaignid=20949925837&gbraid=0AAAAADHSXtc8eiihpEX71AncwUy2tmhoJ&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8pAq1xgpreV9Z6yG6y0mHE5yswZXSf9kx6xJeozGsF_e0uJoJa_SUaAqE-EALw_wcB',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290012262869.jpg',
        price: 199,
      },
    ],
  },

  // --- מוצרי בטיחות ---
  'מוניטור ואינטרקום': {
    description: 'מכשיר לשמיעה או צפייה בתינוק מחדר אחר.',
    tip: 'בבית במפלס אחד שומעים גם בלעדיו. בבית גדול או כשהתינוק בממ"ד — דגם פשוט ואמין יספיק.',
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
    tip: 'בהתחלה הוא לא זז לשום מקום. חכי לגיל חצי שנה, כשמתחילה הזחילה, ואז תמגני את הבית לפי הצורך.',
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
    tip: 'כמות להתחלה: 2-4 בקבוקים קטנים (150 מ"ל). גם אם את מתכננת להניק — זה נשק החירום של בן הזוג, של אמא, ושל הלילה שאת רוצה לישון 4 שעות ברצף. נסי מותג אחד לפני שקונים סט שלם.',
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
      {
        name: 'זוג בקבוקי האכלה Hegen',
        store: 'Hegen',
        url: 'https://hegen.co.il/product/bottles/?attribute_%25d7%2592%25d7%2595%25d7%2593%25d7%259c=150+%D7%9E%22%D7%9C&attribute_%25d7%259b%25d7%259e%25d7%2595%25d7%25aa=%D7%96%D7%95%D7%92%D7%99&attribute_%25d7%25a6%25d7%2591%25d7%25a2=%D7%95%D7%A8%D7%95%D7%93&gad_source=1&gad_campaignid=23307330364&gbraid=0AAAAABzAt71LzhUflGlW7mrV-Hqj6_8ZO&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8GlfqD25oALZKtEfPuNIspKLGcrWFQ5h8HYMzd2l8RUWy5G1E5PbkaAjI3EALw_wcB',
        image: 'https://i0.wp.com/hegen.co.il/wp-content/uploads/2024/02/1.png?fit=1800%2C1800&ssl=1',
        price: 139,
      },
    ],
  },
  'פטמות לבקבוקים': {
    description: 'החלק שדרכו התינוק יונק, מגיע בקצבי זרימה שונים.',
    tip: 'חשוב: לניובורן רק שלב 0 או 1 (זרימה איטית) — כדי למנוע חנק וסירוב הנקה.',
    type: 'must',
    products: [
      {
        name: 'מאמ Mam זוג פטמות 0',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/bottle-nipples/products/%D7%96%D7%95%D7%92-%D7%A4%D7%98%D7%9E%D7%95%D7%AA-0',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4218037-A.jpg?v=1734677045&width=1800',
        price: 39,
      },
      {
        name: 'זוג פטמות לבקבוק לנסינו - זרימה מהירה',
        store: 'מורד גיליס',
        url: 'https://www.moradbaby.co.il/items/4734147?utm_source=google_cpc&utm_medium=Astra&utm_campaign=Astra&utm_content=pmax&gad_source=1&gad_campaignid=17432804542&gbraid=0AAAAAomjxP4OoQXUtGTAxCu5qVExeonBl&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-nuW-YVaTSJ7DCDBW2ikGgEf0Y29eecc8LNeziZJaXUAA-7PMHZyYaAsrEEALw_wcB',
        image: 'https://d3m9l0v76dty0.cloudfront.net/system/photos/16690885/large/ff13c4c1b3707ec5493df84a02145a4e.jpg',
        price: 34,
      },
      {
        name: 'זוג פטמות האכלה לבקבוקי Avent Natural Response',
        store: 'KSP',
        url: 'https://ksp.co.il/web/item/279618',
        image: 'https://img.ksp.co.il/item/279618/b_2.jpg?v=1697029535',
        price: 39,
      },
    ],
  },
  'מוצצים ואביזריהם': {
    description: 'פטמת סיליקון/גומי להרגעה וקליפס לתפירה לבגד.',
    tip: 'תינוקות יודעים מה הם אוהבים. קחי 2-3 סוגים לטעימה, וקליפס למוצץ — בלעדיו תאבדי אותו ביום.',
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
      {
        name: 'זוג מוצצים 0-6 סיליקון',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%9E%D7%95%D7%A6%D7%A6%D7%99%D7%9D/products/%D7%96%D7%95%D7%92-%D7%9E%D7%95%D7%A6%D7%A6%D7%99%D7%9D-0-6-%D7%A1%D7%99%D7%9C%D7%99%D7%A7%D7%95%D7%9F-%D7%9E%D7%90%D7%98-%D7%97%D7%9C%D7%A7-mam-original',
        image: 'https://motsesim.co.il/cdn/shop/files/38886.webp?v=1770892499&width=165%20165w,//motsesim.co.il/cdn/shop/files/38886.webp?v=1770892499',
        price: 49.9,
      },
    ],
  },
  'מברשות בקבוקים': {
    description: 'מברשת צרה לניקוי פנימי של הבקבוק והפטמה.',
    tip: 'מברשת עם ספוג בקצה מנקה הכי טוב. כדאי להחליף כל חודש-חודשיים, היא צוברת חיידקים.',
    type: 'must',
    products: [
      {
        name: 'מברשת ספוג לבקבוק ולפיטמה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-bottle-sterilizers/%D7%9E%D7%91%D7%A8%D7%A9%D7%AA-%D7%A1%D7%A4%D7%95%D7%92-%D7%9C%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%95%D7%9C%D7%A4%D7%99%D7%98%D7%9E%D7%94/p/591931',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/735282160202.jpg',
        price: 33,
      },
      {
        name: 'מברשת בקבוק סיליקון לתינוק',
        store: 'Ali Express',
        url: 'https://he.aliexpress.com/item/1005007927421310.html?spm=a2g0o.productlist.main.6.7f5e3AGW3AGWz6&algo_pvid=ac0d8ff9-617a-40a3-84b9-a581448aed5e&algo_exp_id=ac0d8ff9-617a-40a3-84b9-a581448aed5e-5&pdp_ext_f=%7B%22order%22%3A%22721%22%2C%22eval%22%3A%221%22%2C%22fromPage%22%3A%22search%22%7D&pdp_npi=6%40dis%21ILS%2145.98%2145.98%21%21%2114.95%2114.95%21%402141122217771919531433404ee270%2112000043458523398%21sea%21IL%210%21ABX%211%210%21n_tag%3A-29910%3Bd%3A2b20381%3Bm03_new_user%3A-29895&curPageLogUid=4cfZfi3RRRWN&utparam-url=scene%3Asearch%7Cquery_from%3A%7Cx_object_id%3A1005007927421310%7C_p_origin_prod%3A',
        image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sa5e0c432994f4d7887d072e665eb9393w.jpg?has_lang=1&ver=1_960x960q75.jpg_.avif',
        price: 45.98,
      },
      {
        name: 'מברשת לבקבוק סיליקון אפור',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/bottle-cleaning/products/%D7%9E%D7%91%D7%A8%D7%A9%D7%AA-%D7%9C%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%A1%D7%99%D7%9C%D7%99%D7%A7%D7%95%D7%9F-%D7%90%D7%A4%D7%95%D7%A8',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-6200104-A.jpg?v=1734504301&width=1080',
        price: 39.9,
      },
    ],
  },
  'מייבש בקבוקים': {
    description: 'מתקן ייעודי לייבוש בקבוקים ואביזרים קטנים.',
    tip: 'חוסך מקום על השיש ומייבש מהר. לא קריטי, אבל מקל מאוד.',
    type: 'treat',
    products: [
      {
        name: 'מייבש בקבוקים מתקפל מפלסטיק NANNY - לבן',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-bottles/%D7%9E%D7%99%D7%99%D7%91%D7%A9-%D7%91%D7%A7%D7%91%D7%95%D7%A7%D7%99%D7%9D-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C-%D7%9E%D7%A4%D7%9C%D7%A1%D7%98%D7%99%D7%A7-NANNY-%D7%9C%D7%91%D7%9F/p/mp-00055712',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/8850980020541.jpg',
        price: 49,
      },
      {
        name: 'מייבש בקבוקים קקטוס',
        store: 'Ali Express',
        url: 'https://www.aliexpress.com/item/1005010451444868.html?spm=a2g0n.productlist.0.0.568auA86uA86Xk&browser_id=a8d14b7bd1fa4db0aafc7535b752b3fa&aff_trace_key=9a0cfb1a64bf4d26802e12dea9e1c9e5-1777191934718-03471-_ePNSNV&aff_platform=msite&m_page_id=alpijdxbhocaduda19dc8f4ddb590f09b44211e8b4&gclid=&pdp_ext_f=%7B%22order%22%3A%22121%22%2C%22spu_best_type%22%3A%22price%22%2C%22eval%22%3A%221%22%2C%22fromPage%22%3A%22search%22%7D&pdp_npi=6%40dis%21ILS%2154.73%2126.27%21%21%21121.66%2158.40%21%402102f0cc17771929839702720e52c9%2112000052455757932%21sea%21IL%210%21ABX%211%210%21n_tag%3A-29910%3Bd%3A2b20381%3Bm03_new_user%3A-29895&algo_pvid=b7d47a86-b128-4e25-9e73-888b08b0ba32&utparam-url=scene%3Asearch%7Cquery_from%3A%7Cx_object_id%3A1005010451444868%7C_p_origin_prod%3A',
        image: 'https://ae-pic-a1.aliexpress-media.com/kf/S976dd39514604c718964041f26612d5d2.jpg_960x960q75.jpg_.avif',
        price: 27,
      },
      {
        name: 'תקן לייבוש בקבוקים Baby Line',
        store: 'KSP',
        url: 'https://ksp.co.il/mob/item/285690',
        image: 'https://img.ksp.co.il/item/285690/b_1.jpg?v=1701936539',
        price: 21,
      },
    ],
  },
  'סטריליזטורים': {
    description: 'מכשיר לחיטוי בקבוקים ומוצצים (במיקרוגל או חשמלי).',
    tip: 'הדגם למיקרוגל הכי זול, מהיר ויעיל. אפשר גם להרתיח בסיר — אבל זה חוסך לך זמן יקר.',
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
      {
        name: 'סטריליזטור למיקרו',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/sterilizers/products/%D7%A1%D7%98%D7%A8%D7%99%D7%9C%D7%99%D7%96%D7%98%D7%95%D7%A8-%D7%9C%D7%9E%D7%99%D7%A7%D7%A8%D7%95-1',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7206050-A.jpg?v=1734521634',
        price: 199,
      },
    ],
  },
  'מחמם בקבוקים': {
    description: 'מכשיר חשמלי לחימום הבקבוק לטמפרטורה מדויקת.',
    tip: 'רלוונטי בעיקר אם את שואבת חלב אם — לתמ"ל לא חייבים. גם בלעדיו תסתדרי עם כוס מים חמים.',
    type: 'treat',
    products: [
      {
        name: 'מחמם בקבוקים וסטריליזטור קינזי לוגן – Kinsey Logan Bottle Warmer and Sterilizer',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%97%D7%9E%D7%9D-%D7%91%D7%A7%D7%91%D7%95%D7%A7%D7%99%D7%9D-%D7%95%D7%A1%D7%98%D7%A8%D7%99%D7%9C%D7%99%D7%96%D7%98%D7%95%D7%A8-%D7%A7%D7%99%D7%A0%D7%96%D7%99-%D7%9C%D7%95%D7%92%D7%9F-kinsey/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2025/10/141414.jpg',
        price: 199,
      },
      {
        name: 'Bamba Warm',
        store: 'Biamba',
        url: 'https://biamba.co.il/biamba-warm/?gad_source=1&gad_campaignid=21509952399&gbraid=0AAAAABzAao9l9QIrFvOZMWS6YnJwDa2RR&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8fvha8Ol98BzYdxyXPLb4VBNpOrCAjDFf4Eg8aTVLEIV2IEINQfQUaAnJEEALw_wcB',
        image: 'https://biamba.co.il/wp-content/uploads/2023/02/warm_n.png.webp',
        price: 349,
      },
      {
        name: 'מחמם בקבוקים דיגיטלי',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/mom-baby/by52-beurer?gad_source=1&gad_campaignid=20366764738&gbraid=0AAAAADkzFww5QZU4mAyeR7tNnXItJ2nai&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV9y1hL3MmdhUIyIwdB_QyhZjAx-Wm3kbecznRj-5tMv5Ecn5IZXrQMaAk6lEALw_wcB',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/B/Y/BY52_beurer.png',
        price: 169.9,
      },
    ],
  },
  'תרמוסים ומחלק מנות': {
    description: 'מיכל למים חמים וקופסה מחולקת לאבקת תמ"ל.',
    tip: 'שימושי אם את מאכילה תמ"ל ויוצאת מהבית: מים חמים ומחלק מנות מדוד לדרך. חוסך לך לחפש קומקום בקופת חולים.',
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
      {
        name: 'תרמוס אוכל 2 קומות 1.3 ליטר - מוקה',
        store: 'Shoppu',
        url: 'https://shoppu.co.il/products/mosh-3-layer-food-thermos-1-3-mk?variant=46375337820378&country=IL&currency=ILS&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&utm_source=google&utm_medium=cpc&utm_campaign=Shopping_All-categories&utm_term=&gad_source=1&gad_campaignid=20335121736&gbraid=0AAAAADIXd42tbLxEnZLI72Fd-Kt-z3tVd&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-9Am0DExyiamGG85gjpULTmwYu6LmlMCM2AvQ0w-qwdP03h-ju1zUaAjM2EALw_wcB',
        image: 'https://shoppu.co.il/cdn/shop/files/lunchjar-mocha-sm-3-1200.png?v=1770646025',
        price: 299,
      },
    ],
  },
  'טטרות': {
    description: 'ריבועי בד שעושים הכל — פליטות, צלון, משטח וכיסוי.',
    tip: 'הדבר הכי שימושי בבית, ותמיד יחסרו לך. קחי לפחות 10-15.',
    type: 'must',
    products: [
      {
        name: 'חמישיית חיתולי טטרה מיננה תכלת – Minene',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%97%D7%9E%D7%99%D7%A9%D7%99%D7%99%D7%AA-%D7%97%D7%99%D7%AA%D7%95%D7%9C%D7%99-%D7%98%D7%98%D7%A8%D7%94-%D7%9E%D7%99%D7%A0%D7%A0%D7%94-%D7%AA%D7%9B%D7%9C%D7%AA-minene/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/02/88793.jpg',
        price: 69,
      },
      {
        name: 'טטרה לתינוקות מבמבו כותנה',
        store: 'Ali Express',
        url: 'https://he.aliexpress.com/item/1005008176652832.html?spm=a2g0o.productlist.main.3.473bROh8ROh8LK&algo_pvid=bdfba14c-54f9-427f-acf9-9a86051ba264&algo_exp_id=bdfba14c-54f9-427f-acf9-9a86051ba264-2&pdp_ext_f=%7B%22order%22%3A%22298%22%2C%22eval%22%3A%221%22%2C%22fromPage%22%3A%22search%22%7D&pdp_npi=6%40dis%21ILS%2141.60%2114.09%21%21%2192.46%2131.31%21%402102f0cc17771934378491711e527e%2112000044118097321%21sea%21IL%210%21ABX%211%210%21n_tag%3A-29910%3Bd%3A2b20381%3Bm03_new_user%3A-29895%3BpisId%3A5000000205451990&curPageLogUid=Kcc0hNeNEYuH&utparam-url=scene%3Asearch%7Cquery_from%3A%7Cx_object_id%3A1005008176652832%7C_p_origin_prod%3A',
        image: 'https://ae-pic-a1.aliexpress-media.com/kf/S682261147c41491395c0f0cdb88024bfg.jpg_960x960q75.jpg_.avif',
        price: 15,
      },
      {
        name: 'מגבות תינוק כותנה טהורה בעלות 6 שכבות',
        store: 'Ali Express',
        url: 'https://he.aliexpress.com/item/1005009331988210.html?spm=a2g0o.detail.pcDetailTopMoreOtherSeller.4.1830KZeXKZeXtW&gps-id=pcDetailTopMoreOtherSeller&scm=1007.40050.354490.0&scm_id=1007.40050.354490.0&scm-url=1007.40050.354490.0&pvid=f713e3dc-c95d-4242-8e52-1c9eec32c302&_t=gps-id%3ApcDetailTopMoreOtherSeller%2Cscm-url%3A1007.40050.354490.0%2Cpvid%3Af713e3dc-c95d-4242-8e52-1c9eec32c302%2Ctpp_buckets%3A668%232846%238112%231997&pdp_ext_f=%7B%22order%22%3A%221552%22%2C%22spu_best_type%22%3A%22price%22%2C%22eval%22%3A%221%22%2C%22sceneId%22%3A%2230050%22%2C%22fromPage%22%3A%22recommend%22%7D&pdp_npi=6%40dis%21ILS%2115.81%2115.81%21%21%2135.15%2135.15%21%40210156fc17771935124702752e9479%2112000057572460902%21rec%21IL%21%21ABXZ%211%210%21n_tag%3A-29910%3Bd%3A2b20381%3Bm03_new_user%3A-29895&utparam-url=scene%3ApcDetailTopMoreOtherSeller%7Cquery_from%3A%7Cx_object_id%3A1005009331988210%7C_p_origin_prod%3A',
        image: 'https://ae-pic-a1.aliexpress-media.com/kf/S1352dc168bc9402b90ca7b24470f60f5q.jpg_960x960q75.jpg_.avif',
        price: 16,
      },
    ],
  },
  'כיסא אוכל': {
    description: 'כיסא גבוה להאכלה ליד שולחן.',
    tip: 'לא לחודשים הראשונים — מוצקים מתחילים סביב גיל חצי שנה. אפשר להשאיר למתנה או להוסיף קרוב לגיל.',
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
      {
        name: 'כסא אוכל משולב Anex Ozy - שלוש באחד',
        store: 'Baby star',
        url: 'https://www.baby-star.co.il/products/40166290',
        image: 'https://baby-star.co.il/cdn/shop/files/June_Ozy_14_2008cebe-985f-4170-b577-1839a8816ada.webp?v=1763608894',
        price: 1999,
      },
    ],
  },
  'סינרים לתינוק': {
    description: 'הגנה על הבגד מפני פליטות ואוכל.',
    tip: 'להתחלה רק סינרי בד ("בנדנה") לפליטות. כמות: 8-10 יחידות — תופתעי כמה מהר הם נגמרים. סינרי האכלה רגילים רק מגיל 4-6 חודשים.',
    type: 'treat',
    products: [
      {
        name: 'זוג סינרים לתינוק עשויים בד מגבת עם ציפוי פנימי מונע רטיבות - ציפורים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/eating-aprons/%D7%96%D7%95%D7%92-%D7%A1%D7%99%D7%A0%D7%A8%D7%99%D7%9D-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%A2%D7%A9%D7%95%D7%99%D7%99%D7%9D-%D7%91%D7%93-%D7%9E%D7%92%D7%91%D7%AA-%D7%A2%D7%9D-%D7%A6%D7%99%D7%A4%D7%95%D7%99-%D7%A4%D7%A0%D7%99%D7%9E%D7%99-%D7%9E%D7%95%D7%A0%D7%A2-%D7%A8%D7%98%D7%99%D7%91%D7%95%D7%AA-%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D/p/mp-00413216',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7297219563591.jpg',
        price: 29,
      },
      {
        name: 'ארז של 5 סינרים לתינוקות',
        store: 'Next',
        url: 'https://www.next.co.il/he/style/su809026/h80751',
        image: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/H80751s.jpg?im=Resize,width=750',
        price: 48,
      },
      {
        name: 'לבן - מארז של 5 סינרים לתינוקות',
        store: 'Next',
        url: 'https://www.next.co.il/he/style/st234961/972520',
        image: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/972520s.jpg?im=Resize,width=750',
        price: 35,
      },
    ],
  },
  'בוסטר האכלה': {
    description: 'מושב פלסטיק שמתלבש על כיסא רגיל בבית.',
    tip: 'מעולה לדירות קטנות ולנסיעות, אבל רלוונטי רק כשהוא כבר יושב יציב (סביב חצי שנה).',
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
    tip: 'אל תקני מראש. קחי יד שנייה או בסבסוד קופת חולים, ורק אחרי שתראי שההנקה זורמת.',
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
      {
        name: 'לנסינו - משאבת חלב לבישה דו צדדית',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/lansinoh-double-wearable-pump?gad_source=1&gad_campaignid=21302648113&gbraid=0AAAAADkzFwyfYv2bq0nFbA4tt0wJjU5Ou&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV96H34yWnYKLSNKkL2Wt1bp-OqbNeAPe_euxZ6puDD2aahUvaD-V-caAu6WEALw_wcB',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/5/0/5060420235166_3_.jpg',
        price: 1180,
      },
    ],
  },
  'כריות הנקה': {
    description: 'כרית בצורת "ח" לתמיכה בתינוק בזמן הנקה.',
    tip: 'חשוב שתהיה קשיחה וצפופה — כדי להרים את התינוק אלייך ולשמור על הגב שלך.',
    type: 'treat',
    products: [
      {
        name: 'כרית הנקה',
        store: 'mama-sita',
        url: 'https://www.mama-sita.com/%D7%9E%D7%95%D7%A6%D7%A8/%D7%9B%D7%A8%D7%99%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-%D7%91%D7%99%D7%99%D7%A1%D7%99%D7%A7-%D7%A0%D7%95%D7%A8%D7%93%D7%99/',
        image: 'https://www.mama-sita.com/wp-content/uploads/מתוקן-2.jpg',
        price: 389,
      },
      {
        name: 'כרית הנקה - SUPER DELUXE PLATINUM',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/nursing-pillows/%D7%9B%D7%A8%D7%99%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-SUPER-DELUXE-PLATINUM/p/mp-00254005',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/705873002761.jpg',
        price: 349,
      },
      {
        name: 'Nino - כרית הנקה - פרחוני',
        store: 'Terminal X',
        url: 'https://www.terminalx.com/r739960001?gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV849HJCbsASAz5LeYLI6390NoAyhByC8J6wz-GkfykMndkDx03QaDUaAlnjEALw_wcB&gad_campaignid=22041160523&gad_source=1&utm_campaign=20_acquisition_shopping_home&utm_medium=cpc&utm_source=google&color=2096',
        image: 'https://media.terminalx.com/pub/media/catalog/product/cache/webp/f112238e8de94b6d480bd02e7a9501b8/r/7/r739960001-11771226704_jpeg_like_70.webp',
        price: 239.9,
      },
    ],
  },
  'סינרי הנקה': {
    description: 'סינר רחב לכיסוי בזמן הנקה בציבור.',
    tip: 'להנקה בחוץ — חפשי סינר עם קשת בצוואר, שיאפשר קשר עין ואוויר.',
    type: 'treat',
    products: [
      {
        name: 'סינר הנקה 100% כותנה טטרא - תכלת mountain',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/breastfeeding-aprons/%D7%A1%D7%99%D7%A0%D7%A8-%D7%94%D7%A0%D7%A7%D7%94-100%25-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%98%D7%98%D7%A8%D7%90-%D7%AA%D7%9B%D7%9C%D7%AA-mountain/p/mp-00417153',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7297219562563.jpg',
        price: 75,
      },
      {
        name: 'סינר הנקה',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%A1%D7%99%D7%A0%D7%A8-%D7%94%D7%A0%D7%A7%D7%94/?gad_source=1&gad_campaignid=19482441104&gbraid=0AAAAAoepxMdj8IRERBTQXIiTr2DjvMd8o&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV9tOuGwQoDikV_4oWWCNfrHDB_bkcxNy45jROjDke8wne80Kg2L0noaAoO8EALw_wcB',
        image: 'https://tzirim.co.il/app/uploads/2024/10/Apron1-Photoroom-1.png',
        price: 50,
      },
      {
        name: 'סינר הנקה במבוק',
        store: 'Lamer',
        url: 'https://la-mer.co.il/products/%D7%A1%D7%99%D7%A0%D7%A8-%D7%94%D7%A0%D7%A7%D7%94?srsltid=AfmBOoos-wQpNLBUc2VctqCZGAHkz7DtjUpqyKGbh2mEVCQns2KF-RQB',
        image: 'https://la-mer.co.il/cdn/shop/files/IMG_0530.jpg?v=1762718771',
        price: 99,
      },
    ],
  },
  'רפידות ומגיני פטמות': {
    description: 'רפידות ספיגה לחזייה וכיסויי סיליקון לפטמה.',
    tip: 'רפידות — חובה למניעת כתמים. מגיני פטמות מוסיפים רק בהמלצת יועצת הנקה, לא מראש.',
    type: 'must',
    products: [
      {
        name: 'רפידות nursicare',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%A8%D7%A4%D7%99%D7%93%D7%95%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-%D7%98%D7%99%D7%A4%D7%95%D7%9C%D7%99%D7%95%D7%AA/',
        image: 'https://tzirim.co.il/app/uploads/2024/10/DSC_1116-Enhanced-NR-2-copy-Photoroom-Photoroom.png.webp',
        price: 91,
      },
      {
        name: 'אוונט - רפידות הנקה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/nursing-pads-and-protectors/%D7%A8%D7%A4%D7%99%D7%93%D7%95%D7%AA-%D7%94%D7%A0%D7%A7%D7%94/p/614843',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/8710103556879.jpg',
        price: 50.9,
      },
      {
        name: 'רפידות הנקה טוויגי',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%A8%D7%A4%D7%99%D7%93%D7%95%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-flawless-nursing-pads/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2020/09/9130.jpg',
        price: 19.9,
      },
    ],
  },
  'כורסאות הנקה': {
    description: 'כורסא נוחה ומתנדנדת לחדר התינוק.',
    tip: 'נחמד אבל לא חובה. כל כורסא נוחה בסלון עם הדום לרגליים תעשה את העבודה.',
    type: 'treat',
    products: [
      {
        name: 'כורסת הנקה דגם נורדיק',
        store: 'בייבי לי',
        url: 'https://www.baby-lee.co.il/rockingadultchairs',
        image: 'https://static.wixstatic.com/media/d20f5a_13d8e050d94c4d8592489796406c463c~mv2.png/v1/crop/x_496,y_36,w_676,h_827/fill/w_676,h_826,al_c,q_90,enc_avif,quality_auto/Screenshot%202025-01-29%20102329.png',
        price: 1690,
      },
      {
        name: 'כורסת הנקה מתנדנדת דייניז סקיילר שמנת – Dainy’s Skylar Ivory',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%9b%d7%95%d7%a8%d7%a1%d7%aa-%d7%94%d7%a0%d7%a7%d7%94-%d7%9e%d7%aa%d7%a0%d7%93%d7%a0%d7%93%d7%aa-%d7%93%d7%99%d7%99%d7%a0%d7%99%d7%96-%d7%a1%d7%a7%d7%99%d7%99%d7%9c%d7%a8-%d7%a9%d7%9e%d7%a0%d7%aa/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/11/141388.jpg',
        price: 999,
      },
      {
        name: 'כורסת הנקה מתנדנדת ומסתובבת בגוון בוקלה קרם דגם GOMI',
        store: 'בייבי לי',
        url: 'https://www.baby-lee.co.il/product-page/%D7%9B%D7%95%D7%A8%D7%A1%D7%AA-%D7%94%D7%A0%D7%A7%D7%94-%D7%9E%D7%AA%D7%A0%D7%93%D7%A0%D7%93%D7%AA-%D7%95%D7%9E%D7%A1%D7%AA%D7%95%D7%91%D7%91%D7%AA-%D7%91%D7%92%D7%95%D7%95%D7%9F-%D7%91%D7%95%D7%A7%D7%9C%D7%94-%D7%A7%D7%A8%D7%9D-%D7%93%D7%92%D7%9D-gomi',
        image: 'https://static.wixstatic.com/media/d20f5a_270b216533ea430183dfe49b01c8274e~mv2.jpg/v1/fill/w_498,h_497,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/d20f5a_270b216533ea430183dfe49b01c8274e~mv2.jpg',
        price: 2590,
      },
    ],
  },

  // --- אמבט וטיפול בתינוק ---
  'אמבטיות ומעמדים': {
    description: 'אמבט פלסטיק לתינוק + רגליים להגבהה.',
    tip: 'קחי עם מעמד (רגליים) — הגב שלך יודה לך.',
    type: 'must',
    products: [
      {
        name: 'אמבטיה מתקפלת – ים כחול עם פקק משנה צבע לפי חום',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/stokke/flexi-bath/%d7%90%d7%9e%d7%91%d7%98%d7%99%d7%94-%d7%9e%d7%aa%d7%a7%d7%a4%d7%9c%d7%aa-%d7%99%d7%9d-%d7%9b%d7%97%d7%95%d7%9c-%d7%a2%d7%9d-%d7%a4%d7%a7%d7%a7-%d7%9e%d7%a9%d7%a0%d7%94-%d7%a6%d7%91%d7%a2/',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2024/10/FlexiBath_OceanBlue_NewbornSupp_onStand_231220-3096_RT.jpg',
        price: 280,
      },
      {
        name: 'בבה ג׳ו אמבטיה מעוצבת LUMA אפור',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby_bath_tubs/products/%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%9E%D7%A2%D7%95%D7%A6%D7%91%D7%AA-luma-%D7%90%D7%A4%D7%95%D7%A8-1',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4521341-A.jpg?v=1762761964&width=1800',
        price: 399,
      },
      {
        name: 'Bebe אמבטיה סיליקון מתקפלת',
        store: 'סופר־פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-wash/tubs-and-infant-bath-seats/%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%A1%D7%99%D7%9C%D7%99%D7%A7%D7%95%D7%9F-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C%D7%AA-%D7%9B%D7%95%D7%9C%D7%9C-%D7%9E%D7%A2%D7%9E%D7%93-%D7%9E%D7%95%D7%91%D7%A0%D7%94-%D7%93%D7%92%D7%9D-Magic-Fold-%D7%A6%D7%91%D7%A2-%D7%94%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%A9%D7%9E%D7%A0%D7%AA/p/mp-00318559',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/1208108116756.jpg',
        price: 349,
      },
    ],
  },
  'מושבי אמבטיה': {
    description: 'מתקן ("דפני") שמחזיק את התינוק שוכב בתוך המים.',
    tip: 'היד השלישית שלך. נותן ביטחון לקלח לבד — מוצר ששווה כל שקל בהתחלה.',
    type: 'must',
    products: [
      {
        name: 'דפני לאמבטיה - לבן',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/baby_bath_tubs/products/%D7%9E%D7%95%D7%A9%D7%91-%D7%90%D7%9E%D7%91%D7%98-%D7%9E%D7%AA%D7%9B%D7%95%D7%95%D7%A0%D7%9F-%D7%9C%D7%91%D7%9F-1',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-6200235-A.jpg?v=1734522810&width=1800',
        price: 29,
      },
      {
        name: 'מושב אמבטיה לתינוק טוויגי',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%95%D7%A9%D7%91-%D7%90%D7%A1%D7%9C%D7%94-%D7%9E%D7%95%D7%A9%D7%91-%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-bath-seat/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2022/09/102205.jpg',
        price: 119.9,
      },
      {
        name: 'תומך אמבטיה רשת',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%9E%D7%95%D7%A9%D7%91%D7%99-%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94/products/3002538-%D7%AA%D7%95%D7%9E%D7%9A-%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%A8%D7%A9%D7%AA-%D7%9E%D7%99%D7%94-%D7%91%D7%99%D7%99%D7%91%D7%99',
        image: 'https://motsesim.co.il/cdn/shop/files/577169b8b3ee6d3a6177ce406f9bef6d.png',
        price: 29.9,
      },
    ],
  },
  'מגבות לתינוק': {
    description: 'מגבת רכה עם קפוצ\'ון בפינה.',
    tip: 'עדיף מגבות גדולות שיעטפו אותו גם בגיל שנתיים. 2-3 יספיקו.',
    type: 'must',
    products: [
      {
        name: 'מגבת לתינוק Stripes - מוקה',
        store: 'Take a nap',
        url: 'https://takeanap.co.il/products/%D7%9E%D7%92%D7%91%D7%AA-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-stripes-%D7%9E%D7%95%D7%A7%D7%94',
        image: 'https://takeanap.co.il/cdn/shop/files/2025_08_18_NAP8317_7cb9cdbd-ecb1-415c-9b74-be99b35aca60.jpg?v=1756115770&width=2000',
        price: 189.9,
      },
      {
        name: 'מגבת תינוקות Cuddle Dune & Sea',
        store: 'Cotton Club',
        url: 'https://cottonclub.co.il/products/%D7%9E%D7%92%D7%91%D7%AA-%D7%AA%D7%99%D7%A0%D7%95%D7%A7%D7%95%D7%AA-cuddle-3?',
        image: 'https://cottonclub.co.il/cdn/shop/files/2025_07_29-CC32628.jpg?v=1754992914&width=3911',
        price: 139,
      },
      {
        name: 'מגבת גדולה ומטלית רחצה מבד במבוק',
        store: 'Bina & Bino',
        url: 'https://www.binaandbino.com/products/%D7%9E%D7%92%D7%91%D7%AA-%D7%92%D7%93%D7%95%D7%9C%D7%94-%D7%95%D7%9E%D7%98%D7%9C%D7%99%D7%AA-%D7%A8%D7%97%D7%A6%D7%94-%D7%9E%D7%91%D7%93-%D7%91%D7%9E%D7%91%D7%95%D7%A7-elephant?variant=45807780528381&country=IL&currency=ILS&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&cmp_id=22970313341&adg_id=183480378663&utm_source=google&utm_medium=cpc&gad_source=1&gad_campaignid=22970313341&gbraid=0AAAAACskMM0LUDe0G2mtVVwX7cnvlEJUk&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8rUmWifkrDdhaQyInHkvMwrSSn2HUtMjmqvSW3Jaobgwu5Gg_Wv0YaAttFEALw_wcB',
        image: 'https://www.binaandbino.com/cdn/shop/files/tal-zelicovitch-36_48c7c7e1-6c0b-4d1d-ab44-409bb0134f27.jpg',
        price: 120,
      },
    ],
  
  },
  'מברשות וסט מניקור': {
    description: 'מספריים עדינים, פצירה ומברשת שיער רכה.',
    tip: 'הציפורניים הקטנות חדות בטירוף. מספריים עגולים או פצירה חשמלית — חיוני.',
    type: 'treat',
    products: [
      {
        name: 'סט מניקור וטיפוח לתינוק צ’יקו – Chicco Nail Care Set',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%A1%D7%98-%D7%9E%D7%A0%D7%99%D7%A7%D7%95%D7%A8-%D7%95%D7%98%D7%99%D7%A4%D7%95%D7%97-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-nail-care-set/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2019/09/100190.jpeg',
        price: 44,
      },
      {
        name: 'Rechargeable Baby Nail File',
        store: 'Amazon',
        url: 'https://www.amazon.com/dp/B0FMS54HWY/ref=sspa_dk_detail_right_aax_0?psc=1&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfcmlnaHRfc2hhcmVk',
        image: 'https://m.media-amazon.com/images/I/71nEULUJGmL._SX466_.jpg',
        price: 45,
      },
      {
        name: 'סט מברשת ומסרק כחול',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%9E%D7%91%D7%A8%D7%A9%D7%95%D7%AA-%D7%95%D7%A1%D7%98-%D7%9E%D7%A0%D7%99%D7%A7%D7%95%D7%A8/products/4290475-%D7%A1%D7%98-%D7%9E%D7%91%D7%A8%D7%A9%D7%AA-%D7%95%D7%9E%D7%A1%D7%A8%D7%A7-%D7%9B%D7%97%D7%95%D7%9C-%D7%91%D7%91%D7%94-%D7%92%D7%95',
        image: 'https://motsesim.co.il/cdn/shop/files/02169220d7d72639aa757c6d5f8a11e0.png',
        price: 39.9,
      },
    ],
  },
  'תכשירי טיפול בתינוק': {
    description: 'סבון, שמפו, שמן ושמני עיסוי מותאמים לתינוק.',
    tip: 'פחות זה יותר. שמן אמבט עדיף על סבון שמייבש, ועדיף בלי בישום.',
    type: 'must',
    products: [
      {
        name: 'מארז רחצה לתינוק - מוסטלה',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/mouth-body-sex-hygiene/higiinh-aiwit/%D7%9E%D7%90%D7%A8%D7%96-%D7%A8%D7%97%D7%A6%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%9E%D7%95%D7%A1%D7%98%D7%9C%D7%94-mustela?gad_source=1&gad_campaignid=17519788496&gbraid=0AAAAADkzFwwNJtHPhT-u4NF30q-3ybdrR&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV9Nv8OQZe03X-s0kdcKEkg-DSO-vfI44DJhvglbTGfagn2gpfDRFUoaArkQEALw_wcB',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/3/6/36126_35778_34290_35914_24932_1_.jpg',
        price: 286.43,
      },
      {
        name: 'מארז טיפוח לתינוק - Weleda',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/weleda-set-4pcs?gad_source=1&gad_campaignid=21302648113&gbraid=0AAAAADkzFwyXBZPW5W4naU3SqXlCJD4QH&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8Hr6aLHVX8mZGZeRwthzIUoHjj6YtC1mAbnR7qzlsfXuFZvURpWF4aAmHjEALw_wcB',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/w/e/weleda-set-4pcs_new_1_.jpg',
        price: 219,
      },
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
    tip: 'חיוני להורים טריים — מונע כוויות. אל תסמכי על המרפק בהתחלה.',
    type: 'must',
    products: [
      {
        name: 'מדחום לאמבטיה טוויגי',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%93%D7%97%D7%95%D7%9D-%D7%9C%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-flawless-bath-thermometer-3/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2021/05/1-13.jpg',
        price: 19,
      },
      {
        name: 'מד חום לאמבטיה DREAMS',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/suavinex/suavinex-collection/%D7%9E%D7%93-%D7%97%D7%95%D7%9D-%D7%9C%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-dreams/',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2024/05/8426420303996-01-scaled.jpg',
        price: 40,
      },
      {
        name: 'מד חום לאמבטיה – ברווז',
        store: 'Little Penguin',
        url: 'https://littlepenguin.co.il/product/%d7%9e%d7%93-%d7%97%d7%95%d7%9d-%d7%9c%d7%90%d7%9e%d7%91%d7%98%d7%99%d7%94-%d7%91%d7%a8%d7%95%d7%95%d7%96/',
        image: 'https://littlepenguin.co.il/wp-content/uploads/2020/11/Bath_therm_duck_1.jpg',
        price: 69,
      },
    ],
  },
  'צעצועים לאמבטיה': {
    description: 'ברווזים ומשחקי מים.',
    tip: 'מיותר לניובורן. אפשר להוסיף בהמשך, כשהוא מתחיל לשחק במים.',
    type: 'treat',
    products: [
      {
        name: 'ערכת משחק אמבטיה - שבשבת פרח',
        store: 'hilisplay',
        url: 'https://hilisplay.com/products/%D7%A2%D7%A8%D7%9B%D7%AA-%D7%9E%D7%A9%D7%97%D7%A7%D7%99-%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94-%D7%A9%D7%91%D7%A9%D7%91%D7%AA-%D7%A4%D7%A8%D7%97-%D7%9E%D7%91%D7%99%D7%AA-pit-toys',
        image: 'https://hilisplay.com/cdn/shop/files/b_2_18.jpg?v=1744579996&width=500',
        price: 55,
      },
      {
        name: 'מארז לוויתנים שוחים לאמבטיה',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/bath_toys/products/%D7%9E%D7%90%D7%A8%D7%96-%D7%9C%D7%95%D7%95%D7%99%D7%AA%D7%A0%D7%99%D7%9D-%D7%A9%D7%95%D7%97%D7%99%D7%9D-%D7%9C%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-7562502-C.jpg?v=1734781829&width=1080',
        price: 49.9,
      },
      {
        name: 'מקלחון פיל לאמבטיה',
        store: 'Smart Baby',
        url: 'https://www.sbaby.co.il/product/%D7%9E%D7%A7%D7%9C%D7%97%D7%95%D7%9F-%D7%A4%D7%99%D7%9C-%D7%9C%D7%90%D7%9E%D7%91%D7%98%D7%99%D7%94?',
        image: 'https://www.sbaby.co.il/images/itempics/2786_20082020134458.jpg',
        price: 98,
      },
    ],
  },
  'טבעות אמבטיה': {
    description: 'מושב ישיבה מפלסטיק לאמבטיה (לא שכיבה).',
    tip: 'לא לשימוש לפני שהוא יושב יציב (סביב 7-8 חודשים) — זה מסוכן.',
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
    tip: 'כמות: 6-10 יח\' במידה ראשונה. מידת NB מחזיקה 3-6 שבועות גג — אל תעמיסי. הרוב 0-3M. שכבה אחת יותר ממה שאת לובשת בבית.',
    type: 'must',
    products: [
      {
        name: 'לבן - בגדי גוף בייסיק עם שרוול ארוך לתינוקות',
        store: 'Next',
        url: 'https://www.next.co.il/he/style/st407748/522046',
        image: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/522046s2.jpg?im=Resize,width=750',
        price: 48,
      },
      {
        name: 'מארז 3 בגדי גוף ריב טבעי',
        store: 'Golf Kids',
        url: 'https://www.golfkids.co.il/2953706226',
        image: 'https://www.golfkids.co.il/pub/media/catalog/product/cache/a052891beaa2eb4ef57165546a9b78a9/2/9/2953706_226_A-17656972601226642.jpg',
        price: 119,
      },
      {
        name: 'שלישיית בגדי גוף גווני מלאנג׳',
        store: 'Moy',
        url: 'https://hellomoy.com/collections/%D7%91%D7%92%D7%93%D7%99-%D7%92%D7%95%D7%A3-%D7%A9%D7%A8%D7%95%D7%95%D7%9C-%D7%A7%D7%A6%D7%A8-%D7%91%D7%A0%D7%95%D7%AA/products/%D7%A9%D7%9C%D7%99%D7%A9%D7%99%D7%99%D7%AA-%D7%91%D7%92%D7%93%D7%99-%D7%92%D7%95%D7%A3-%D7%92%D7%95%D7%95%D7%A0%D7%99-%D7%9E%D7%9C%D7%90%D7%A0%D7%92-10038-copy',
        image: 'https://hellomoy.com/cdn/shop/files/11038_d223e6ac-13f3-46d8-bf5d-05690499e3d5_180x.jpg',
        price: 129,
      },
    ],
  
  },
  'מכנסיים ורגליות לתינוק': {
    description: 'מכנס עם רגלית סגורה (כמו גרב מובנה).',
    tip: 'הכי בסיסי. 7-10 יחידות מספיקות. בדקי שהגומי בבטן רך ולא לוחץ.',
    type: 'must',
  },
  'אוברולים לתינוקות': {
    description: 'בגד גוף ומכנס מחוברים ("וואנזי").',
    tip: 'הכי נוח לשינה. כמות: 6-8 יח\' במידה ראשונה. טיפ של אלופות: רק רוכסן! (לחצניות באמצע הלילה זה גהינום).',
    type: 'must',
    products: [
      {
        name: '7 Pack Two Way Zip Baby Sleepsuits',
        store: 'Next',
        url: 'https://www.next.co.il/en/style/su540438/aw3260',
        image: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/AW3260s2.jpg',
        price: 145,
      },
      {
        name: 'אוברול בשילוב הדפס פרחים',
        store: 'Terminal X',
        url: 'https://www.terminalx.com/baby/baby-girls/bodysuits-overalls/overalls/r19064?color=8602',
        image: 'https://media.terminalx.com/pub/media/catalog/product/cache/webp/f112238e8de94b6d480bd02e7a9501b8/r/1/r190642075-11769520003_jpeg_like_70.webp',
        price: 64.9,
      },
      {
        name: 'מארז אוברולים שרוול ארוך עם איורי חיות יער ועצים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-clothing/clothes/%D7%9C%D7%99%D7%99%D7%A3-%D7%91%D7%99%D7%99%D7%91%D7%99%D7%96-%D7%9E%D7%99%D7%A0%D7%A0%D7%94-%D7%9E%D7%90%D7%A8%D7%96-%D7%90%D7%95%D7%91%D7%A8%D7%95%D7%9C%D7%99%D7%9D-%D7%A9%D7%A8%D7%95%D7%95%D7%9C-%D7%90%D7%A8%D7%95%D7%9A-%D7%A2%D7%9D-%D7%90%D7%99%D7%95%D7%A8%D7%99-%D7%97%D7%99%D7%95%D7%AA-%D7%99%D7%A2%D7%A8-%D7%95%D7%A2%D7%A6%D7%99%D7%9D-%D7%9E%D7%AA%D7%95%D7%A7%D7%99%D7%9D-100%25-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%A8%D7%9B%D7%94-%D7%95%D7%A0%D7%A2%D7%99%D7%9E%D7%94/p/691270?gad_source=1&gad_campaignid=19298713142&gbraid=0AAAAADHSXtdz7cDDS_vX_tkEGpZMiY5ll&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-OMLUFCMz32hR2cL1H7qkcGUqnV9y7w0TloNkb22TDBr4-Yf6gNY8aAi5FEALw_wcB',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290120935983.jpg',
        price: 64.9,
      },
    ],
  
  },
  'סטים לתינוקות': {
    description: 'חליפות מעוצבות — ג\'ינסים, מכופתרים, סטים לאירוע.',
    tip: 'חמודים בתמונות, פחות נוחים ביומיום. ג\'ינסים וצווארונים שמורים לאירועים — לכל היתר כותנה רכה ופשוטה.',
    type: 'treat',
  },
  'כובע לתינוק': {
    description: 'כובע כותנה רך לשמירת חום הראש.',
    tip: 'נחמד ליציאה מבית החולים, במיוחד בחורף. 2-3 יספיקו. בבית מחומם להוריד — סכנת חימום יתר.',
    type: 'treat',
  },
  'כפפות לתינוק': {
    description: 'כפפות בד למניעת שריטות בפנים.',
    tip: 'תמיד נופלות. עדיף בגדי גוף עם שרוול מתהפך שמכסה את כף היד.',
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
    tip: 'תמיד נעלמות, אף פעם לא במספר זוגי. 4-6 זוגות. עדיף רגליות (מכנס עם גרב) שסוגרות את הפינה.',
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
    description: 'כרית בצורת קן שנותנת תחושת חיבוק וביטחון.',
    tip: 'נחמד למנוחה בשעות היום ולזמן ליד ההורים. הנחיות בטיחות שינה (Safe Sleep) לא ממליצות עליו לשינה לילית, ובכל מקרה רק בהשגחה.',
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
        name: 'בייבי נסט ארנבון',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/toys-and-activities/activity-mats/%D7%91%D7%99%D7%99%D7%91%D7%99-%D7%A0%D7%A1%D7%98-%D7%90%D7%A8%D7%A0%D7%91%D7%95%D7%9F/p/mp-00351627',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290019119043.jpg',
        price: 249,
      },
      {
        name: 'בייבינסט (קן) לתינוק - שנהב פנינה',
        store: 'Heny',
        url: 'https://www.heny.co.il/product-page/%D7%91%D7%99%D7%99%D7%91%D7%99%D7%A0%D7%A1%D7%98-%D7%A7%D7%9F-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%91%D7%A1%D7%99%D7%A1-%D7%91%D7%96-%D7%A9%D7%A0%D7%94%D7%91-%D7%90%D7%95%D7%A8%D7%A0%D7%99%D7%9D-1',
        image: 'https://static.wixstatic.com/media/18bf63_3dca7141ef364789a7904d9020ac5153~mv2.png/v1/fill/w_523,h_420,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/18bf63_3dca7141ef364789a7904d9020ac5153~mv2.png',
        price: 320,
      },
    ],
  },
  'סדינים': {
    description: 'סדין גומי המותאם למזרן תינוק/עריסה.',
    tip: 'חשוב שיהיה מתוח היטב. 3-5 סדינים — בהתחלה יש הרבה נזילות, ותתפלאי כמה מהר הם מתחלפים.',
    type: 'must',
    products: [
      {
        name: 'סדין למיטת תינוק',
        store: 'נינו',
        url: 'https://nino.co.il/product/54678213/',
        image: 'https://nino.co.il/wp-content/uploads/2025/07/sheet-Anemone-blossom-pp.jpg',
        price: 65,
      },
      {
        name: 'סדינים לתינוק ג׳רסי - אבן',
        store: 'Take a nap',
        url: 'https://takeanap.co.il/products/%D7%A1%D7%93%D7%99%D7%A0%D7%99%D7%9D-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%92-%D7%A8%D7%A1%D7%99-%D7%98%D7%A8%D7%99%D7%A7%D7%95-%D7%90%D7%91%D7%9F?variant=48992771932480&currency=ILS&adscale=1&utm_campaign=PMax_IL+%5BBaby%5D+Google+Pmax+Products+Conversions&utm_id=23533506470&utm_medium=paid+shopping&device=c&creativeId=&network=x&utm_source=google&site_source_name=adscale_pmax&gad_source=1&gad_campaignid=23538231328&gbraid=0AAAAABVTCuhE2iDweek-cPlbtYOJNfG8R&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV9i9qnH-ibkqHWFkq1m-SbXwe9ByPp0G4QHKSyxFNZypUaD_BMrsFUaAi3_EALw_wcB',
        image: 'https://takeanap.co.il/cdn/shop/files/2026_02_12-NAP1799.jpg?v=1771755672&width=2000',
        price: 49,
      },
      {
        name: 'סדין לעריסה - Forest Mist',
        store: 'מוצצים',
        url: 'https://motsesim.co.il/collections/%D7%A1%D7%93%D7%99%D7%A0%D7%99%D7%9D/products/%D7%A1%D7%93%D7%99%D7%9F-%D7%9C%D7%A2%D7%A8%D7%99%D7%A1%D7%94-forest-mist',
        image: 'https://motsesim.co.il/cdn/shop/files/149940.webp?v=1765800474',
        price: 56.9,
      },
    ],
  },
  'שמיכות לתינוק': {
    description: 'שמיכות דקות (טריקו/מוסלין) או שמיכות עיטוף.',
    tip: 'שמיכת עיטוף (Swaddle) עוזרת להרגעה. כמות: 2-3 יחידות. שמיכה רגילה בעריסה לא מומלצת בשנה הראשונה — שק שינה הוא בטוח יותר.',
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
      {
        name: 'שמיכה סרוגה לתינוקות וילדים - אבן',
        store: 'Take a nap',
        url: 'https://takeanap.co.il/products/%D7%A9%D7%9E%D7%99%D7%9B%D7%94-%D7%A1%D7%A8%D7%95%D7%92%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7%D7%95%D7%AA-%D7%95%D7%99%D7%9C%D7%93%D7%99%D7%9D-%D7%90%D7%91%D7%9F',
        image: 'https://takeanap.co.il/cdn/shop/files/100_150_7d206052-ed04-4902-9fbd-541a5d554af8.jpg?v=1733301598',
        price: 129,
      },
    ],
  },
  'משטחי החתלה': {
    description: 'משטח ספוג מצופה ניילון להנחה על השידה.',
    tip: 'רק משטח שעוונית או ניילון שקל לנקות במגבון. ניגוב וזהו.',
    type: 'must',
    products: [
      {
        name: 'בייבי נסט ארנבון - משטחי החתלה חד פעמיים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/diapering/diapering-surfaces-and-covers/%D7%9C%D7%99%D7%99%D7%A3-%D7%91%D7%99%D7%99%D7%91%D7%99%D7%96-%D7%9E%D7%A9%D7%98%D7%97-%D7%94%D7%97%D7%AA%D7%9C%D7%94-%D7%93%D7%99%D7%A1%D7%A0%D7%99-%D7%9E%D7%99%D7%A7%D7%99-%D7%95%D7%9E%D7%99%D7%A0%D7%99/p/686729',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290120932531.jpg',
        price: 17,
      },
      {
        name: 'משטח החתלה פולימר מוקצף בגוון טימין דגם MAMEE',
        store: 'בייבי לי',
        url: 'https://www.baby-lee.co.il/product-page/%D7%9E%D7%A9%D7%98%D7%97-%D7%94%D7%97%D7%AA%D7%9C%D7%94-%D7%A4%D7%95%D7%9C%D7%99%D7%9E%D7%A8-%D7%9E%D7%95%D7%A7%D7%A6%D7%A3-%D7%91%D7%92%D7%95%D7%95%D7%9F-%D7%98%D7%99%D7%9E%D7%99%D7%9F-%D7%93%D7%92%D7%9D-mamee',
        image: 'https://static.wixstatic.com/media/d20f5a_dcb9b90651494e7eb6dd41891742887c~mv2.png/v1/fill/w_498,h_497,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d20f5a_dcb9b90651494e7eb6dd41891742887c~mv2.png',
        price: 270,
      },
      {
        name: 'משטח החתלה לתינוק אולימולי',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%D7%9E%D7%A9%D7%98%D7%97-%D7%94%D7%97%D7%AA%D7%9C%D7%94-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%90%D7%95%D7%9C%D7%99%D7%9E%D7%95%D7%9C%D7%99-olimoli-changing-mat-2/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2026/02/141598.jpg',
        price: 329,
      },
    ],
  },
  'מגן ראש לתינוק': {
    description: 'כריות שטוחות שנקשרות לסורגי המיטה.',
    tip: 'הנחיות בטיחות שינה (Safe Sleep / טיפת חלב) ממליצות על מיטה ריקה לחלוטין בשנה הראשונה — בלי מגיני ראש, כריות או צעצועים. הסיכון הוא חנק. בעריסה שומרים על מינימליזם.',
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
    tip: 'הנחיות בטיחות שינה ממליצות לא להכניס למיטה בשנה הראשונה — סכנת חנק. נחמד לעיצוב, לא לשינה. אם בכל זאת מוסיפות לרשימה — לזמן ערות בהשגחה בלבד.',
    type: 'treat',
    products: [
      {
        name: 'נחשוש לתינוק 100% כותנה - שמנת מיננה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/baby-bedding/snake-pillow/%D7%A0%D7%97%D7%A9%D7%95%D7%A9-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-100%25-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%A9%D7%9E%D7%A0%D7%AA/p/mp-00342624',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7297629140719.jpg',
        price: 200,
      },
      {
        name: 'נחשוש שבלולי Jacquard',
        store: 'Take a nap',
        url: 'https://takeanap.co.il/products/%D7%A0%D7%97%D7%A9%D7%95%D7%A9-%D7%A9%D7%91%D7%9C%D7%95%D7%9C%D7%99-jacquard-%D7%9E%D7%95%D7%A7%D7%94?variant=48945553506624&currency=ILS&adscale=1&utm_campaign=PMax_IL+%5BBaby%5D+Google+Pmax+Products+Conversions&utm_id=23533506470&utm_medium=paid+shopping&device=c&creativeId=&network=x&utm_source=google&site_source_name=adscale_pmax&gad_source=1&gad_campaignid=23538231328&gbraid=0AAAAABVTCuhE2iDweek-cPlbtYOJNfG8R&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-fuYwSD6RUIOrliC9NMJ-PZ-bzZzycbw1bQ-GL5C7REbocEIghEa8aAoZLEALw_wcB',
        image: 'https://takeanap.co.il/cdn/shop/files/2026_02_12-NAP1426_344d0c1c-9b1a-4d8a-a5d8-80b5ff20dad5.jpg?v=1771754938',
        price: 349,
      },
      {
        name: 'נחשושי - Cotton Cloud',
        store: 'Minene',
        url: 'https://www.minene.net/15301080',
        image: 'https://www.minene.net/media/catalog/product/cache/905247217201be89629513475763a2c6/1/5/15301080_79_1.jpg',
        price: 129.9,
      },
    ],
  },
  'כריות לתינוק': {
    description: 'כרית לראש התינוק.',
    tip: 'אסור לשימוש בשינה מתחת לגיל שנה — סכנת חנק. רלוונטי רק לילדים מעל גיל שנה.',
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
    tip: 'מצוין עד גיל 5 חודשים. חפשי צורות בשחור-לבן — הקונטרסט הכי קל לתינוק לראות.',
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
      {
        name: 'צעצוע נייד לתינוק עץ',
        store: 'Ali Express',
        url: 'https://he.aliexpress.com/item/1005009714243924.html',
        image: 'https://ae-pic-a1.aliexpress-media.com/kf/S1da2b8a01f73499da9498ef084ab4494L.jpg_960x960q75.jpg_.avif',
        price: 65.97,
      },
    ],
  },
  'טרמפולינות': {
    description: 'כיסא בד גמיש חצי-שכיבה, לעיתים רוטט.',
    tip: 'הבייביסיטר שלך למקלחת. מעולה לזמן ערות קצר, לא לשינה.',
    type: 'treat',
    products: [
      {
        name: 'טרמפולינה סופט ארוג שחור/אפור כהה',
        store: 'שילב',
        url: 'https://www.shilav.co.il/collections/swings-and-bouncers/products/%D7%98%D7%A8%D7%9E%D7%A4%D7%95%D7%9C%D7%99%D7%A0%D7%94-%D7%A8%D7%9B%D7%94-%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%A9%D7%97%D7%95%D7%A8-%D7%90%D7%A4%D7%95%D7%A8-%D7%9B%D7%94%D7%94',
        image: 'https://www.shilav.co.il/cdn/shop/files/XL-4344022-A.jpg?v=1734703739&width=1800',
        price: 1210,
      },
      {
        name: 'טרמפולינה חשמלית טוויגי מרבל ביי מסגרת אפורה',
        store: 'עגליס',
        url: 'https://agalease-baby.co.il/product/%d7%98%d7%a8%d7%9e%d7%a4%d7%95%d7%9c%d7%99%d7%a0%d7%94-%d7%97%d7%a9%d7%9e%d7%9c%d7%99%d7%aa-%d7%98%d7%95%d7%95%d7%99%d7%92%d7%99-%d7%9e%d7%a8%d7%91%d7%9c-%d7%91%d7%99%d7%99-%d7%9e%d7%a1%d7%92%d7%a8/',
        image: 'https://agalease-baby.co.il/wp-content/uploads/2024/03/40502.jpg',
        price: 699,
      },
      {
        name: 'טרמפולינה בליס בייבי ביורן',
        store: 'Baby Bjorn',
        url: 'https://www.babybjorn-israel.co.il/product/bliss-bouncer/',
        image: 'https://www.babybjorn-israel.co.il/wp-content/uploads/006029-bouncer-bliss-woven-light-gray-melange-product-babybjorn-01-medium-768x768.jpg',
        price: 1330,
      },
    ],
  },
  'נדנדות': {
    description: 'מתקן חשמלי שמנדנד את התינוק להרגעה.',
    tip: 'הצלה אמיתית בגזים, אבל תופסת מקום. שווה לנסות יד שנייה או בהשאלה.',
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
    tip: 'חיוני להתפתחות (זמן בטן). תוודאי שזה נכנס למכונת כביסה — תודי לי אחר כך.',
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
      {
        name: 'קשת פעילות לתינוק מתכווננת עם בובות משחק',
        store: 'דרא',
        url: 'https://www.darahome.com/products/activity-gym-dark-for-babies?variant=41533575495793',
        image: 'https://www.darahome.com/cdn/shop/products/Sand_18_32cfe8a9-3710-4ad3-8f61-05cf29e6ee90.jpg',
        price: 589,
      },
    ],
  },
  'שמיכות פעילות': {
    description: 'שטיח מרופד להנחה על הרצפה.',
    tip: 'משטח מבודד לרצפה. רלוונטי בעיקר משלב הזחילה (סביב חצי שנה).',
    type: 'treat',
    products: [
      {
        name: 'משטח בייבי פרימיום מלבנים בז’',
        store: 'הריונית',
        url: 'https://airyonit.co.il/product/%D7%9E%D7%A9%D7%98%D7%97-%D7%91%D7%99%D7%99%D7%91%D7%99-%D7%A4%D7%A8%D7%99%D7%9E%D7%99%D7%95%D7%9D-%D7%9E%D7%9C%D7%91%D7%A0%D7%99%D7%9D-%D7%91%D7%96/?utm_source=Google%20Shopping&utm_campaign=google%20shoping%20project&utm_medium=cpc&utm_term=adtribes&gad_source=1&gad_campaignid=22714565246&gbraid=0AAAAACUi8M8LezxjgQbw8qSNZ5d8cZt7L&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8aSwO_xygwH7hIk6jtPytbbMWite885qjMb_if5oGtuhsIuewSvoEaAnSHEALw_wcB',
        image: 'https://airyonit.co.il/wp-content/uploads/2023/05/%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%9C%D7%9C%D7%90-%D7%A9%D7%9D-11.jpg',
        price: 599,
      },
      {
        name: 'משטח פעילות דו צדדי מתקפל לתיק',
        store: 'Hilis',
        url: 'https://hilisplay.com/products/%D7%9E%D7%A9%D7%98%D7%97-%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%93%D7%95-%D7%A6%D7%93%D7%93%D7%99-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C-%D7%9C%D7%AA%D7%99%D7%A7',
        image: 'https://hilisplay.com/cdn/shop/files/P08K131_1.jpg?v=1732443109&width=500',
        price: 99.5,
      },
      {
        name: 'פישר פרייס מזרן פעילות מתקפל בצורת פנדה 3 ב-1',
        store: 'אמיגו',
        url: 'https://www.amigo.co.il/product/%D7%A4%D7%99%D7%A9%D7%A8-%D7%A4%D7%A8%D7%99%D7%99%D7%A1-%D7%9E%D7%96%D7%A8%D7%9F-%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9E%D7%AA%D7%A7%D7%A4%D7%9C-%D7%91%D7%A6%D7%95%D7%A8%D7%AA-%D7%A4%D7%A0%D7%93/',
        image: 'https://www.amigo.co.il/wp-content/uploads/2025/11/71KwQOfuvlL._AC_UF8941000_QL80_-1.jpg',
        price: 149,
      },
    ],
  },
  'נשכנים ורעשנים': {
    description: 'צעצועי אחיזה ונשיכה לפה.',
    tip: 'רלוונטי רק מגיל 3 חודשים, כשהוא מתחיל לתפוס. אחד או שניים יספיקו.',
    type: 'treat',
    products: [
      {
        name: 'מארז נשכנים לפעוטות',
        store: 'אמיגו',
        url: 'https://www.amigo.co.il/product/%D7%9E%D7%90%D7%A8%D7%96-%D7%A8%D7%A2%D7%A9%D7%A0%D7%99%D7%9D-%D7%9C%D7%A4%D7%A2%D7%95%D7%98%D7%95%D7%AA/',
        image: 'https://www.amigo.co.il/wp-content/uploads/2025/07/602772647171-scaled.jpg',
        price: 49,
      },
      {
        name: 'רעשן ונשכן לתינוק, בירדי',
        store: 'דרא',
        url: 'https://www.darahome.com/collections/smart-collection-12/products/sensory-rattle-w-teether-birdee?variant=40226680438897',
        image: 'https://www.darahome.com/cdn/shop/files/62_e2894611-5327-4e23-a4e5-94c389d458f0.jpg',
        price: 79,
      },
      {
        name: 'נשכן קופיף קטן',
        store: 'Mamo',
        url: 'https://www.mamo-israel.co.il/items/3970833-%D7%A0%D7%A9%D7%9B%D7%9F-%D7%A7%D7%95%D7%A4%D7%99%D7%A3-%D7%A7%D7%98%D7%9F-%D7%90%D7%A4%D7%95%D7%A8-MATCHSTICK-MONKEY-%D7%9E%D7%A6%D7%A1%D7%98%D7%99%D7%A7-%D7%9E%D7%90%D7%A0%D7%A7%D7%99',
        image: 'https://d3m9l0v76dty0.cloudfront.net/system/photos/7135488/large/0ae3608db82235e4b24860a6129e7927.jpg',
        price: 65,
      },
    ],
  },
  'שמיכי לתינוק': {
    description: 'חתיכת בד קטנה עם ראש בובה — חפץ מעבר מרגיע.',
    tip: 'חפץ מעבר מרגיע. תבדקי שאין חלקים קטנים שעלולים להיתלש — סכנת חנק.',
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
    tip: 'קחי איתך חבילה לבית החולים. הרבה יותר נוחים מתחתונים רגילים עם תחבושות גדולות.',
    type: 'must',
    products: [
      {
        name: 'תחתוני רשת',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/care/feminine-hygiene-products/after-birth/postpartum-web-briefs/%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%99-%D7%A8%D7%A9%D7%AA-L-XL/p/649540',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290118204114.jpg',
        price: 19,
      },
      {
        name: 'תחתונים סופגים לאחר לידה',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%AA%D7%97%D7%AA%D7%95%D7%A0%D7%99%D7%9D-%D7%A1%D7%95%D7%A4%D7%92%D7%99%D7%9D-%D7%9C%D7%A0%D7%A9%D7%99%D7%9D-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94-%D7%A7%D7%95%D7%98%D7%A7%D7%A1/?attribute_%25d7%259e%25d7%2599%25d7%2593%25d7%2594=L%2FXL&gad_source=1&gad_campaignid=19482441104&gbraid=0AAAAAoepxMdj8IRERBTQXIiTr2DjvMd8o&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-qlpjU7zeTkwULX0QfU7qE72FAeSjOSPbhO0VzzJG-Uc_4Mw2L7DgaAk2aEALw_wcB',
        image: 'https://tzirim.co.il/app/uploads/2025/11/l-kotext1.png',
        price: 36,
      },
      {
        name: 'תחתוני רשת חד פעמיים לנשים אחרי לידה',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/mouth-body-sex-hygiene/higiinh-aiwit/feminine-hygiene/soft-touch-disposable-underwear-m-l-2-pack',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/7/2/7290004559939.png',
        price: 29.9,
      },
    ],
  },
  'תחבושות לאחר לידה': {
    description: 'תחבושות גדולות וסופגות במיוחד לימים הראשונים אחרי הלידה.',
    tip: 'קחי מידה גדולה. בבית החולים בדרך כלל מספקים, אבל כדאי שיהיה גם בבית.',
    type: 'must',
    products: [
      {
        name: 'תחבושות היגייניות לאחר לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/care/feminine-hygiene-products/after-birth/postpartum-web-briefs/%D7%AA%D7%97%D7%91%D7%95%D7%A9%D7%95%D7%AA-%D7%94%D7%99%D7%92%D7%99%D7%99%D7%A0%D7%99%D7%95%D7%AA-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94-0-2/p/671440',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/5060420233445.jpg',
        price: 33,
      },
      {
        name: 'תחבושות לאחר לידה מכותנה אורגנית',
        store: 'Elysium',
        url: 'https://elysium-baby.com/products/%D7%AA%D7%97%D7%91%D7%95%D7%A9%D7%95%D7%AA-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94-%D7%9E%D7%9B%D7%95%D7%AA%D7%A0%D7%94-%D7%90%D7%95%D7%A8%D7%92%D7%A0%D7%99%D7%AA-12-%D7%99%D7%97%D7%99%D7%93%D7%95%D7%AA-organyc-1?variant=50364372877590&currency=ILS&adscale=1&utm_campaign=PMax_IL+%5BPerformance+Max++%5B%D7%A9%D7%95%D7%A4%D7%99%D7%A0%D7%92+%D7%9E%D7%95%D7%A6%D7%A8%D7%99%D7%9D+%D7%91%D7%95%D7%93%D7%93%D7%99%D7%9D%5D%5D+%D7%9E%D7%95%D7%93%D7%A2%D7%95%D7%AA+%D7%A7%D7%91%D7%95%D7%A2%D7%95%D7%AA+%D7%93%D7%95%D7%94%D7%A8%D7%95%D7%AA+&utm_id=21187019430&utm_medium=paid+shopping&device=c&creativeId=&network=x&utm_source=google&site_source_name=adscale_pmax&gad_source=1&gad_campaignid=21197597407&gbraid=0AAAAADe2pyhd8rLBDVeObhDM3W0-xDF-F&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV_yGsJ8f-EHSuhu5p2S4uVEykifK89ydxNfk6WdaLA3taNaYSUboIkaAjlmEALw_wcB',
        image: 'https://elysium-baby.com/cdn/shop/files/5fcf9ae38acb600a603297bee65bd62a.jpg?v=1754835338&width=641',
        price: 39.9,
      },
    ],
  },
  'בקבוק פרי': {
    description: 'בקבוק לשטיפה עדינה במקום נייר טואלט לאחר הלידה.',
    tip: 'מוצר קטן שעושה הבדל ענק. ממלאים מים פושרים ושוטפים בעדינות — הקלה אמיתית.',
    type: 'must',
    products: [
      {
        name: 'בקבוק שטיפה לאחר לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/nursing-and-feeding/baby-bottle-sterilizers/%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%A9%D7%98%D7%99%D7%A4%D7%94-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94/p/696449',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/5060420232721.jpg',
        price: 89,
      },
      {
        name: 'אינטיקייר - בקבוק שטיפה אינטימית לאחר הלידה',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/mom-baby/mother/anti-care-baby-teva',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/6/0/60_-_2023-01-03t085654.780.png',
        price: 56.9,
      },
      {
        name: 'לייף פרופשונל - בקבוק פרי לשטיפה אינטימית לאחר לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/health/%D7%91%D7%A7%D7%91%D7%95%D7%A7-%D7%A4%D7%A8%D7%99-%D7%9C%D7%A9%D7%98%D7%99%D7%A4%D7%94-%D7%90%D7%99%D7%A0%D7%98%D7%99%D7%9E%D7%99%D7%AA-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94/p/688587',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290120933293.jpg',
        price: 34.9,
      },
    ],
  },
  'שמן שקדים (עיסוי פרינאום)': {
    description: 'שמן טבעי לעיסוי פרינאום בשבועות האחרונים להריון.',
    tip: 'מתחילים משבוע 34. עיסוי יומי יכול לעזור בגמישות הרקמות ולהפחית סיכוי לקרעים.',
    type: 'treat',
    products: [
      {
        name: 'שמן שקדים',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/care/dermocosmetics/body-care-dermocosmetics/%D7%A9%D7%9E%D7%9F-%D7%A9%D7%A7%D7%93%D7%99%D7%9D/p/440950',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290103435561.jpg',
        price: 26,
      },
      {
        name: 'שמן שקדים ללידה',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%A9%D7%9E%D7%9F-%D7%A9%D7%A7%D7%93%D7%99%D7%9D-%D7%9C%D7%9C%D7%99%D7%93%D7%94-%D7%9C%D7%99%D7%99%D7%9F-%D7%A6%D7%99%D7%A8%D7%99%D7%9D/',
        image: 'https://tzirim.co.il/app/uploads/2024/10/DSC_1003-Enhanced-NR-copy-Photoroom-Photoroom-1.png',
        price: 39,
      },
      {
        name: 'שמן לעיסוי פרינאום - וולדה WELEDA',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/mom-baby/mother/perineum-oil-weleda',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/4/0/4001638095105.jpg',
        price: 64.9,
      },
    ],
  },
  'פדים מגנזיום / קרים': {
    description: 'פדים מרגיעים לאזור הפרינאום לאחר הלידה.',
    tip: 'שימי במקפיא עוד לפני הלידה. מקלים מאוד על נפיחות וכאבים באזור.',
    type: 'treat',
    products: [
      {
        name: 'קומפרסים מגנזיום סולפאט 35% לתפרים אחרי לידה',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/health/other-pharmacy-products/skin/%D7%A7%D7%95%D7%9E%D7%A4%D7%A8%D7%A1%D7%99%D7%9D-%D7%9E%D7%92%D7%A0%D7%96%D7%99%D7%95%D7%9D-%D7%A1%D7%95%D7%9C%D7%A4%D7%90%D7%98-35%25-%D7%9C%D7%AA%D7%A4%D7%A8%D7%99%D7%9D-%D7%90%D7%97%D7%A8%D7%99-%D7%9C%D7%99%D7%93%D7%94/p/577584',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290111598951.jpg',
        price: 34,
      },
      {
        name: 'פד קירור לאחר הלידה - בייבי טבע',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%A4%D7%93-%D7%A7%D7%99%D7%A8%D7%95%D7%A8-%D7%9C%D7%90%D7%97%D7%A8-%D7%9C%D7%99%D7%93%D7%94/?gad_source=1&gad_campaignid=19482441104&gbraid=0AAAAAoepxMdj8IRERBTQXIiTr2DjvMd8o&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV-YsINExPsqGgYJ8MR_qAdqdBKcbg_Ud9WeVl8e1BVi_AHz3K2o5s8aAkcdEALw_wcB',
        image: 'https://tzirim.co.il/app/uploads/2024/10/DSC_1036-Enhanced-NR-copy-Photoroom-Photoroom.png',
        price: 59,
      },
      {
        name: 'פד קירור לאחר הלידה - בייבי טבע',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/mom-baby/mother/cooling-pads-baby-teva',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/7/2/7290016062991.png',
        price: 59,
      },
    ],
  },
  'כרית ישיבה (דונאט)': {
    description: 'כרית בצורת טבעת להקלה בישיבה לאחר הלידה.',
    tip: 'הצלה אם היו תפרים. הופכת את הישיבה לנסבלת בימים הראשונים.',
    type: 'treat',
    products: [
      {
        name: 'כרית ישיבה עם חור מויסקו ג\'ל',
        store: 'wheelchairs',
        url: 'https://www.wheelchairs.co.il/%D7%9B%D7%A8%D7%99%D7%AA-%D7%99%D7%A9%D7%99%D7%91%D7%94-%D7%A2%D7%9D-%D7%97%D7%95%D7%A8-%D7%9E%D7%95%D7%99%D7%A1%D7%A7%D7%95-%D7%92%D7%9C',
        image: 'https://www.wheelchairs.co.il/content/images/thumbs/newThumbsDir/p_0000740_-.jpeg',
        price: 385,
      },
      {
        name: 'כרית דונט עם חור',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/health/orthopedics/lumbar-support-cushions-and-waist/%D7%9B%D7%A8%D7%99%D7%AA-%D7%93%D7%95%D7%A0%D7%98-%D7%A2%D7%9D-%D7%97%D7%95%D7%A8/p/mp-00124539',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7296073620242.jpg',
        price: 139,
      },
      {
        name: 'כרית ישיבה עם חור - סיליקור',
        store: 'ביוגאיה',
        url: 'https://www.biogaya.co.il/my-one-sittining-pillow-silicore?srsltid=AfmBOoouojrDzKGfYZM36TNW2n1xozoQQrUQLFFLyyzp7_JlMvx7Ma0R',
        image: 'https://www.biogaya.co.il/cdn-cgi/image/format=auto,metadata=none,quality=85,fit=pad,width=450,height=450/media/catalog/product/7/2/7290019989431.jpg',
        price: 99,
      },
    ],
  },
  'מכשיר TENS (שיכוך צירים)': {
    description: 'מכשיר חשמלי קטן ששולח פולסים לשיכוך כאבי צירים.',
    tip: 'שווה לשכור במקום לקנות. עוזר בשלבים המוקדמים של הלידה.',
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
    tip: 'מעולה לישיבה בהריון ולהקלה על כאבי גב. בלידה — עוזר לפתיחת האגן.',
    type: 'treat',
    products: [
      {
        name: 'כדור פיזיו כדור פילאטיס 75 ס"מ כולל משאבה - כחול',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/sport-and-outdoors/exercise-and-fitness/physio-ball/%D7%9B%D7%93%D7%95%D7%A8-%D7%A4%D7%99%D7%96%D7%99%D7%95-%D7%9B%D7%93%D7%95%D7%A8-%D7%A4%D7%99%D7%9C%D7%90%D7%98%D7%99%D7%A1-75-%D7%A1%22%D7%9E-%D7%9B%D7%95%D7%9C%D7%9C-%D7%9E%D7%A9%D7%90%D7%91%D7%94-%D7%9B%D7%97%D7%95%D7%9C/p/mp-00048045',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/1228128110343.jpg',
        price: 78,
      },
      {
        name: 'כדור פיזיו 65',
        store: 'צירים',
        url: 'https://tzirim.co.il/product/%D7%9B%D7%93%D7%95%D7%A8-%D7%A4%D7%99%D7%96%D7%99%D7%95/?gad_source=1&gad_campaignid=19482441104&gbraid=0AAAAAoepxMdj8IRERBTQXIiTr2DjvMd8o&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV8E2_P-inJuKyI30ANprwsOPuWs73GIVMmhCE9OZ8xiyUIWBUyL7tsaAoOPEALw_wcB#gallery',
        image: 'https://tzirim.co.il/app/uploads/2024/10/WhatsApp-Image-2024-11-07-at-11.34-Photoroom.png',
        price: 79,
      },
    ],
  },

  // --- תוספות לאחים ---
  'עגלות תאומים/אחים': {
    description: 'עגלה לשני ילדים (לרוחב או לאורך).',
    tip: 'בישראל כדאי רוחב עד 75 ס"מ — אחרת לא תעברי בדלתות סטנדרטיות.',
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
    tip: 'בדיוק בשביל אח גדול שמתעייף באמצע ורוצה טרמפ.',
    type: 'treat',
    products: [
      {
        name: 'טרמפיסט לעגלה – Click & Roll',
        store: 'סופר פארם',
        url: 'https://shop.super-pharm.co.il/infants-and-toddlers/trolleys-and-cases/parts-and-accessories-for-strollers-and-carriers/%D7%98%D7%A8%D7%9E%D7%A4%D7%99%D7%A1%D7%98-%D7%9C%D7%A2%D7%92%D7%9C%D7%94-%E2%80%93-Click-%26-Roll/p/mp-00268849',
        image: 'https://superpharmstorage.blob.core.windows.net/hybris/products/desktop/medium/7290114706896.jpg',
        price: 549,
      },
      {
        name: 'טרמפיסט אוניברסלי בצבע שחור – באמפריידר BUMPRIDER',
        store: 'בייבי שארק',
        url: 'https://baby-shark.co.il/product/%d7%98%d7%a8%d7%9e%d7%a4%d7%99%d7%a1%d7%98-%d7%90%d7%95%d7%a0%d7%99%d7%91%d7%a8%d7%a1%d7%9c%d7%99-%d7%9c%d7%a2%d7%92%d7%9c%d7%94-%d7%91%d7%90%d7%9e%d7%a4%d7%a8%d7%99%d7%99%d7%93%d7%a8-bumprider/',
        image: 'https://baby-shark.co.il/wp-content/uploads/images/7f58a4ce-8c29-11ee-a406-62533bef5de8.jpeg',
        price: 349,
      },
      {
        name: 'YOYO בורד טרמפיסט',
        store: 'סגל בייבי',
        url: 'https://www.segalbaby.co.il/product/stokke/yoyo/%D7%91%D7%95%D7%A8%D7%93-%D7%98%D7%A8%D7%9E%D7%A4%D7%99%D7%A1%D7%98-yoyo2/?utm_source=Google%20Shopping&utm_campaign=July24&utm_medium=cpc&utm_term=adtribes&gad_source=1&gad_campaignid=22312305782&gbraid=0AAAAABsavRi7XcGWjgnN_-NF9lqYE6S4e&gclid=Cj0KCQjw77bPBhC_ARIsAGAjjV9a4RKMRbqHFCCIGjlYyU3oDKBXAlDHl4Y2zByEBs6VICCLQ_o-9icaAkFSEALw_wcB',
        image: 'https://www.segalbaby.co.il/wp-content/uploads/2025/01/YOYO-2-BOARD-WEB-scaled.webp',
        price: 550,
      },
    ],
  },
  'בוסטרים לרכב': {
    description: 'מושב הגבהה ללא רצועות פנימיות.',
    tip: 'מושב לילדים גדולים (גיל 4 ומעלה) — לא רלוונטי לתינוק החדש.',
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
    icon: GiftIcon,
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
    ],
  },
  {
    id: 'car_safety',
    name: 'בטיחות ברכב',
    icon: CarSeatIcon,
    color: 'from-[#7a5582] to-[#624469]',
    suggestedItems: [
      'כיסא בטיחות',
      'סלקלים בטיחותיים',
      'מוצרים משלימים לרכב',
    ],
  },
  {
    id: 'furniture',
    name: 'ריהוט',
    icon: CribIcon,
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
    icon: MonitorIcon,
    color: 'from-[#86608e] to-[#6d4e74]',
    suggestedItems: ['מוניטור ואינטרקום'],
  },
  {
    id: 'feeding',
    name: 'האכלה',
    icon: BottleIcon,
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
    icon: NursingIcon,
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
    icon: BathIcon,
    color: 'from-[#c9c2cb] to-[#b5adb8]',
    suggestedItems: [
      'אמבטיות ומעמדים',
      'מושבי אמבטיה',
      'מגבות לתינוק',
      'מברשות וסט מניקור',
      'תכשירי טיפול בתינוק',
      'מד חום למים',
      'צעצועים לאמבטיה',
    ],
  },
  {
    id: 'clothing',
    name: 'ביגוד ראשוני',
    icon: OnesieIcon,
    color: 'from-[#86608e] to-[#6d4e74]',
    suggestedItems: [
      'בגדי גוף לתינוק',
      'אוברולים לתינוקות',
      'מכנסיים ורגליות לתינוק',
      'כובע לתינוק',
      'גרביים לתינוקות',
    ],
  },
  {
    id: 'bedding',
    name: 'מצעים ואקססוריז',
    icon: PillowIcon,
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
    icon: TeddyIcon,
    color: 'from-[#c9c2cb] to-[#b5adb8]',
    suggestedItems: [
      'מובייל לתינוק',
      'טרמפולינות',
      'אוניברסיטה לתינוק',
      'שמיכות פעילות',
      'נשכנים ורעשנים',
    ],
  },
  {
    id: 'birth_prep',
    name: 'הכנה ללידה ולאמא',
    icon: MomHeartIcon,
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
    icon: SiblingsIcon,
    color: 'from-[#7a5582] to-[#624469]',
    suggestedItems: [
      'עגלות תאומים/אחים',
      'טרמפיסט לעגלה',
    ],
  },
]
