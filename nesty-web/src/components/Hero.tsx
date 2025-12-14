import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import { ShoppingBag, Store, Gift } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-accent-pink/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
              לבנות את הקן שלכם,{' '}
              <span className="text-primary">חכם יותר.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              הרשימה היחידה שמאפשרת לכם לאסוף מוצרים מכל חנות בעולם, לשתף עם המשפחה והחברים, ולקבל התראות על מחירים טובים יותר.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to="/auth/signin" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  מתחילים להתארגן
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  איך זה עובד?
                </Button>
              </a>
            </div>
          </div>

          {/* Visual - Stroller with Store Icons */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
              {/* Center stroller illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-primary to-primary-dark rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="20" r="2" stroke="white" strokeWidth="2"/>
                    <circle cx="17" cy="20" r="2" stroke="white" strokeWidth="2"/>
                    <path d="M5 18H19L17 8H7L5 18Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8" stroke="white" strokeWidth="2"/>
                    <path d="M12 4V2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              {/* Floating store icons */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                <Store className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div className="absolute top-6 sm:top-8 left-4 sm:left-8 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-secondary" />
              </div>
              <div className="absolute bottom-12 sm:bottom-16 right-4 sm:right-8 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
                <Gift className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-accent-pink" />
              </div>
              <div className="absolute bottom-4 sm:bottom-8 left-2 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
                <Store className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted" />
              </div>

              {/* Connection lines (decorative) - hidden on mobile */}
              <svg className="absolute inset-0 w-full h-full hidden sm:block" viewBox="0 0 400 400">
                <path d="M200 200 L320 80" stroke="#e8e4e9" strokeWidth="2" strokeDasharray="8 4" />
                <path d="M200 200 L80 100" stroke="#e8e4e9" strokeWidth="2" strokeDasharray="8 4" />
                <path d="M200 200 L320 280" stroke="#e8e4e9" strokeWidth="2" strokeDasharray="8 4" />
                <path d="M200 200 L60 320" stroke="#e8e4e9" strokeWidth="2" strokeDasharray="8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
