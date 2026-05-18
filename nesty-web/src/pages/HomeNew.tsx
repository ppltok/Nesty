import { useState, useEffect, useRef } from 'react'
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
    Star, Send, TrendingDown,
    Bell, CheckCircle, Users, Shield, Lock, EyeOff, Gift,
    Chrome, MousePointerClick, Zap, ShoppingBag, ExternalLink,
    ListChecks, BookOpen, Compass, Sprout, Clock, AlertCircle
} from 'lucide-react'
import CategoryMarquee from '../components/animations/CategoryMarquee'
import AnnouncementBar from '../components/animations/AnnouncementBar'

export default function HomeNew() {
    const { isAuthenticated } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Live savings counter — starts at 4,500 and keeps ticking up
    const [savingsCount, setSavingsCount] = useState(4500)
    const savingsRef = useRef<HTMLDivElement>(null)
    const hasStarted = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted.current) {
                    hasStarted.current = true
                    const timer = setInterval(() => {
                        setSavingsCount(prev => prev + 5)
                    }, 1000)
                    return () => clearInterval(timer)
                }
            },
            { threshold: 0.3 }
        )
        if (savingsRef.current) observer.observe(savingsRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <div className="min-h-screen bg-[#fffbff] text-[#1d192b] overflow-x-clip" dir="rtl">
            {/* Sticky stack — announcement bar + header travel together so there's never a gap */}
            <div className="sticky top-0 z-[60]">
                <AnnouncementBar />
                <header className="bg-[#fffbff]/85 backdrop-blur-2xl border-b border-[#e7e0ec]/50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-16 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/guides"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f3edff] text-[#6750a4] hover:bg-[#eaddff] transition-colors font-bold border border-[#eaddff]"
                        >
                            <BookOpen className="w-4 h-4" />
                            מדריכים
                        </Link>
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
                                <Link to="/auth/signup" className="px-6 py-2.5 rounded-full bg-[#6750a4] text-white font-medium hover:bg-[#5a4690] transition-colors shadow-[0_4px_12px_rgba(103,80,164,0.25)]">יצירת רשימה חינם</Link>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        className="md:hidden p-2 text-[#1d192b]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#fffbff] border-t border-[#e7e0ec] mt-4 py-4">
                        <div className="space-y-4">
                            <a href="#how-it-works" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>איך זה עובד</a>
                            <a href="#example-registry" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>דוגמה לרשימה</a>
                            <a href="#chrome-extension" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>תוסף לכרום</a>
                            <a href="#smart-engine" className="block text-[#49454f] hover:text-[#6750a4] font-medium" onClick={() => setIsMobileMenuOpen(false)}>המנוע החכם</a>
                            <Link
                                to="/guides"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f3edff] text-[#6750a4] hover:bg-[#eaddff] font-bold border border-[#eaddff] w-fit"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <BookOpen className="w-4 h-4" />
                                מדריכים
                            </Link>
                            <div className="pt-4 border-t border-[#e7e0ec] space-y-3">
                                {isAuthenticated ? (
                                    <Link to="/dashboard" className="block w-full text-center px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium">לקן שלי</Link>
                                ) : (
                                    <>
                                        <Link to="/auth/signin" className="block w-full text-center px-6 py-3 rounded-full bg-[#f3edff] text-[#21005d] font-medium">כניסה</Link>
                                        <Link to="/auth/signup" className="block w-full text-center px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium">יצירת רשימה חינם</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </header>
            </div>

            <main>
                {/* ══════════ HERO SECTION ══════════ */}
                <section className="relative py-12 pb-32 md:py-20 md:pb-20 lg:py-24 overflow-x-clip">
                    {/* Animated gradient mesh background */}
                    <div className="absolute inset-0 -z-10 animate-gradient-mesh bg-gradient-to-br from-[#f3edff] via-[#fffbff] to-[#ffd8e4]/30 bg-[length:400%_400%]" />
                    <FadedIconsBackground count={50} />

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Text Content */}
                            <div className="text-center lg:text-right">
                                <div className="flex justify-center lg:justify-center mb-8 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                                    <img src={asset('Circle_logo.png')} alt="Nesty" className="w-20 h-20 rounded-full shadow-lg" />
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 text-[#1d192b] tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                    את לא צריכה{' '}
                                    <span className="text-[#6750a4] relative inline-block">
                                        לעשות את זה לבד.
                                        <svg className="absolute w-full h-3 -bottom-1 right-0 text-[#eaddff] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                        </svg>
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-[#49454f] leading-relaxed mb-4 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                    ההכנה לתינוק יכולה להרגיש מבלבלת.<br /><bdi>Nesty</bdi> פה כמו אחות גדולה שכבר עברה את זה
                                </p>
                                <p className="text-lg md:text-xl text-[#49454f]/80 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                                    הרשימה היחידה שמאפשרת לכם לאסוף מוצרים מכל חנות בעולם, לשתף עם המשפחה והחברים, ולקבל התראות על מחירים טובים יותר.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                                    <Link
                                        to={isAuthenticated ? "/dashboard" : "/auth/signup"}
                                        className="group px-10 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg flex gap-3 items-center justify-center shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span>{isAuthenticated ? "לקן שלי" : "התחילי לבנות את הקן"}</span>
                                    </Link>
                                    <a href="#how-it-works" className="px-10 py-4 rounded-[28px] bg-[#f3edff] text-[#21005d] font-medium text-lg flex gap-3 items-center justify-center hover:bg-[#eaddff] transition-colors">
                                        <span>איך זה עובד?</span>
                                        <ArrowLeft className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Hero Image — clean photo, brand headline burned in */}
                            <div className="relative mt-8 lg:mt-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <div className="relative mx-auto max-w-lg">
                                    <img
                                        src={asset('home/landing-hero.png')}
                                        alt="בונים קן, לא מחסן — רשימת לידה אחת מכל החנויות בעולם"
                                        className="w-full h-auto rounded-[36px] shadow-[0_20px_60px_-15px_rgba(103,80,164,0.2)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Wave Divider */}
                <WaveDivider color="#ffffff" bgColor="transparent" />

                {/* ══════════ HOW IT WORKS ══════════ */}
                <section id="how-it-works" className="pt-2 pb-16 md:pt-4 md:pb-24 bg-gradient-to-b from-white via-[#fffbff] to-white relative overflow-hidden scroll-mt-24">
                    {/* Soft brand-color blobs in the background for depth */}
                    <div aria-hidden className="absolute -top-24 -end-24 w-96 h-96 rounded-full bg-[#f3edff]/50 blur-3xl pointer-events-none" />
                    <div aria-hidden className="absolute top-1/2 -start-32 w-96 h-96 rounded-full bg-[#ffd8e4]/40 blur-3xl pointer-events-none" />

                    <div className="max-w-6xl mx-auto px-6 relative">
                        <ScrollReveal>
                            <div className="text-center mb-12 md:mb-16">
                                <span className="inline-flex items-center gap-2 bg-[#f3edff] text-[#6750a4] px-4 py-1.5 rounded-full font-bold text-sm mb-5">
                                    <Compass className="w-4 h-4" />
                                    איך זה עובד
                                </span>
                                <h2 className="text-4xl md:text-6xl font-medium text-[#1d192b] tracking-tight mb-4 leading-[1.05]">
                                    ככה בונים את הקן —
                                    <br />
                                    <span className="text-[#6750a4]">בשלושה צעדים</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-[#49454f] max-w-2xl mx-auto leading-relaxed">
                                    בלי מדריכים ארוכים, בלי לחץ. שלוש דקות לכל צעד.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Step cards — equal size, real component mockups (checklist row, recommended product card, registry item card) */}
                        <div className="relative space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">

                            {/* Step 1 — RIGHT (Hebrew first) — Real Checklist row mockup */}
                            <ScrollReveal delay={0}>
                                <div className="group relative bg-white rounded-[36px] border border-[#eaddff] shadow-[0_12px_32px_-12px_rgba(103,80,164,0.12)] hover:shadow-[0_24px_48px_-16px_rgba(103,80,164,0.25)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden h-full flex flex-col">
                                    {/* Floating number badge */}
                                    <div className="absolute top-5 left-5 z-10">
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-[#6750a4] to-[#5a4690] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6750a4]/30 group-hover:rotate-[-6deg] transition-transform">
                                            <span className="text-2xl font-bold text-white">1</span>
                                        </div>
                                    </div>

                                    {/* Real Checklist mockup — same row design as the actual /checklist page */}
                                    <div className="bg-gradient-to-b from-[#f3edff]/50 to-transparent px-6 pt-8 pb-5 min-h-[280px] flex items-center justify-center" dir="rtl">
                                        <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0ec] w-full max-w-[280px] overflow-hidden">
                                            {/* Category header (matches Checklist.tsx category collapse button) */}
                                            <div className="px-3 py-2.5 border-b border-[#e7e0ec]/60 bg-[#f9f8fc]">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm text-[#1d192b]">עגלות וטיולים</span>
                                                    <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] px-1.5 py-0.5 rounded-full font-semibold">2/3</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden max-w-[200px]">
                                                        <div className="h-full rounded-full bg-[#6750a4]" style={{ width: '66%' }} />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Item rows — exact replica of Checklist row layout */}
                                            <div className="divide-y divide-[#e7e0ec]/40">
                                                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f9f8fc]">
                                                    <div className="w-6 h-6 rounded-lg border-2 border-[#6750a4] bg-[#6750a4] text-white flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                                                    </div>
                                                    <span className="flex-1 text-sm font-medium text-[#49454f]/60 line-through truncate">עגלה לתינוק</span>
                                                    <span className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-2 py-0.5 rounded-full text-[10px] font-bold">חובה</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f9f8fc]">
                                                    <div className="w-6 h-6 rounded-lg border-2 border-[#6750a4] bg-[#6750a4] text-white flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                                                    </div>
                                                    <span className="flex-1 text-sm font-medium text-[#49454f]/60 line-through truncate">מנשא לתינוק</span>
                                                    <span className="bg-[#f5f5f5] text-[#9e9e9e] border border-[#e0e0e0] px-2 py-0.5 rounded-full text-[10px] font-bold">פינוק</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-2.5">
                                                    <div className="w-6 h-6 rounded-lg border-2 border-[#d0d0d0] bg-white flex-shrink-0" />
                                                    <span className="flex-1 text-sm font-medium text-[#1d192b] truncate">תיק החתלה</span>
                                                    <span className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-2 py-0.5 rounded-full text-[10px] font-bold">חובה</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-7 pb-8 pt-2 flex-1 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ListChecks className="w-5 h-5 text-[#6750a4]" />
                                            <h3 className="text-xl md:text-2xl font-bold text-[#1d192b]">מתחילות מהצ'קליסט</h3>
                                        </div>
                                        <p className="text-[#49454f] leading-relaxed">
                                            מסמנות ✓ על מה שצריך, מסירות מה שלא, מעדכנות כמויות. הצ'קליסט בנוי עם מומחים — את לא בונה אותו מאפס.
                                        </p>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Step 2 — CENTER — Real recommended product card (Anex IQ Pro) */}
                            <ScrollReveal delay={150}>
                                <div className="group relative bg-gradient-to-br from-[#ffd8e4]/40 via-white to-[#f3edff]/40 rounded-[36px] border-2 border-[#f4acb7]/60 shadow-[0_12px_32px_-12px_rgba(244,172,183,0.3)] hover:shadow-[0_24px_48px_-16px_rgba(244,172,183,0.5)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden h-full flex flex-col">
                                    {/* Highlighted ribbon */}
                                    <div className="absolute top-5 right-5 z-10">
                                        <span className="inline-flex items-center gap-1 bg-[#1d192b] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3 text-[#ffd600]" />
                                            הקסם
                                        </span>
                                    </div>
                                    {/* Floating number badge */}
                                    <div className="absolute top-5 left-5 z-10">
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-[#f4acb7] to-[#e89aa6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f4acb7]/40 group-hover:rotate-[6deg] transition-transform">
                                            <span className="text-2xl font-bold text-white">2</span>
                                        </div>
                                    </div>

                                    {/* Real "מוצרים מומלצים" card from the actual Checklist */}
                                    <div className="px-6 pt-8 pb-5 min-h-[280px] flex flex-col items-center justify-center" dir="rtl">
                                        {/* "מוצרים מומלצים" green banner — exact match to Checklist.tsx line 994 */}
                                        <div className="w-full max-w-[280px] flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-l from-[#e8f5e9] to-[#f1f8e9] ring-1 ring-[#a5d6a7]/60 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-[#2e7d32] text-white flex items-center justify-center">
                                                    <ShoppingBag className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-[#2e7d32]">מוצרים מומלצים</p>
                                                    <p className="text-[10px] text-[#66bb6a]">3 מוצרים נבחרו עבורך</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Real product card — matches Checklist.tsx line 1023 */}
                                        <div className="w-full max-w-[200px] bg-white rounded-xl border border-[#e7e0ec] p-2.5 shadow-sm">
                                            <img
                                                src="https://www.baby-star.co.il/cdn/shop/files/medium-AnexIQ_Darke_2.webp?v=1768127011&width=600"
                                                alt="Anex IQ Pro"
                                                className="w-full h-28 object-contain rounded-lg mb-2 bg-[#f5f5f5]"
                                                loading="lazy"
                                            />
                                            <p className="text-xs font-semibold text-[#1d192b] mb-0.5 leading-tight line-clamp-2">Anex IQ Pro</p>
                                            <p className="text-[10px] text-[#49454f] mb-1">בייבי סטאר</p>
                                            <p className="text-sm font-bold text-[#2e7d32] mb-2">₪6,099</p>
                                            <div className="flex gap-1.5">
                                                <span className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#f5f5f5] text-[#49454f] text-[10px] font-medium">
                                                    <ExternalLink className="w-3 h-3" />
                                                    לחנות
                                                </span>
                                                <span className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#6750a4] text-white text-[10px] font-medium">
                                                    <Sparkles className="w-3 h-3" />
                                                    הוסף
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-[10px] text-[#79747e] text-center">* התמונה להמחשה בלבד</p>
                                    </div>

                                    {/* Content */}
                                    <div className="px-7 pb-8 pt-2 flex-1 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShoppingBag className="w-5 h-5 text-[#6750a4]" />
                                            <h3 className="text-xl md:text-2xl font-bold text-[#1d192b]">מוסיפות פריטים בקליק</h3>
                                        </div>
                                        <p className="text-[#49454f] leading-relaxed">
                                            לכל פריט בצ'קליסט יש מוצרים מומלצים — בוחרים, לוחצים "הוסף", והוא ברשימה. או גוררים קישור מכל חנות אחרת.
                                        </p>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Step 3 — LEFT — Real Registry public-view item card */}
                            <ScrollReveal delay={300}>
                                <div className="group relative bg-white rounded-[36px] border border-[#eaddff] shadow-[0_12px_32px_-12px_rgba(103,80,164,0.12)] hover:shadow-[0_24px_48px_-16px_rgba(103,80,164,0.25)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden h-full flex flex-col">
                                    {/* Floating number badge */}
                                    <div className="absolute top-5 left-5 z-10">
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-[#6750a4] to-[#5a4690] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6750a4]/30 group-hover:rotate-[-6deg] transition-transform">
                                            <span className="text-2xl font-bold text-white">3</span>
                                        </div>
                                    </div>

                                    {/* Real Registry ItemCard — what guests see at the shared URL */}
                                    <div className="bg-gradient-to-b from-[#d1fae5]/20 to-transparent px-6 pt-8 pb-5 min-h-[280px] flex flex-col items-center justify-center" dir="rtl">
                                        <div className="w-full max-w-[240px] bg-white rounded-[24px] rounded-tr-[4px] border border-[#e7e0ec] overflow-hidden shadow-sm">
                                            {/* Image */}
                                            <div className="aspect-[4/3] bg-[#f5f5f5] relative overflow-hidden">
                                                <img
                                                    src={asset('Nanit.png')}
                                                    alt="מוניטור Nanit Pro"
                                                    className="w-full h-full object-contain p-2"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-2 right-2 bg-[#b3261e] text-white px-2 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm">
                                                    <Star className="w-2.5 h-2.5 fill-current" />
                                                    הכי רוצה!
                                                </div>
                                            </div>
                                            {/* Content */}
                                            <div className="p-3">
                                                <p className="text-[9px] font-bold text-[#6750a4] uppercase mb-1 tracking-wide">מוניטורים</p>
                                                <h3 className="font-bold text-[#1d192b] text-sm leading-snug mb-2 line-clamp-1">Nanit Pro</h3>
                                                <div className="flex items-end justify-between pt-2 border-t border-[#e7e0ec]/60">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-[#49454f]">מחיר משוער</span>
                                                        <span className="font-bold text-[#1d192b] text-sm">₪1,999</span>
                                                    </div>
                                                    <span className="bg-[#6750a4] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                                        <Gift className="w-3 h-3" />
                                                        קנה מתנה
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-[10px] text-[#79747e] text-center w-full">* התמונה להמחשה בלבד</p>
                                    </div>

                                    {/* Content */}
                                    <div className="px-7 pb-8 pt-2 flex-1 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Send className="w-5 h-5 text-[#6750a4]" />
                                            <h3 className="text-xl md:text-2xl font-bold text-[#1d192b]">משתפות עם המשפחה</h3>
                                        </div>
                                        <p className="text-[#49454f] leading-relaxed">
                                            קישור אחד בוואטסאפ — והם רואים בדיוק את זה. ככה הם בוחרים מתנה ומסמנים שקנו, בלי כפילויות.
                                        </p>
                                    </div>
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
                                        to={isAuthenticated ? "/checklist" : "/auth/signup"}
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

                {/* Category marquee — narrow scrolling divider */}
                <CategoryMarquee />

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
                                <FadedIconsBackground count={30} />
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
                                            <div className="overflow-y-auto overflow-x-hidden" style={{ height: '700px' }} tabIndex={0} role="region" aria-label="תצוגה מקדימה של רשימת מתנות">
                                                <img src={asset('IMG_80F37FA15505-1.jpeg')} alt="דוגמה לרשימת מתנות" className="w-full" style={{ width: '390px' }} loading="lazy" />
                                            </div>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2"><div className="w-32 h-1 bg-[#1d192b] rounded-full" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <div className="text-center">
                                <Link to={isAuthenticated ? "/dashboard" : "/auth/signup"} className="inline-flex items-center gap-3 px-8 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg shadow-[0_8px_16px_rgba(103,80,164,0.25)] hover:shadow-[0_12px_24px_rgba(103,80,164,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                                    <Heart className="w-5 h-5 fill-current" />
                                    <span>{isAuthenticated ? "לקן שלי" : "יצירת הרשימה הראשונה שלי"}</span>
                                </Link>
                                <p className="mt-4 text-xl text-[#49454f]">זה בדיוק מה שהאורחים שלכם יראו 🎁</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ══════════ PRICE ALERTS (LIVE!) ══════════ */}
                <section className="py-10 md:py-14 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-12">
                                <span className="inline-block bg-[#d1fae5] text-[#065f46] px-5 py-2 rounded-full mb-6 font-bold text-sm tracking-wide">חדש! ✨</span>
                                <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-4">חוסכים לכם כסף, אוטומטית</h2>
                                <p className="text-xl text-[#49454f] max-w-2xl mx-auto"><bdi>Nesty</bdi> עוקבת אחרי המחירים של המוצרים ברשימה שלכם ומתריעה כשיש ירידת מחיר</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ══════════ SMART ENGINE ══════════ */}
                <section id="smart-engine" className="py-10 md:py-14 bg-[#fffbff] relative overflow-hidden scroll-mt-24">
                    <FadedIconsBackground count={40} />
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <ScrollReveal>
                                <div className="text-center lg:text-right">
                                    <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6">אנחנו עוקבות אחרי המחירים בשבילכם</h2>
                                    <p className="text-xl text-[#49454f] mb-8 leading-relaxed">הוסיפו מוצר לרשימה ותשכחו מזה. <bdi>Nesty</bdi> בודקת כל יום אם המחיר ירד — ואם כן, שולחת לכם הודעה. ככה חוסכים בלי מאמץ.</p>
                                    <div className="flex justify-center lg:justify-start">
                                        <ul className="space-y-4 text-right">
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#f3edff] rounded-[14px] flex items-center justify-center flex-shrink-0"><Bell className="w-6 h-6 text-[#6750a4]" /></div>
                                                <span className="text-lg text-[#1d192b]">התראות מחיר בזמן אמת</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#d1fae5] rounded-[14px] flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-[#059669]" /></div>
                                                <span className="text-lg text-[#1d192b]">מעקב יומי אחרי ירידות מחיר</span>
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
                                    <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-md mx-auto border border-[#e7e0ec] overflow-hidden">
                                        {/* Urgency banner */}
                                        <div className="bg-gradient-to-l from-[#fee2e2] via-[#fecaca] to-[#fee2e2] px-5 py-2.5 flex items-center justify-between border-b border-red-200">
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                                                </span>
                                                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">התראת מחיר</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-semibold text-red-700">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>עודכן לפני שעתיים</span>
                                            </div>
                                        </div>

                                        <div className="p-7">
                                            <div className="flex items-start gap-4 mb-5">
                                                <img src={asset('anex IQ Image.webp')} alt="עגלת Anex IQ" className="w-20 h-20 rounded-[20px] object-cover flex-shrink-0" />
                                                <div>
                                                    <h3 className="font-bold text-[#1d192b] text-lg mb-1">עגלת Anex IQ</h3>
                                                    <p className="text-[#49454f] flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />המחיר ירד — אולי זה רגע טוב לקנות!</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-[16px] mb-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><X className="w-5 h-5 text-red-500" /></div>
                                                <div><p className="text-sm text-[#49454f]">מחיר קודם</p><p className="font-bold text-[#1d192b] line-through">₪6,099</p></div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-[16px] border-2 border-green-400 relative">
                                                <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">עכשיו!</div>
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                                <div><p className="text-sm text-[#49454f]">המחיר עכשיו</p><p className="font-bold text-[#1d192b]">₪5,500</p></div>
                                            </div>
                                            <div className="mt-6 text-center">
                                                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2.5 rounded-full font-bold">
                                                    <TrendingDown className="w-5 h-5" />חיסכון של ₪599 (10%)
                                                </span>
                                                <p className="mt-3 text-xs text-[#79747e]">* התמונה להמחשה בלבד</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Wave Divider — smart engine fffbff → chrome-ext lavender */}
                <WaveDivider color="#f3edff" bgColor="#fffbff" />

                {/* ══════════ CHROME EXTENSION ══════════ */}
                <section id="chrome-extension" className="py-10 md:py-14 bg-[#f3edff] relative overflow-hidden scroll-mt-24">
                    <FadedIconsBackground count={40} />
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
                                                <span className="text-lg text-[#1d192b]">לחצו על כפתור <bdi>Nesty</bdi></span>
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
                                                    <img src={asset('Circle_logo.png')} alt="Nesty" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex gap-3 sm:gap-4">
                                                <img src="https://la-mer.co.il/cdn/shop/files/9269e28d93ef21964decb2c1bc2a6722.jpg?v=1721649124&width=713" alt="מנשא בד La Mer" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] sm:text-xs text-[#49454f] mb-1">נמצא מוצר:</p>
                                                    <h3 className="font-bold text-[#1d192b] mb-1 leading-tight text-xs sm:text-sm md:text-base">מנשא בד La Mer X Soft</h3>
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

                {/* Wave Divider — chrome-ext lavender → privacy grey */}
                <WaveDivider color="#f2f0f4" bgColor="#f3edff" />

                {/* ══════════ PRIVACY ══════════ */}
                <section className="py-10 md:py-14 bg-[#f2f0f4] relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <ScrollReveal>
                            <img
                                src={asset('home/privacy-hero.png')}
                                alt="הקן שלכם, החוקים שלכם — את שולטת במה שמשותף ומה נשאר רק שלך"
                                className="w-full h-auto rounded-[32px] shadow-[0_20px_60px_-15px_rgba(103,80,164,0.18)] mb-12"
                                loading="lazy"
                            />
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

                {/* ══════════ CO-PARENT SHARING ══════════ */}
                <section className="py-10 md:py-14 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <ScrollReveal>
                                <div className="text-center lg:text-right">
                                    <div className="inline-flex items-center gap-2 mb-6">
                                        <div className="inline-flex items-center gap-2 bg-[#f3edff] text-[#6750a4] px-4 py-2 rounded-full font-medium">
                                            <Users className="w-5 h-5" />
                                            <span>ניהול משותף</span>
                                        </div>
                                        <span className="bg-[#d1fae5] text-[#065f46] px-3 py-1 rounded-full text-xs font-bold">חדש!</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight mb-6">להכין את הקן ביחד, כמו שצריך.</h2>
                                    <p className="text-xl text-[#49454f] mb-8 leading-relaxed">ההכנה לתינוק היא מסע של שניים. עכשיו שניכם יכולים לנהל את הרשימה, הצ'קליסט והמתנות — מכל מקום, בכל רגע.</p>
                                    <div className="flex justify-center lg:justify-start">
                                        <ul className="space-y-4 text-right">
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#f3edff] rounded-[14px] flex items-center justify-center flex-shrink-0"><Heart className="w-6 h-6 text-[#6750a4]" /></div>
                                                <span className="text-lg text-[#1d192b]">הזמנה בקליק אחד מההגדרות</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#ffd8e4] rounded-[14px] flex items-center justify-center flex-shrink-0"><Users className="w-6 h-6 text-[#31111d]" /></div>
                                                <span className="text-lg text-[#1d192b]">שניכם רואים, עורכים ומוסיפים</span>
                                            </li>
                                            <li className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#d1fae5] rounded-[14px] flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-[#059669]" /></div>
                                                <span className="text-lg text-[#1d192b]">צ'קליסט, מתנות והכל — משותף</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={200}>
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-[#f3edff] to-[#ffd8e4]/30 rounded-[40px] p-8 max-w-md mx-auto">
                                        <div className="bg-white rounded-[24px] p-6 shadow-lg mb-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-[#6750a4] rounded-full flex items-center justify-center text-white font-bold">ת</div>
                                                <div className="w-10 h-10 bg-[#ffd8e4] rounded-full flex items-center justify-center text-[#31111d] font-bold">ק</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-[#1d192b]">הרשימה של תם וקרן</p>
                                                    <p className="text-xs text-[#49454f]">משותף 💜</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-[#f9f7fc] rounded-[14px]">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <span className="text-sm text-[#1d192b]">עגלה — Anex IQ</span>
                                                    <span className="mr-auto text-xs text-[#49454f]">תם הוסיף</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-[#f9f7fc] rounded-[14px]">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <span className="text-sm text-[#1d192b]">מוניטור — Nanit</span>
                                                    <span className="mr-auto text-xs text-[#49454f]">קרן הוסיפה</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-[#ffd8e4]/30 rounded-[14px]">
                                                    <Star className="w-5 h-5 text-[#6750a4] fill-[#eaddff]" />
                                                    <span className="text-sm text-[#1d192b] font-medium">כיסא בטיחות — Cybex</span>
                                                    <span className="mr-auto text-xs bg-[#6750a4] text-white px-2 py-0.5 rounded-full">Most Wanted</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* ══════════ SOCIAL PROOF ══════════ */}
                <section className="py-12 md:py-16 bg-white">
                    <div className="max-w-5xl mx-auto px-6">
                        <ScrollReveal>
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-medium text-[#1d192b] tracking-tight mb-3">הורים שכבר בונים את הקן שלהם</h2>
                                <p className="text-lg text-[#49454f]">ומצטרפים עוד כל יום</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={100}>
                            <div ref={savingsRef} className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                                <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#059669] to-[#10b981] rounded-[24px] p-6 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%221%22%20fill%3D%22white%22%20opacity%3D%220.1%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
                                    <div className="relative">
                                        <TrendingDown className="w-6 h-6 text-white/70 mx-auto mb-2" />
                                        <p className="text-3xl md:text-4xl font-bold text-white mb-1" dir="ltr">₪{savingsCount.toLocaleString()}+</p>
                                        <p className="text-xs text-white/80">נחסכו להורים שלנו</p>
                                    </div>
                                </div>
                                <div className="bg-[#f3edff] rounded-[24px] p-6 text-center">
                                    <p className="text-4xl font-bold text-[#6750a4] mb-1">200+</p>
                                    <p className="text-sm text-[#49454f]">הורים מאושרים</p>
                                </div>
                                <div className="bg-[#ffd8e4]/40 rounded-[24px] p-6 text-center">
                                    <p className="text-4xl font-bold text-[#31111d] mb-1">50+</p>
                                    <p className="text-sm text-[#49454f]">חנויות נתמכות</p>
                                </div>
                                <div className="bg-[#d1fae5]/40 rounded-[24px] p-6 text-center">
                                    <p className="text-4xl font-bold text-[#059669] mb-1">500+</p>
                                    <p className="text-sm text-[#49454f]">מוצרים ברשימות</p>
                                </div>
                                <div className="bg-[#f3edff] rounded-[24px] p-6 text-center">
                                    <p className="text-4xl font-bold text-[#6750a4] mb-1">100%</p>
                                    <p className="text-sm text-[#49454f]">חינם, לתמיד</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ══════════ CHIP-IN ══════════ */}
                <section id="chip-in" className="py-10 md:py-14 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <ScrollReveal delay={100}>
                                <div className="order-2 lg:order-1 relative">
                                    <div className="bg-[#f3edff] rounded-[40px] rounded-br-[12px] p-8 max-w-md mx-auto">
                                        <img src={asset('Nanit.png')} alt="Nanit" className="w-40 h-40 rounded-[32px] object-cover mx-auto mb-6 shadow-lg" />
                                        <h3 className="text-2xl font-medium text-[#1d192b] text-center mb-2">Nanit</h3>
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
                                        <span className="bg-[#eaddff] text-[#21005d] px-3 py-1 rounded-full text-xs font-bold">בקרוב</span>
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
                    <ParticleBackground count={35} />
                    <div className="absolute inset-0">
                        <div className="absolute top-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-orb-1" />
                        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#ffd8e4]/20 rounded-full blur-3xl animate-orb-2" />
                    </div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white text-[#6750a4] px-4 py-2 rounded-full mb-6 font-semibold">
                            <Gift className="w-5 h-5" /><span>חינם לגמרי</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 tracking-tight">הקן שלכם מחכה.</h2>
                        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">את לא צריכה עוד רשימה בוואטסאפ. את צריכה מקום אחד, חכם, שעובד בשבילך. <bdi>Nesty</bdi> פה.</p>
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/auth/signup"}
                            className="group inline-flex items-center gap-3 px-10 py-4 rounded-[28px] bg-white text-[#6750a4] font-medium text-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300 animate-cta-glow"
                        >
                            <Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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
                                <img src={asset('logo.png')} alt="Nesty" className="h-12 w-auto" />
                            </Link>
                            <p className="text-[#49454f] max-w-sm"><bdi>Nesty</bdi> — כמו אחות גדולה שעוזרת לכם להתארגן. רשימת ציוד חכמה מכל חנות, שיתוף עם המשפחה, וחיסכון אוטומטי.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1d192b] mb-4">קישורים</h3>
                            <ul className="space-y-3">
                                <li><a href="#how-it-works" className="text-[#49454f] hover:text-[#6750a4] transition-colors">איך זה עובד</a></li>
                                <li><a href="#chrome-extension" className="text-[#49454f] hover:text-[#6750a4] transition-colors">תוסף לכרום</a></li>
                                <li><a href="#smart-engine" className="text-[#49454f] hover:text-[#6750a4] transition-colors">המנוע החכם</a></li>
                                <li><Link to={isAuthenticated ? "/dashboard" : "/auth/signin"} className="text-[#49454f] hover:text-[#6750a4] transition-colors">{isAuthenticated ? "לקן שלי" : "כניסה"}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1d192b] mb-4">מידע</h3>
                            <ul className="space-y-3">
                                <li><Link to="/terms" className="text-[#49454f] hover:text-[#6750a4] transition-colors">תנאי שימוש</Link></li>
                                <li><Link to="/privacy" className="text-[#49454f] hover:text-[#6750a4] transition-colors">מדיניות פרטיות</Link></li>
                                <li><Link to="/accessibility" className="text-[#49454f] hover:text-[#6750a4] transition-colors">הצהרת נגישות</Link></li>
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
