import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { asset } from '../lib/assets'
// AnimatedNest removed per user feedback — using original image
import FadedIconsBackground from '../components/animations/FadedIconsBackground'
import WaveDivider from '../components/animations/WaveDivider'
import ParticleBackground from '../components/animations/ParticleBackground'
import ScrollReveal from '../components/animations/ScrollReveal'
import {
    Menu, X, Heart, Sparkles, ArrowLeft,
    ClipboardList, Star, Send, TrendingDown,
    Bell, CheckCircle, Users, Shield, Lock, EyeOff, Gift,
    Chrome, MousePointerClick, Zap, ShoppingBag, ExternalLink,
    ListChecks, Baby
} from 'lucide-react'

export default function HomeNew() {
    const { isAuthenticated } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#fffbff] text-[#1d192b] overflow-x-hidden" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#fffbff]/70 backdrop-blur-2xl border-b border-[#e7e0ec]/50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={asset('Nesty_logo.webp')} alt="Nesty" className="h-16 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#how-it-works" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">איך זה עובד</a>
                        <a href="#example-registry" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">דוגמה לרשימה</a>
                        <a href="#chrome-extension" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">תוסף לכרום</a>
                        <a href="#smart-engine" className="text-[#49454f] hover:text-[#6750a4] transition-colors font-medium">המנוע החכם</a>
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="px-6 py-2.5 rounded-full bg-[#6750a4] text-white font-medium hover:bg-[#5a4690] transition-colors shadow-[0_4px_12px_rgba(103,80,164,0.25)]">לקן שלי</Link>
                        ) : (
                            <>
                                <Link to="/auth/signin" className="px-5 py-2.5 rounded-full bg-[#f3edff] text-[#21005d] font-medium hover:bg-[#eaddff] transition-colors">כניסה</Link>
                                <Link to="/auth/signin" className="px-6 py-2.5 rounded-full bg-[#6750a4] text-white font-medium hover:bg-[#5a4690] transition-colors shadow-[0_4px_12px_rgba(103,80,164,0.25)]">יצירת רשימה חינם</Link>
                            </>
                        )}
                    </div>
                    <button className="md:hidden p-2 text-[#1d192b]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#fffbff] border-t border-[#e7e0ec] mt-4 py-4">
                        <div className="space-y-4">
                            <a href="#how-it-works" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>איך זה עובד</a>
                            <a href="#example-registry" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>דוגמה לרשימה</a>
                            <a href="#chrome-extension" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>תוסף לכרום</a>
                            <a href="#smart-engine" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>המנוע החכם</a>
                            <div className="pt-4 border-t border-[#e7e0ec] space-y-3">
                                {isAuthenticated ? (
                                    <Link to="/dashboard" className="block w-full text-center px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium">לקן שלי</Link>
                                ) : (
                                    <>
                                        <Link to="/auth/signin" className="block w-full text-center px-6 py-3 rounded-full bg-[#f3edff] text-[#21005d] font-medium">כניסה</Link>
                                        <Link to="/auth/signin" className="block w-full text-center px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium">יצירת רשימה חינם</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* ══════════ HERO SECTION ══════════ */}
                <section className="relative py-12 pb-32 md:py-20 md:pb-20 lg:py-24 overflow-x-clip">
                    {/* Animated gradient mesh background */}
                    <div className="absolute inset-0 -z-10 animate-gradient-mesh bg-gradient-to-br from-[#f3edff] via-[#fffbff] to-[#ffd8e4]/30 bg-[length:400%_400%]" />
                    <FadedIconsBackground count={20} />

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Text Content */}
                            <div className="text-center lg:text-right">
                                <div className="flex justify-center lg:justify-center mb-8 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                                    <img src={asset('Circle_logo.webp')} alt="Nesty" className="w-20 h-20 rounded-full shadow-lg" />
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 text-[#1d192b] tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                    לבנות את הקן שלכם,{' '}
                                    <span className="text-[#6750a4] relative inline-block">
                                        חכם יותר.
                                        <svg className="absolute w-full h-3 -bottom-1 right-0 text-[#eaddff] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                        </svg>
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-[#49454f] leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                    הרשימה היחידה שמאפשרת לכם לאסוף מוצרים מכל חנות בעולם, לשתף עם המשפחה והחברים, ולקבל התראות על מחירים טובים יותר.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                                    <Link
                                        to={isAuthenticated ? "/dashboard" : "/auth/signin"}
                                        className="group px-10 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg flex gap-3 items-center justify-center shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <Sparkles className="w-5 h-5 group-hover:animate-spin-slow" />
                                        <span>{isAuthenticated ? "לקן שלי" : "התחילי לבנות את הקן"}</span>
                                    </Link>
                                    <a href="#how-it-works" className="px-10 py-4 rounded-[28px] bg-[#f3edff] text-[#21005d] font-medium text-lg flex gap-3 items-center justify-center hover:bg-[#eaddff] transition-colors">
                                        <span>איך זה עובד?</span>
                                        <ArrowLeft className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Hero Image — original mom+baby photo with orbiting icons */}
                            <div className="relative mt-8 lg:mt-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <div className="relative mx-auto max-w-lg">
                                    {/* Main image container */}
                                    <div className="bg-[#f3edff] p-4 rounded-[48px] rounded-tl-[16px] shadow-[0_20px_60px_-15px_rgba(103,80,164,0.2)]">
                                        <img
                                            src={asset('Landing_Page_photo.webp')}
                                            alt="אמא עם תינוק"
                                            className="w-full h-auto rounded-[36px] rounded-tl-[12px]"
                                            fetchPriority="high"
                                        />
                                    </div>

                                    {/* Orbiting icons container — oversized so icons orbit OUTSIDE the image edges */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-75 md:scale-100" style={{ overflow: 'visible' }}>
                                        {/* Orbit ring 1 — Heart */}
                                        <div className="absolute animate-orbit-1" style={{ width: '160%', height: '155%' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <div className="animate-orbit-counter-1 w-20 h-20 bg-white/85 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-[#ffd8e4]/60">
                                                    <Heart className="w-10 h-10 text-[#f4acb7] fill-[#ffd8e4]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Orbit ring 2 — Gift */}
                                        <div className="absolute animate-orbit-2" style={{ width: '170%', height: '165%' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <div className="animate-orbit-counter-2 w-18 h-18 bg-white/85 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-[#eaddff]/60" style={{ width: '4.5rem', height: '4.5rem' }}>
                                                    <Gift className="w-9 h-9 text-[#6750a4]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Orbit ring 3 — Star */}
                                        <div className="absolute animate-orbit-3" style={{ width: '155%', height: '150%' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <div className="animate-orbit-counter-3 bg-white/85 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-[#ffd8e4]/60" style={{ width: '4.5rem', height: '4.5rem' }}>
                                                    <Star className="w-9 h-9 text-[#6750a4] fill-[#eaddff]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Orbit ring 4 — Baby */}
                                        <div className="absolute animate-orbit-4" style={{ width: '175%', height: '170%' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <div className="animate-orbit-counter-4 w-20 h-20 bg-white/85 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-[#ffd8e4]/60">
                                                    <Baby className="w-10 h-10 text-[#f4acb7]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Orbit ring 5 — Sparkles */}
                                        <div className="absolute animate-orbit-5" style={{ width: '162%', height: '158%' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <div className="animate-orbit-counter-5 w-16 h-16 bg-white/85 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-[#eaddff]/60">
                                                    <Sparkles className="w-8 h-8 text-[#6750a4]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#ffffff" bgColor="transparent" />

                {/* ══════════ HOW IT WORKS ══════════ */}
                <section id="how-it-works" className="py-10 md:py-14 bg-white relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-6 bg-[#ffd8e4] text-[#31111d]">
                                    <ClipboardList className="w-8 h-8" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">איך זה עובד?</h2>
                                <p className="text-xl text-[#49454f] max-w-2xl mx-auto">שלושה צעדים פשוטים ואתם מוכנים לקבל את כל מה שאתם צריכים</p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-8">
                            <ScrollReveal delay={0}>
                                <div className="bg-[#f3edff] p-8 rounded-[40px] rounded-tl-[12px] hover:shadow-[0_20px_40px_-12px_rgba(103,80,164,0.15)] hover:-translate-y-1 transition-all duration-500 group">
                                    <div className="w-16 h-16 bg-[#6750a4] rounded-[20px] flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform">
                                        <ClipboardList className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-sm font-bold text-[#6750a4] uppercase tracking-wider mb-2">שלב 1</div>
                                    <h3 className="text-2xl font-medium text-[#1d192b] mb-3">אוספים מכל מקום</h3>
                                    <p className="text-[#49454f] text-lg leading-relaxed">השתמשו בצ'קליסט המובנה שלנו או הוסיפו מוצרים מכל חנות באינטרנט עם תוסף הכרום שלנו.</p>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={150}>
                                <div className="bg-[#ffd8e4] p-8 rounded-[12px] rounded-tl-[40px] rounded-br-[40px] hover:shadow-[0_20px_40px_-12px_rgba(255,216,228,0.5)] hover:-translate-y-1 transition-all duration-500 group">
                                    <div className="w-16 h-16 bg-[#31111d]/10 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                                        <Star className="w-8 h-8 text-[#31111d]" />
                                    </div>
                                    <div className="text-sm font-bold text-[#31111d]/60 uppercase tracking-wider mb-2">שלב 2</div>
                                    <h3 className="text-2xl font-medium text-[#31111d] mb-3">מסמנים את ה-Most Wanted</h3>
                                    <p className="text-[#31111d]/70 text-lg leading-relaxed">סמנו את הפריטים שאתם באמת חייבים כדי שהמשפחה והחברים ידעו מה הכי חשוב לכם.</p>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={300}>
                                <div className="bg-[#f2f0f4] p-8 rounded-[48px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 group border border-white">
                                    <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                                        <Send className="w-8 h-8 text-[#6750a4]" />
                                    </div>
                                    <div className="text-sm font-bold text-[#6750a4] uppercase tracking-wider mb-2">שלב 3</div>
                                    <h3 className="text-2xl font-medium text-[#1d192b] mb-3">נותנים להם לעזור</h3>
                                    <p className="text-[#49454f] text-lg leading-relaxed">שתפו את הרשימה בוואטסאפ, במייל או בכל מקום אחר. קבלו התראות כשמישהו קונה מתנה.</p>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Checklist CTA */}
                        <ScrollReveal delay={200}>
                            <div className="mt-16 text-center">
                                <div className="bg-gradient-to-br from-[#ffd8e4] to-[#f3edff] rounded-[32px] p-8 md:p-12 max-w-3xl mx-auto">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-white text-[#6750a4] shadow-md">
                                        <ListChecks className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-medium text-[#1d192b] mb-4">לא לפספס שום דבר</h3>
                                    <p className="text-lg text-[#49454f] mb-8 max-w-xl mx-auto">הצ'קליסט המקיף שלנו מכיל את כל מה שתינוק צריך - מהדברים ההכרחיים ועד הפינוקים הקטנים. בנינו אותו עם מומחים כדי שתגיעו מוכנים.</p>
                                    <Link
                                        to={isAuthenticated ? "/checklist" : "/auth/signin"}
                                        className="inline-flex items-center gap-3 px-8 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <ListChecks className="w-5 h-5" />
                                        <span>לצ'קליסט המלא</span>
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#f3edff" bgColor="#ffffff" />

                {/* ══════════ CHROME EXTENSION ══════════ */}
                <section id="chrome-extension" className="py-10 md:py-14 bg-[#f3edff] relative overflow-hidden">
                    <FadedIconsBackground count={15} />
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <ScrollReveal>
                                <div className="text-center lg:text-right">
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6750a4] to-[#381e72] text-white px-4 py-2 rounded-full font-medium">
                                            <Chrome className="w-5 h-5" />
                                            <span>תוסף לכרום</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 bg-[#ffd600]/20 text-[#7c6f00] px-3 py-1 rounded-full text-xs font-bold">
                                            <Zap className="w-3 h-3 fill-current" />
                                            חינם
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6 px-2 lg:px-0">הוסיפו מוצרים בקליק אחד מכל אתר</h2>
                                    <p className="text-xl text-[#49454f] mb-8 leading-relaxed px-2 lg:px-0">עם התוסף שלנו לכרום, אתם יכולים להוסיף מוצרים לרשימה ישירות מכל אתר קניות באינטרנט - בלי להעתיק קישורים, בלי לעבור בין חלונות.</p>

                                    <div className="flex justify-center lg:justify-start px-2 lg:px-0">
                                        <div className="space-y-4 text-right w-full max-w-md lg:max-w-none">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm"><ShoppingBag className="w-6 h-6 text-[#6750a4]" /></div>
                                                <span className="text-lg text-[#1d192b]">גלשו באתר המועדף</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm"><MousePointerClick className="w-6 h-6 text-[#31111d]" /></div>
                                                <span className="text-lg text-[#1d192b]">לחצו על כפתור Nesty</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#d1fae5] rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm"><CheckCircle className="w-6 h-6 text-[#059669]" /></div>
                                                <span className="text-lg text-[#1d192b]">הפרטים מתמלאים אוטומטית!</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 px-2 lg:px-0">
                                        <a
                                            href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll"
                                            target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 px-8 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <Chrome className="w-5 h-5" />
                                            <span>התקינו את התוסף - חינם</span>
                                            <ExternalLink className="w-4 h-4 opacity-70" />
                                        </a>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Browser Mockup Visual */}
                            <ScrollReveal delay={200}>
                                <div className="relative px-2 lg:px-0">
                                    <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(103,80,164,0.2)] p-4 sm:p-6 max-w-md mx-auto border border-[#e7e0ec] relative overflow-hidden">
                                        <div className="bg-[#f2f0f4] rounded-t-[20px] -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 border-b border-[#e7e0ec]">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <div className="flex gap-1 sm:gap-1.5 flex-shrink-0">
                                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
                                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]" />
                                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
                                                </div>
                                                <div className="flex-1 bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-[#49454f] font-mono truncate mx-2 sm:mx-4 min-w-0">la-mer.co.il/products/lamer-x-soft</div>
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <img src={asset('Circle_logo.webp')} alt="Nesty" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex gap-3 sm:gap-4">
                                                <img src="https://la-mer.co.il/cdn/shop/files/9269e28d93ef21964decb2c1bc2a6722.jpg?v=1721649124&width=713" alt="מנשא בד La Mer" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] sm:text-xs text-[#49454f] mb-1">נמצא מוצר:</p>
                                                    <h4 className="font-bold text-[#1d192b] mb-1 leading-tight text-xs sm:text-sm md:text-base">מנשא בד La Mer X Soft</h4>
                                                    <p className="text-base sm:text-lg font-bold text-[#6750a4]">₪899</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#d1fae5] text-[#059669] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium">
                                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">הפרטים נשלפו אוטומטית!</span>
                                            </div>
                                            <button className="w-full py-2.5 sm:py-3 rounded-2xl bg-[#6750a4] text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2">
                                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                                הוסף לרשימה
                                            </button>
                                        </div>
                                        <div className="hidden md:flex absolute top-14 left-4 bg-[#ffd8e4] px-3 py-1.5 rounded-full shadow-lg text-sm font-bold text-[#31111d] items-center gap-1.5 animate-bounce whitespace-nowrap">
                                            <MousePointerClick className="w-4 h-4" />
                                            לחיצה אחת!
                                        </div>
                                    </div>
                                    <div className="hidden md:block absolute -top-6 -right-6 w-32 h-32 bg-[#eaddff]/50 rounded-full blur-2xl -z-10" />
                                    <div className="hidden md:block absolute -bottom-6 -left-6 w-40 h-40 bg-[#ffd8e4]/40 rounded-full blur-2xl -z-10" />
                                    <div className="hidden md:block absolute -bottom-8 right-4 bg-white px-5 py-3 rounded-[20px] shadow-lg border border-[#e7e0ec]">
                                        <p className="text-xs text-[#49454f] mb-1">עובד עם:</p>
                                        <p className="text-sm font-bold text-[#1d192b]">KSP, AliExpress, Amazon <span className="text-[#6750a4]">וכל אתר!</span></p>
                                    </div>
                                    <div className="md:hidden mt-4 text-center">
                                        <p className="text-sm text-[#49454f]">עובד עם: <span className="font-bold text-[#1d192b]">KSP, AliExpress, Amazon</span> <span className="text-[#6750a4] font-bold">וכל אתר!</span></p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        <ScrollReveal delay={100}>
                            <div className="mt-16 max-w-2xl mx-auto">
                                <div className="bg-[#fef7ff] border border-[#e7e0ec] rounded-[24px] p-6 text-center">
                                    <p className="text-[#49454f] mb-2">
                                        <span className="font-bold text-[#381e72]">לא רואים את הכפתור? </span>
                                        נסו ללחוץ על סמל הפאזל 🧩 בסרגל הדפדפן כדי להצמיד את התוסף.
                                    </p>
                                    <a href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#6750a4] font-semibold hover:underline">
                                        להתקנה <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#ffffff" bgColor="#f3edff" />

                {/* ══════════ REGISTRY EXAMPLE ══════════ */}
                <section id="example-registry" className="py-10 md:py-14 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-6 bg-[#f3edff] text-[#6750a4]">
                                    <Gift className="w-8 h-8" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">איך זה באמת נראה?</h2>
                                <p className="text-xl text-[#49454f] max-w-2xl mx-auto">הציצו ברשימה אמיתית - כמה קל וכיף לשתף את מה שאתם צריכים עם החברים והמשפחה</p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={100}>
                            <div className="flex justify-center h-[580px] sm:h-[670px] md:h-[760px] relative overflow-hidden">
                                <FadedIconsBackground count={12} />
                                <div className="relative scale-[0.65] sm:scale-[0.75] md:scale-[0.85] origin-top">
                                    <div className="relative bg-[#1d192b] rounded-[55px] p-3 shadow-2xl">
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-[#1d192b] rounded-full z-20" />
                                        <div className="relative bg-white rounded-[47px] overflow-hidden" style={{ width: '390px', height: '844px' }}>
                                            <div className="bg-white px-8 pt-14 pb-2 flex justify-between items-center text-sm font-semibold text-[#1d192b]">
                                                <span>9:41</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-3 border-2 border-[#1d192b] rounded-sm relative">
                                                        <div className="absolute inset-0.5 bg-[#1d192b] rounded-sm" style={{ width: '70%' }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-[#f5f5f5] mx-4 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                                <span className="text-sm text-[#49454f] font-medium">www.NestyIL.com</span>
                                            </div>
                                            <div className="overflow-y-auto overflow-x-hidden" style={{ height: '700px' }}>
                                                <img src={asset('IMG_80F37FA15505-1.webp')} alt="דוגמה לרשימת מתנות" className="w-full" style={{ width: '390px' }} loading="lazy" />
                                            </div>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2"><div className="w-32 h-1 bg-[#1d192b] rounded-full" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <div className="text-center">
                                <Link to={isAuthenticated ? "/dashboard" : "/auth/signin"} className="inline-flex items-center gap-3 px-8 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                                    <Sparkles className="w-5 h-5" />
                                    <span>{isAuthenticated ? "לקן שלי" : "יצירת הרשימה הראשונה שלי"}</span>
                                </Link>
                                <p className="mt-4 text-xl text-[#49454f]">זה בדיוק מה שהאורחים שלכם יראו 🎁</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#f2f0f4" bgColor="#ffffff" />

                {/* ══════════ PRIVACY ══════════ */}
                <section className="py-10 md:py-14 bg-[#f2f0f4] relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] mb-6 bg-white text-[#6750a4] shadow-sm">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">הקן שלכם, החוקים שלכם.</h2>
                                <p className="text-xl text-[#49454f] max-w-2xl mx-auto">אתם שולטים במה שמשתפים ומה נשאר פרטי</p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <ScrollReveal delay={0}>
                                <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-14 h-14 bg-[#f3edff] rounded-[18px] flex items-center justify-center mb-6"><EyeOff className="w-7 h-7 text-[#6750a4]" /></div>
                                    <h3 className="text-2xl font-medium text-[#1d192b] mb-3">הסתרת מוצרים</h3>
                                    <p className="text-lg text-[#49454f] leading-relaxed">יש פריטים שאתם רוצים לקנות לבד? סמנו אותם כפרטיים והם יישארו מוסתרים מכל האורחים.</p>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal delay={150}>
                                <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-14 h-14 bg-[#ffd8e4] rounded-[18px] flex items-center justify-center mb-6"><Lock className="w-7 h-7 text-[#31111d]" /></div>
                                    <h3 className="text-2xl font-medium text-[#1d192b] mb-3">הסתרת כתובת</h3>
                                    <p className="text-lg text-[#49454f] leading-relaxed">לא רוצים שכולם יראו את הכתובת שלכם? הפעילו מצב פרטי ונותני המתנות יצרו איתכם קשר לפני המשלוח.</p>
                                </div>
                            </ScrollReveal>
                        </div>

                        <ScrollReveal delay={200}>
                            <div className="mt-12 text-center">
                                <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm">
                                    <Shield className="w-6 h-6 text-green-600" />
                                    <span className="text-[#1d192b] font-medium">המידע שלכם מאובטח ומוגן</span>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#ffffff" bgColor="#f2f0f4" />

                {/* ══════════ COMING SOON & SMART ENGINE ══════════ */}
                <section className="py-10 md:py-14 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-12">
                                <span className="inline-block bg-[#eaddff] text-[#21005d] px-5 py-2 rounded-full mb-6 font-bold text-sm tracking-wide">בקרוב</span>
                                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">מה עוד מחכה לכם?</h2>
                                <p className="text-xl text-[#49454f] max-w-2xl mx-auto">פיצ'רים חדשים שאנחנו עובדים עליהם במיוחד בשבילכם</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ══════════ SMART ENGINE ══════════ */}
                <section id="smart-engine" className="py-10 md:py-14 bg-[#fffbff] relative overflow-hidden">
                    <FadedIconsBackground count={15} />
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <ScrollReveal>
                                <div className="text-center lg:text-right">
                                    <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6">המנוע החכם ששומר לכם על הכיס</h2>
                                    <p className="text-xl text-[#49454f] mb-8 leading-relaxed">הוסיפו מוצר לרשימה ואנחנו נחפש אותו בעשרות חנויות ברחבי ישראל. מצאנו מחיר טוב יותר? נשלח לכם התראה מיד!</p>
                                    <div className="flex justify-center lg:justify-start">
                                        <ul className="space-y-4 text-right">
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#f3edff] rounded-[14px] flex items-center justify-center flex-shrink-0"><Bell className="w-6 h-6 text-[#6750a4]" /></div>
                                                <span className="text-lg text-[#1d192b]">התראות מחיר בזמן אמת</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#d1fae5] rounded-[14px] flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-[#059669]" /></div>
                                                <span className="text-lg text-[#1d192b]">השוואת מחירים אוטומטית</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0"><TrendingDown className="w-6 h-6 text-[#31111d]" /></div>
                                                <span className="text-lg text-[#1d192b]">חיסכון ממוצע של 15-30%</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={200}>
                                <div className="relative">
                                    <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 max-w-md mx-auto border border-[#e7e0ec]">
                                        <div className="flex items-start gap-4 mb-6">
                                            <img src={asset('anex IQ Image.webp')} alt="עגלת Anex IQ" className="w-20 h-20 rounded-[20px] object-cover flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-[#1d192b] text-lg mb-1">עגלת Anex IQ</h4>
                                                <p className="text-[#49454f]">מצאנו מחיר טוב יותר!</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-[16px] mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><X className="w-5 h-5 text-red-500" /></div>
                                                <div><p className="text-sm text-[#49454f]">המחיר שלך</p><p className="font-bold text-[#1d192b] line-through">₪6,099</p></div>
                                            </div>
                                            <p className="text-sm text-[#49454f]">Baby Store IL</p>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-[16px] border-2 border-green-400">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                                <div><p className="text-sm text-[#49454f]">מחיר שמצאנו</p><p className="font-bold text-[#1d192b]">₪5,500</p></div>
                                            </div>
                                            <p className="text-sm text-[#49454f]">BabyShop</p>
                                        </div>
                                        <div className="mt-6 text-center">
                                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2.5 rounded-full font-bold">
                                                <TrendingDown className="w-5 h-5" />חיסכון של ₪599 (10%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#ffffff" bgColor="#fffbff" />

                {/* ══════════ CHIP-IN ══════════ */}
                <section id="chip-in" className="py-10 md:py-14 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <ScrollReveal delay={100}>
                                <div className="order-2 lg:order-1 relative">
                                    <div className="bg-[#f3edff] rounded-[40px] rounded-br-[12px] p-8 max-w-md mx-auto">
                                        <img src={asset('Nanit.webp')} alt="Nanit" className="w-40 h-40 rounded-[32px] object-cover mx-auto mb-6 shadow-lg" loading="lazy" />
                                        <h4 className="text-2xl font-medium text-[#1d192b] text-center mb-2">Nanit</h4>
                                        <p className="text-lg text-[#49454f] text-center mb-6">₪1,999</p>
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-[#49454f]">התקדמות</span>
                                                <span className="font-bold text-[#6750a4]">70%</span>
                                            </div>
                                            <div className="h-4 bg-[#eaddff] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#6750a4] rounded-full animate-progress-fill" style={{ width: '70%' }} />
                                            </div>
                                        </div>
                                        <div className="text-center mb-4">
                                            <p className="text-lg font-medium text-[#1d192b]">נאספו <span className="text-[#6750a4] font-bold">₪1,399</span> מתוך ₪1,999</p>
                                        </div>
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
                            </ScrollReveal>

                            <ScrollReveal>
                                <div className="order-1 lg:order-2 text-center lg:text-right">
                                    <div className="inline-flex items-center gap-2 mb-6">
                                        <div className="inline-flex items-center gap-2 bg-[#ffd8e4] text-[#31111d] px-4 py-2 rounded-full font-medium">
                                            <Users className="w-5 h-5" /><span>Chip-In</span>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6">חולמים על עגלה יקרה? תנו להם להשתתף.</h2>
                                    <p className="text-xl text-[#49454f] mb-8 leading-relaxed">יש מוצרים שהם פשוט יקרים מדי לאדם אחד. עם Chip-In, כולם יכולים לתרום סכום קטן למתנה הגדולה.</p>
                                    <div className="flex justify-center lg:justify-start">
                                        <ul className="space-y-4 text-right">
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0"><Gift className="w-6 h-6 text-[#31111d]" /></div>
                                                <span className="text-lg text-[#1d192b]">כל אחד נותן כמה שנוח לו</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#f3edff] rounded-[14px] flex items-center justify-center flex-shrink-0"><Users className="w-6 h-6 text-[#6750a4]" /></div>
                                                <span className="text-lg text-[#1d192b]">הסבא והסבתא, הדודים, החברים - כולם משתתפים</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0"><Heart className="w-6 h-6 text-[#31111d]" /></div>
                                                <span className="text-lg text-[#1d192b]">אתם מקבלים את מה שבאמת רציתם</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* ══════════ FINAL CTA ══════════ */}
                <section className="py-16 md:py-20 bg-[#6750a4] relative overflow-hidden">
                    <ParticleBackground count={15} />
                    <div className="absolute inset-0">
                        <div className="absolute top-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-orb-1" />
                        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#ffd8e4]/20 rounded-full blur-3xl animate-orb-2" />
                    </div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6 font-medium backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" /><span>חינם לגמרי</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 tracking-tight">מוכנים להתחיל לקנן?</h2>
                        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">הצטרפו לאלפי הורים שכבר בונים את הרשימה החכמה שלהם.</p>
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/auth/signin"}
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-[28px] bg-white text-[#6750a4] font-medium text-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300 animate-cta-glow"
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
                        <div className="col-span-2">
                            <Link to="/" className="flex items-center mb-4">
                                <img src={asset('logo.webp')} alt="Nesty" className="h-12 w-auto" loading="lazy" />
                            </Link>
                            <p className="text-[#49454f] max-w-sm">לבנות את הקן שלכם, חכם יותר. הרשימה שמאפשרת לכם לאסוף מוצרים מכל מקום ולשתף עם מי שאוהבים.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1d192b] mb-4">קישורים</h4>
                            <ul className="space-y-3">
                                <li><a href="#how-it-works" className="text-[#49454f] hover:text-[#6750a4] transition-colors">איך זה עובד</a></li>
                                <li><a href="#chrome-extension" className="text-[#49454f] hover:text-[#6750a4] transition-colors">תוסף לכרום</a></li>
                                <li><a href="#smart-engine" className="text-[#49454f] hover:text-[#6750a4] transition-colors">המנוע החכם</a></li>
                                <li><Link to={isAuthenticated ? "/dashboard" : "/auth/signin"} className="text-[#49454f] hover:text-[#6750a4] transition-colors">{isAuthenticated ? "לקן שלי" : "כניסה"}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1d192b] mb-4">מידע</h4>
                            <ul className="space-y-3">
                                <li><Link to="/terms" className="text-[#49454f] hover:text-[#6750a4] transition-colors">תנאי שימוש</Link></li>
                                <li><Link to="/privacy" className="text-[#49454f] hover:text-[#6750a4] transition-colors">מדיניות פרטיות</Link></li>
                                <li><Link to="/contact" className="text-[#49454f] hover:text-[#6750a4] transition-colors">צור קשר</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-[#e7e0ec] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[#49454f] text-sm">© {new Date().getFullYear()} Nesty. כל הזכויות שמורות.</p>
                        <p className="text-[#49454f] text-sm flex items-center gap-1">נבנה בישראל 🇮🇱</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
