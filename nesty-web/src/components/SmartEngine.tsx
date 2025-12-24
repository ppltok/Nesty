import { TrendingDown, Bell, CheckCircle, XCircle } from 'lucide-react'

export default function SmartEngine() {
  return (
    <section id="smart-engine" className="py-12 sm:py-16 lg:py-24 bg-muted-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">בקרוב</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              המנוע החכם ששומר לכם על הכיס
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
              הוסיפו מוצר לרשימה ואנחנו נחפש אותו בעשרות חנויות ברחבי ישראל. מצאנו מחיר טוב יותר? נשלח לכם התראה מיד!
            </p>
            <ul className="space-y-3 sm:space-y-4 text-right">
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base">התראות מחיר בזמן אמת</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success flex-shrink-0" />
                <span className="text-sm sm:text-base">השוואת מחירים אוטומטית</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base">חיסכון ממוצע של 15-30%</span>
              </li>
            </ul>
          </div>

          {/* Visual - Price Comparison Card */}
          <div className="relative mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-auto">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-muted-light rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="8" width="16" height="12" rx="2" stroke="#86608e" strokeWidth="2"/>
                    <path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="#86608e" strokeWidth="2"/>
                    <circle cx="12" cy="14" r="2" stroke="#86608e" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1 text-sm sm:text-base">עגלת Bugaboo Fox 5</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">מצאנו מחיר טוב יותר!</p>
                </div>
              </div>

              {/* Original Price */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-red-50 rounded-lg sm:rounded-xl mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">המחיר שלך</p>
                    <p className="font-bold text-foreground line-through text-sm sm:text-base">₪6,099</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Baby Store IL</p>
              </div>

              {/* Found Price */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border-2 border-success">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">מחיר שמצאנו</p>
                    <p className="font-bold text-foreground text-sm sm:text-base">₪5,500</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">BabyShop</p>
              </div>

              {/* Savings Badge */}
              <div className="mt-3 sm:mt-4 text-center">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-success/10 text-success px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  חיסכון של ₪599 (10%)
                </span>
              </div>
            </div>

            {/* Decorative elements - hidden on mobile */}
            <div className="hidden sm:block absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="hidden sm:block absolute -bottom-4 -left-4 w-32 h-32 bg-accent-pink/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
