import { Heart, Check, Plus, Share2, Baby, Sparkles, Smile, ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

export default function HybridDesign() {
  // Override global body styles for this page
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor
    const originalFont = document.body.style.fontFamily
    document.body.style.backgroundColor = '#fffbff'
    document.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

    return () => {
      document.body.style.backgroundColor = originalBg
      document.body.style.fontFamily = originalFont
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fffbff] text-[#1d192b]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
       {/* Header - Figma Style: Sticky, blurred, precise border */}
       <header className="sticky top-0 z-50 bg-[#fffbff]/80 backdrop-blur-xl border-b border-[#e7e0ec] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo container with 'Squircle' smoothing suggestion */}
            <div className="w-10 h-10 rounded-[14px] bg-[#6750a4] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(103,80,164,0.25)] rotate-3 hover:rotate-0 transition-all duration-300">
               <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#1d192b]">Nesty</span>
          </div>
          <button className="text-sm font-bold bg-[#f3edff] text-[#1d192b] px-5 py-2 rounded-full hover:bg-[#eaddff] transition-colors border border-transparent hover:border-[#d0bcff]">
            חזרה
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-24 px-6">
        
        {/* Intro - High typographic hierarchy */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] mb-8 bg-[#eaddff] text-[#21005d] hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-6xl md:text-8xl font-medium mb-6 text-[#1d192b] tracking-tight leading-[1.1]">
             התאמה <span className="text-[#6750a4] relative inline-block">
               אורגנית
               <svg className="absolute w-full h-3 -bottom-1 right-0 text-[#eaddff] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
               </svg>
             </span>
          </h1>
          <p className="text-2xl text-[#49454f] leading-relaxed font-light max-w-2xl mx-auto">
             החמימות של גווני הפסטל פוגשת את הרכות של הצורות הטבעיות.
          </p>
        </div>

        {/* The Hybrid Interface */}
        <div className="bg-[#fffbff]">
           
           {/* Actions - Grouped logic, clear affordance */}
           <div className="mb-20 flex justify-center">
              <div className="bg-[#f3edff]/50 backdrop-blur-sm p-2 rounded-[36px] flex gap-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] border border-[#eaddff]">
                 <button className="pl-10 pr-8 py-4 rounded-[28px] rounded-bl-[8px] bg-[#6750a4] text-white hover:rounded-[16px] active:scale-95 transition-all duration-300 ease-out font-medium text-lg flex gap-3 shadow-[0_8px_16px_rgba(103,80,164,0.2)] items-center group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                    <span>הוסף פריט</span>
                 </button>
                 <button className="pl-10 pr-8 py-4 rounded-[28px] rounded-br-[8px] bg-[#eaddff] text-[#21005d] hover:bg-[#d0bcff] hover:rounded-[16px] active:scale-95 transition-all duration-300 font-medium text-lg flex gap-3 items-center hover:shadow-md">
                    <Share2 className="w-5 h-5" /> 
                    <span>שתף</span>
                 </button>
              </div>
           </div>

           {/* Cards Grid - 8pt grid alignment, Figma constraints */}
           <div className="grid md:grid-cols-3 gap-6 items-start">
              
              {/* Card 1: Product - High Fidelity Surface */}
              <div className="bg-[#f3edff] p-6 rounded-[40px] rounded-tl-[12px] hover:shadow-[0_20px_40px_-12px_rgba(103,80,164,0.15)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] group cursor-pointer relative overflow-hidden border border-[#eaddff]/50">
                 {/* Decorative background blob */}
                 <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/60 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 
                 <div className="bg-[#eaddff] rounded-[32px] rounded-tl-[8px] aspect-square flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute top-[-20px] left-[-20px] w-48 h-48 bg-[#d0bcff] rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700 ease-out mix-blend-multiply" />
                    <Baby className="w-28 h-28 text-[#21005d] relative z-10 drop-shadow-sm" strokeWidth={1.5} />
                 </div>
                 <div className="px-2 pb-2">
                    <div className="mb-8">
                       <h3 className="text-4xl text-[#1d192b] font-medium mb-2 tracking-tight">עגלת תינוק</h3>
                       <p className="text-[#49454f] text-lg font-medium opacity-70 flex items-center gap-2">
                         Baby Store Premium
                         <span className="w-1.5 h-1.5 rounded-full bg-[#6750a4]/40"></span>
                       </p>
                    </div>
                    <div className="flex justify-between items-end border-t border-[#6750a4]/10 pt-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#6750a4] uppercase tracking-wider mb-1 opacity-80">מחיר</span>
                          <span className="text-3xl font-medium text-[#1d192b] font-numeric">₪2,450</span>
                       </div>
                       <button className="w-14 h-14 rounded-[20px] bg-[#6750a4] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[#6750a4]/25">
                          {/* ArrowLeft for RTL "Go" direction */}
                          <ArrowLeft className="w-6 h-6" />
                       </button>
                    </div>
                 </div>
              </div>

              {/* Card 2: Progress - "Data Visualization" Approach */}
              <div className="bg-[#ffd8e4] p-8 rounded-[12px] rounded-tl-[80px] rounded-br-[80px] flex flex-col justify-between relative overflow-hidden group min-h-[480px] shadow-[0_10px_30px_-10px_rgba(255,216,228,0.8)] hover:shadow-[0_20px_40px_-10px_rgba(255,216,228,0.9)] transition-all duration-500">
                 
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-auto">
                       <div className="w-14 h-14 bg-[#31111d]/5 rounded-[18px] rotate-[-3deg] flex items-center justify-center backdrop-blur-sm">
                          <Check className="w-7 h-7 text-[#31111d]" />
                       </div>
                       <div className="px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-[#31111d] font-bold text-sm tracking-wide border border-white/20">
                          בדרך הנכונה
                       </div>
                    </div>
                    
                    <div className="mt-12">
                      <p className="text-[#31111d] font-bold text-sm uppercase tracking-widest opacity-60 mb-1">הושלם</p>
                      <p className="text-8xl font-medium text-[#31111d] mb-6 tracking-tighter font-numeric">65%</p>
                      <p className="text-[#31111d] font-medium text-lg border-r-4 border-[#31111d]/10 pr-4 leading-snug">
                         16 פריטים נרכשו<br/>מתוך הרשימה
                      </p>
                    </div>
                 </div>

                 {/* Bar Chart Micro-interaction */}
                 <div className="relative z-10 w-full bg-[#31111d]/5 h-3 rounded-full overflow-hidden mt-10">
                    <div className="bg-[#31111d] h-full w-[65%] rounded-full relative overflow-hidden group-hover:w-[68%] transition-all duration-1000 ease-out">
                       <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                    </div>
                 </div>
              </div>

              {/* Card 3: Message - Emotional Design */}
              <div className="bg-[#f2f0f4] p-10 rounded-[48px] flex flex-col items-center text-center justify-center group hover:bg-[#e6e1e5] transition-colors duration-500 min-h-[380px] border border-white">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.04)] mb-8 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <Heart className="w-10 h-10 fill-[#b3261e] text-[#b3261e]" />
                 </div>
                 <div className="mb-6">
                    <span className="bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-[#1d192b] border border-black/5">
                      הודעה מהמשפחה
                    </span>
                 </div>
                 <p className="text-[#49454f] text-2xl leading-relaxed font-medium">
                    "אנחנו כל כך מתרגשים לחלוק את המסע הזה איתכם."
                 </p>
                 <div className="mt-10 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <Smile className="w-6 h-6 text-[#49454f]" />
                 </div>
              </div>

           </div>
        </div>
      </main>

      <footer className="py-12 bg-[#fffbff] text-[#49454f] text-center border-t border-[#e7e0ec]">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
           <div className="w-2 h-2 rounded-full bg-[#6750a4]" />
           <div className="w-2 h-2 rounded-full bg-[#eaddff]" />
           <div className="w-2 h-2 rounded-full bg-[#ffd8e4]" />
        </div>
        <p className="text-sm font-medium opacity-60">Figma-Grade System v2.1 • Design Systems IL</p>
      </footer>
    </div>
  );
}