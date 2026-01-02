import { Users, Heart } from 'lucide-react'

export default function ChipIn() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Visual - Stroller with Progress */}
          <div className="order-2 lg:order-1 relative mt-8 lg:mt-0">
            <div className="bg-gradient-to-br from-primary/5 to-accent-pink/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
              {/* Stroller illustration */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-primary-dark rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="20" r="2" stroke="white" strokeWidth="2"/>
                  <circle cx="17" cy="20" r="2" stroke="white" strokeWidth="2"/>
                  <path d="M5 18H19L17 8H7L5 18Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8" stroke="white" strokeWidth="2"/>
                </svg>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1 sm:mb-2">
                עגלת Bugaboo Fox 5
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">₪4,000</p>

              {/* Progress Bar */}
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span className="text-muted-foreground">התקדמות</span>
                  <span className="font-bold text-primary">70%</span>
                </div>
                <div className="h-3 sm:h-4 bg-muted-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-primary to-accent-pink rounded-full transition-all duration-1000"
                    style={{ width: '70%' }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                  נאספו <span className="text-primary">₪2,800</span> מתוך ₪4,000
                </p>
              </div>

              {/* Contributors */}
              <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
                <div className="flex -space-x-2 space-x-reverse">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-medium border-2 border-white">ד</div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs sm:text-sm font-medium border-2 border-white">ש</div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent-pink text-white flex items-center justify-center text-xs sm:text-sm font-medium border-2 border-white">מ</div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted text-white flex items-center justify-center text-xs sm:text-sm font-medium border-2 border-white">+2</div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">5 תורמים</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 bg-accent-pink/10 text-accent-pink px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Chip-In</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              חולמים על עגלה יקרה? תנו להם להשתתף.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
              יש מוצרים שהם פשוט יקרים מדי לאדם אחד. עם Chip-In, כולם יכולים לתרום סכום קטן למתנה הגדולה.
            </p>
            <ul className="space-y-3 sm:space-y-4 text-right">
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-accent-pink flex-shrink-0" />
                <span className="text-sm sm:text-base">כל אחד נותן כמה שנוח לו</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base">הסבא והסבתא, הדודים, החברים - כולם משתתפים</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-accent-pink flex-shrink-0" />
                <span className="text-sm sm:text-base">אתם מקבלים את מה שבאמת רציתם</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
