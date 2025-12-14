import { EyeOff, Lock, Shield } from 'lucide-react'

export default function Privacy() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-muted-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            הקן שלכם, החוקים שלכם.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            אתם שולטים במה שמשתפים ומה נשאר פרטי
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Hide Items */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-border">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <EyeOff className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
              הסתרת מוצרים
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              יש פריטים שאתם רוצים לקנות לבד? סמנו אותם כפרטיים והם יישארו מוסתרים מכל האורחים.
            </p>
          </div>

          {/* Hide Address */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-border">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent-pink/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent-pink" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
              הסתרת כתובת
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              לא רוצים שכולם יראו את הכתובת שלכם? הפעילו מצב פרטי ונותני המתנות יצרו איתכם קשר לפני המשלוח.
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-sm border border-border">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            <span className="text-sm sm:text-base text-foreground font-medium">המידע שלכם מאובטח ומוגן</span>
          </div>
        </div>
      </div>
    </section>
  )
}
