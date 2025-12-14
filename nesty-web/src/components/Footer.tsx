import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img src="/logo.png" alt="Nesty" className="h-24 sm:h-28 w-auto" />
            </Link>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm">
              לבנות את הקן שלכם, חכם יותר. הרשימה שמאפשרת לכם לאסוף מוצרים מכל מקום ולשתף עם מי שאוהבים.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">קישורים</h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  איך זה עובד
                </a>
              </li>
              <li>
                <a href="#smart-engine" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  המנוע החכם
                </a>
              </li>
              <li>
                <Link to="/auth/signin" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  כניסה
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">מידע</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  תנאי שימוש
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  מדיניות פרטיות
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  צור קשר
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm">
            © {new Date().getFullYear()} Nesty. כל הזכויות שמורות.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1">
            נבנה עם <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent-pink fill-accent-pink" /> בישראל
          </p>
        </div>
      </div>
    </footer>
  )
}
