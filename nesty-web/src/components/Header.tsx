import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { asset } from '../lib/assets'

export default function Header() {
  const { isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={asset('logo.png')} alt="Nesty" className="h-24 sm:h-28 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              איך זה עובד
            </a>
            <a href="#smart-engine" className="text-foreground hover:text-primary transition-colors">
              המנוע החכם
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>לדשבורד שלי</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="outline">כניסה</Button>
                </Link>
                <Link to="/auth/signin">
                  <Button>יצירת רשימה חינם</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <div className="px-4 py-4 space-y-4">
            <a
              href="#how-it-works"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              איך זה עובד
            </a>
            <a
              href="#smart-engine"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              המנוע החכם
            </a>
            <div className="pt-4 border-t border-border space-y-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="block">
                  <Button className="w-full">לדשבורד שלי</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth/signin" className="block">
                    <Button variant="outline" className="w-full">כניסה</Button>
                  </Link>
                  <Link to="/auth/signin" className="block">
                    <Button className="w-full">יצירת רשימה חינם</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
