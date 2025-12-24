import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { asset } from '../../lib/assets'
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Gift,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
}

interface SideNavProps {
  giftsCount?: number
}

export default function SideNav({ giftsCount = 0 }: SideNavProps) {
  const location = useLocation()
  const { signOut } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'הרשימה שלי',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'checklist',
      label: 'צ\'קליסט',
      icon: ClipboardList,
      path: '/checklist',
    },
    {
      id: 'gifts',
      label: 'מתנות',
      icon: Gift,
      path: '/gifts',
      badge: giftsCount > 0 ? giftsCount : undefined,
    },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e7e0ec] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.id}
                to={item.path}
                data-tutorial={`nav-${item.id}-mobile`}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[72px]
                  ${active
                    ? 'bg-[#eaddff] text-[#6750a4]'
                    : 'text-[#49454f] hover:bg-[#f3edff]'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${active ? 'text-[#6750a4]' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#b3261e] text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-medium ${active ? 'text-[#6750a4]' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More menu button for settings */}
          <button
            onClick={() => setIsMobileOpen(true)}
            data-tutorial="nav-more-mobile"
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl text-[#49454f] hover:bg-[#f3edff] transition-all min-w-[72px]"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[11px] font-medium">עוד</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Sheet (slides from bottom) */}
      <div
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[28px] shadow-2xl
          transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#e7e0ec] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-[#e7e0ec]">
          <div className="flex items-center gap-3">
            <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-8 w-auto" />
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-[#49454f] hover:text-[#1d192b] hover:bg-[#f3edff] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          <Link
            to="/settings"
            onClick={() => setIsMobileOpen(false)}
            data-tutorial="nav-settings-mobile"
            className={`
              flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200
              ${isActive('/settings')
                ? 'bg-[#eaddff] text-[#6750a4]'
                : 'text-[#1d192b] hover:bg-[#f3edff]'
              }
            `}
          >
            <div className="w-10 h-10 rounded-xl bg-[#f3edff] flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#6750a4]" />
            </div>
            <span className="font-medium text-base">הגדרות</span>
          </Link>

          <button
            onClick={() => {
              setIsMobileOpen(false)
              handleSignOut()
            }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 text-[#b3261e] hover:bg-[#ffebee]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ffebee] flex items-center justify-center">
              <LogOut className="w-5 h-5 text-[#b3261e]" />
            </div>
            <span className="font-medium text-base">התנתק</span>
          </button>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-8" />
      </div>

      {/* Desktop Side Navigation - Full height fixed */}
      <aside
        className={`
          hidden lg:flex fixed top-0 right-0 h-screen bg-white border-l border-[#e7e0ec] z-40
          transition-all duration-300 ease-in-out flex-col
          ${isExpanded ? 'w-64' : 'w-[72px]'}
        `}
      >
        {/* Header with Logo */}
        <div className="h-20 flex items-center justify-center border-b border-[#e7e0ec] flex-shrink-0">
          {isExpanded ? (
            <Link to="/" className="flex items-center justify-center w-full px-4">
              <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-12 w-auto" />
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center w-full">
              <img src={asset('favicon.png')} alt="Nesty" className="w-11 h-11 object-contain" />
            </Link>
          )}
        </div>

        {/* Navigation Items - Main area */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.id}
                to={item.path}
                data-tutorial={`nav-${item.id}`}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group
                  ${active
                    ? 'bg-[#eaddff] text-[#6750a4]'
                    : 'text-[#49454f] hover:bg-[#f3edff] hover:text-[#1d192b]'
                  }
                  ${!isExpanded && 'justify-center'}
                `}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-[#6750a4]' : ''}`} />
                  {item.badge && !isExpanded && (
                    <span className="absolute -top-2 -left-2 min-w-[20px] h-5 bg-[#b3261e] text-white text-[11px] rounded-full flex items-center justify-center font-bold px-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <span className="flex-1 font-medium">{item.label}</span>
                )}
                {isExpanded && item.badge && (
                  <span className="bg-[#b3261e] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions - Settings & Logout */}
        <div className="p-3 border-t border-[#e7e0ec] space-y-1 flex-shrink-0 bg-[#fdfcff]">
          <Link
            to="/settings"
            data-tutorial="nav-settings"
            className={`
              flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200
              ${isActive('/settings')
                ? 'bg-[#eaddff] text-[#6750a4]'
                : 'text-[#49454f] hover:bg-[#f3edff] hover:text-[#1d192b]'
              }
              ${!isExpanded && 'justify-center'}
            `}
            title={!isExpanded ? 'הגדרות' : undefined}
          >
            <Settings className="w-6 h-6 flex-shrink-0" />
            {isExpanded && <span className="font-medium">הגדרות</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200
              text-[#b3261e] hover:bg-[#ffebee]
              ${!isExpanded && 'justify-center'}
            `}
            title={!isExpanded ? 'התנתק' : undefined}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            {isExpanded && <span className="font-medium">התנתק</span>}
          </button>
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-3 top-20 w-6 h-6 bg-white border border-[#e7e0ec] rounded-full shadow-md flex items-center justify-center text-[#49454f] hover:text-[#6750a4] hover:bg-[#f3edff] transition-all"
          aria-label={isExpanded ? 'כווץ תפריט' : 'הרחב תפריט'}
        >
          {isExpanded ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Desktop spacer to push content */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-[72px]'}`} />
    </>
  )
}
