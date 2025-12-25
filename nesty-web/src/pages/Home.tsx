import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { asset } from '../lib/assets'
import {
  Menu, X, Heart, Sparkles, ArrowLeft,
  ClipboardList, Star, Send, TrendingDown,
  Bell, CheckCircle, Users, Shield, Lock, EyeOff, Gift
} from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fffbff] text-[#1d192b]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fffbff]/80 backdrop-blur-xl border-b border-[#e7e0ec] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">
              איך זה עובד
            </a>
            <a href="#chip-in" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">
              Chip-In
            </a>
            <a href="#smart-engine" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">
              המנוע החכם
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 rounded-full bg-[#6750a4] text-white font-medium hover:bg-[#5a4690] transition-colors shadow-[0_4px_12px_rgba(103,80,164,0.25)]"
              >
                לקן שלי
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="px-5 py-2.5 rounded-full bg-[#f3edff] text-[#21005d] font-medium hover:bg-[#eaddff] transition-colors"
                >
                  כניסה
                </Link>
                <Link
                  to="/auth/signin"
                  className="px-6 py-2.5 rounded-full bg-[#6750a4] text-white font-medium hover:bg-[#5a4690] transition-colors shadow-[0_4px_12px_rgba(103,80,164,0.25)]"
                >
                  יצירת רשימה חינם
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#1d192b]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#fffbff] border-t border-[#e7e0ec] mt-4 py-4">
            <div className="space-y-4">
              <a
                href="#how-it-works"
                className="block text-[#49454f] hover:text-[#6750a4] font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                איך זה עובד
              </a>
              <a
                href="#smart-engine"
                className="block text-[#49454f] hover:text-[#6750a4] font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                המנוע החכם
              </a>
              <div className="pt-4 border-t border-[#e7e0ec] space-y-3">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="block w-full text-center px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium"
                  >
                    לקן שלי
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth/signin"
                      className="block w-full text-center px-6 py-3 rounded-full bg-[#f3edff] text-[#21005d] font-medium"
                    >
                      כניסה
                    </Link>
                    <Link
                      to="/auth/signin"
                      className="block w-full text-center px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium"
                    >
                      יצירת רשימה חינם
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-8 md:py-12 lg:py-16">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-right">
                <div className="flex justify-center lg:justify-center mb-8">
                  <img
                    src={asset('Circle_logo.png')}
                    alt="Nesty"
                    className="w-20 h-20 rounded-full shadow-lg"
                  />
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 text-[#1d192b] tracking-tight leading-[1.1]">
                  לבנות את הקן שלכם,{' '}
                  <span className="text-[#6750a4] relative inline-block">
                    חכם יותר.
                    <svg className="absolute w-full h-3 -bottom-1 right-0 text-[#eaddff] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                    </svg>
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-[#49454f] leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                  הרשימה היחידה שמאפשרת לכם לאסוף מוצרים מכל חנות בעולם, לשתף עם המשפחה והחברים, ולקבל התראות על מחירים טובים יותר.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to={isAuthenticated ? "/dashboard" : "/auth/signin"}
                    className="px-10 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg flex gap-3 items-center justify-center shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{isAuthenticated ? "לקן שלי" : "מתחילים להתארגן"}</span>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="px-10 py-4 rounded-[28px] bg-[#f3edff] text-[#21005d] font-medium text-lg flex gap-3 items-center justify-center hover:bg-[#eaddff] transition-colors"
                  >
                    <span>איך זה עובד?</span>
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative mt-8 lg:mt-0">
                <div className="relative mx-auto max-w-lg">
                  {/* Main image container with fancy styling */}
                  <div className="bg-[#f3edff] p-4 rounded-[48px] rounded-tl-[16px] shadow-[0_20px_60px_-15px_rgba(103,80,164,0.2)]">
                    <img
                      src={asset('Landing_Page_photo.png')}
                      alt="אמא עם תינוק"
                      className="w-full h-auto rounded-[36px] rounded-tl-[12px]"
                    />
                  </div>

                  {/* Floating badge - Families */}
                  <div className="absolute -bottom-4 -right-4 bg-white px-5 py-3 rounded-[20px] shadow-lg border border-[#e7e0ec] flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffd8e4] rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#31111d] fill-[#31111d]" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1d192b]">+2,000</p>
                      <p className="text-xs text-[#49454f]">משפחות מרוצות</p>
                    </div>
                  </div>

                  {/* Floating badge - Gifts */}
                  <div className="absolute -top-4 -left-4 bg-white px-5 py-3 rounded-[20px] shadow-lg border border-[#e7e0ec] flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f3edff] rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#6750a4]" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1d192b]">+5,000</p>
                      <p className="text-xs text-[#49454f]">מתנות נרכשו</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-6 bg-[#ffd8e4] text-[#31111d]">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">
                איך זה עובד?
              </h2>
              <p className="text-xl text-[#49454f] max-w-2xl mx-auto">
                שלושה צעדים פשוטים ואתם מוכנים לקבל את כל מה שאתם צריכים
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#f3edff] p-8 rounded-[40px] rounded-tl-[12px] hover:shadow-[0_20px_40px_-12px_rgba(103,80,164,0.15)] hover:-translate-y-1 transition-all duration-500 group">
                <div className="w-16 h-16 bg-[#6750a4] rounded-[20px] flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-bold text-[#6750a4] uppercase tracking-wider mb-2">שלב 1</div>
                <h3 className="text-2xl font-medium text-[#1d192b] mb-3">אוספים מכל מקום</h3>
                <p className="text-[#49454f] text-lg leading-relaxed">
                  השתמשו בצ'קליסט המובנה שלנו או הוסיפו מוצרים מכל חנות באינטרנט עם תוסף הכרום שלנו.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#ffd8e4] p-8 rounded-[12px] rounded-tl-[40px] rounded-br-[40px] hover:shadow-[0_20px_40px_-12px_rgba(255,216,228,0.5)] hover:-translate-y-1 transition-all duration-500 group">
                <div className="w-16 h-16 bg-[#31111d]/10 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Star className="w-8 h-8 text-[#31111d]" />
                </div>
                <div className="text-sm font-bold text-[#31111d]/60 uppercase tracking-wider mb-2">שלב 2</div>
                <h3 className="text-2xl font-medium text-[#31111d] mb-3">מסמנים את ה-Most Wanted</h3>
                <p className="text-[#31111d]/70 text-lg leading-relaxed">
                  סמנו את הפריטים שאתם באמת חייבים כדי שהמשפחה והחברים ידעו מה הכי חשוב לכם.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#f2f0f4] p-8 rounded-[48px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 group border border-white">
                <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                  <Send className="w-8 h-8 text-[#6750a4]" />
                </div>
                <div className="text-sm font-bold text-[#6750a4] uppercase tracking-wider mb-2">שלב 3</div>
                <h3 className="text-2xl font-medium text-[#1d192b] mb-3">נותנים להם לעזור</h3>
                <p className="text-[#49454f] text-lg leading-relaxed">
                  שתפו את הרשימה בוואטסאפ, במייל או בכל מקום אחר. קבלו התראות כשמישהו קונה מתנה.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Engine Section */}
        <section id="smart-engine" className="py-10 md:py-14 bg-[#fffbff]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div className="text-center lg:text-right">
                <span className="inline-block bg-[#eaddff] text-[#21005d] px-5 py-2 rounded-full mb-6 font-bold text-sm tracking-wide">
                  בקרוב
                </span>

                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6">
                  המנוע החכם ששומר לכם על הכיס
                </h2>

                <p className="text-xl text-[#49454f] mb-8 leading-relaxed">
                  הוסיפו מוצר לרשימה ואנחנו נחפש אותו בעשרות חנויות ברחבי ישראל. מצאנו מחיר טוב יותר? נשלח לכם התראה מיד!
                </p>

                <div className="flex justify-center lg:justify-start">
                  <ul className="space-y-4 text-right">
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f3edff] rounded-[14px] flex items-center justify-center flex-shrink-0">
                        <Bell className="w-6 h-6 text-[#6750a4]" />
                      </div>
                      <span className="text-lg text-[#1d192b]">התראות מחיר בזמן אמת</span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#d1fae5] rounded-[14px] flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-[#059669]" />
                      </div>
                      <span className="text-lg text-[#1d192b]">השוואת מחירים אוטומטית</span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-6 h-6 text-[#31111d]" />
                      </div>
                      <span className="text-lg text-[#1d192b]">חיסכון ממוצע של 15-30%</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Visual Card */}
              <div className="relative">
                <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 max-w-md mx-auto border border-[#e7e0ec]">
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={asset('anex IQ Image.webp')}
                      alt="עגלת Anex IQ"
                      className="w-20 h-20 rounded-[20px] object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-[#1d192b] text-lg mb-1">עגלת Anex IQ</h4>
                      <p className="text-[#49454f]">מצאנו מחיר טוב יותר!</p>
                    </div>
                  </div>

                  {/* Original Price */}
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-[16px] mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-[#49454f]">המחיר שלך</p>
                        <p className="font-bold text-[#1d192b] line-through">₪6,099</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#49454f]">Baby Store IL</p>
                  </div>

                  {/* Found Price */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-[16px] border-2 border-green-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-[#49454f]">מחיר שמצאנו</p>
                        <p className="font-bold text-[#1d192b]">₪5,500</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#49454f]">BabyShop</p>
                  </div>

                  {/* Savings Badge */}
                  <div className="mt-6 text-center">
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2.5 rounded-full font-bold">
                      <TrendingDown className="w-5 h-5" />
                      חיסכון של ₪599 (10%)
                    </span>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#eaddff]/50 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#ffd8e4]/40 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Chip-In Section */}
        <section id="chip-in" className="py-10 md:py-14 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Visual */}
              <div className="order-2 lg:order-1 relative">
                <div className="bg-[#f3edff] rounded-[40px] rounded-br-[12px] p-8 max-w-md mx-auto">
                  {/* Nanit image */}
                  <img
                    src={asset('Nanit.png')}
                    alt="Nanit"
                    className="w-40 h-40 rounded-[32px] object-cover mx-auto mb-6 shadow-lg"
                  />

                  <h4 className="text-2xl font-medium text-[#1d192b] text-center mb-2">
                    Nanit
                  </h4>
                  <p className="text-lg text-[#49454f] text-center mb-6">₪1,999</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#49454f]">התקדמות</span>
                      <span className="font-bold text-[#6750a4]">70%</span>
                    </div>
                    <div className="h-4 bg-[#eaddff] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6750a4] rounded-full"
                        style={{ width: '70%' }}
                      />
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-lg font-medium text-[#1d192b]">
                      נאספו <span className="text-[#6750a4] font-bold">₪1,399</span> מתוך ₪1,999
                    </p>
                  </div>

                  {/* Contributors */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex -space-x-2 space-x-reverse">
                      <div className="w-9 h-9 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-medium border-2 border-white">ד</div>
                      <div className="w-9 h-9 rounded-full bg-[#ffd8e4] text-[#31111d] flex items-center justify-center text-sm font-medium border-2 border-white">ש</div>
                      <div className="w-9 h-9 rounded-full bg-[#eaddff] text-[#21005d] flex items-center justify-center text-sm font-medium border-2 border-white">מ</div>
                      <div className="w-9 h-9 rounded-full bg-[#f2f0f4] text-[#49454f] flex items-center justify-center text-sm font-medium border-2 border-white">+2</div>
                    </div>
                    <span className="text-sm text-[#49454f]">5 תורמים</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 bg-[#ffd8e4] text-[#31111d] px-4 py-2 rounded-full font-medium">
                    <Users className="w-5 h-5" />
                    <span>Chip-In</span>
                  </div>
                  <span className="bg-[#eaddff] text-[#21005d] px-2 py-1 rounded-full text-xs font-bold">בקרוב</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6">
                  חולמים על עגלה יקרה? תנו להם להשתתף.
                </h2>

                <p className="text-xl text-[#49454f] mb-8 leading-relaxed">
                  יש מוצרים שהם פשוט יקרים מדי לאדם אחד. עם Chip-In, כולם יכולים לתרום סכום קטן למתנה הגדולה.
                </p>

                <div className="flex justify-center lg:justify-start">
                  <ul className="space-y-4 text-right">
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-[#31111d]" />
                      </div>
                      <span className="text-lg text-[#1d192b]">כל אחד נותן כמה שנוח לו</span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f3edff] rounded-[14px] flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-[#6750a4]" />
                      </div>
                      <span className="text-lg text-[#1d192b]">הסבא והסבתא, הדודים, החברים - כולם משתתפים</span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-[#31111d]" />
                      </div>
                      <span className="text-lg text-[#1d192b]">אתם מקבלים את מה שבאמת רציתם</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-10 md:py-14 bg-[#f2f0f4]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-6 bg-white text-[#6750a4] shadow-sm">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">
                הקן שלכם, החוקים שלכם.
              </h2>
              <p className="text-xl text-[#49454f] max-w-2xl mx-auto">
                אתם שולטים במה שמשתפים ומה נשאר פרטי
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Hide Items */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#f3edff] rounded-[18px] flex items-center justify-center mb-6">
                  <EyeOff className="w-7 h-7 text-[#6750a4]" />
                </div>
                <h3 className="text-2xl font-medium text-[#1d192b] mb-3">
                  הסתרת מוצרים
                </h3>
                <p className="text-lg text-[#49454f] leading-relaxed">
                  יש פריטים שאתם רוצים לקנות לבד? סמנו אותם כפרטיים והם יישארו מוסתרים מכל האורחים.
                </p>
              </div>

              {/* Hide Address */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#ffd8e4] rounded-[18px] flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-[#31111d]" />
                </div>
                <h3 className="text-2xl font-medium text-[#1d192b] mb-3">
                  הסתרת כתובת
                </h3>
                <p className="text-lg text-[#49454f] leading-relaxed">
                  לא רוצים שכולם יראו את הכתובת שלכם? הפעילו מצב פרטי ונותני המתנות יצרו איתכם קשר לפני המשלוח.
                </p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="text-[#1d192b] font-medium">המידע שלכם מאובטח ומוגן</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-10 md:py-14 bg-[#6750a4] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#ffd8e4]/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6 font-medium backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
              <span>חינם לגמרי</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 tracking-tight">
              מוכנים להתחיל לקנן?
            </h2>

            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
              הצטרפו לאלפי הורים שכבר בונים את הרשימה החכמה שלהם.
            </p>

            <Link
              to={isAuthenticated ? "/dashboard" : "/auth/signin"}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-[28px] bg-white text-[#6750a4] font-medium text-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isAuthenticated ? "לקן שלי" : "יצירת הרשימה הראשונה שלי"}</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-[#fffbff] border-t border-[#e7e0ec]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center mb-4">
                <img src={asset('logo.png')} alt="Nesty" className="h-12 w-auto" />
              </Link>
              <p className="text-[#49454f] max-w-sm">
                לבנות את הקן שלכם, חכם יותר. הרשימה שמאפשרת לכם לאסוף מוצרים מכל מקום ולשתף עם מי שאוהבים.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-[#1d192b] mb-4">קישורים</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#how-it-works" className="text-[#49454f] hover:text-[#6750a4] transition-colors">
                    איך זה עובד
                  </a>
                </li>
                <li>
                  <a href="#smart-engine" className="text-[#49454f] hover:text-[#6750a4] transition-colors">
                    המנוע החכם
                  </a>
                </li>
                <li>
                  <Link to={isAuthenticated ? "/dashboard" : "/auth/signin"} className="text-[#49454f] hover:text-[#6750a4] transition-colors">
                    {isAuthenticated ? "לקן שלי" : "כניסה"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-[#1d192b] mb-4">מידע</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-[#49454f] hover:text-[#6750a4] transition-colors">
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-[#49454f] hover:text-[#6750a4] transition-colors">
                    מדיניות פרטיות
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-[#49454f] hover:text-[#6750a4] transition-colors">
                    צור קשר
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#e7e0ec] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#49454f] text-sm">
              © {new Date().getFullYear()} Nesty. כל הזכויות שמורות.
            </p>
            <p className="text-[#49454f] text-sm flex items-center gap-1">
              נבנה עם <Heart className="w-4 h-4 text-[#ffd8e4] fill-[#ffd8e4]" /> בישראל
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
