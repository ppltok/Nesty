import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import { Sparkles } from 'lucide-react'

export default function FooterCTA() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
      {/* Decorative elements - hidden on small mobile */}
      <div className="absolute inset-0">
        <div className="hidden sm:block absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="hidden sm:block absolute bottom-10 left-10 w-60 h-60 bg-accent-pink/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">חינם לגמרי</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
          מוכנים להתחיל לקנן?
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
          הצטרפו לאלפי הורים שכבר בונים את הרשימה החכמה שלהם.
        </p>

        <Link to="/auth/signin">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg text-sm sm:text-base"
          >
            יצירת הרשימה הראשונה שלי
          </Button>
        </Link>
      </div>
    </section>
  )
}
