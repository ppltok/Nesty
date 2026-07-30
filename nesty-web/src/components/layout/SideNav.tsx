import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { asset } from '../../lib/assets'
import {
  Heart,
  ClipboardList,
  Gift,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
  dot?: boolean
}

interface SideNavProps {
  giftsCount?: number
  /** Show a red dot on the gifts icon - an unopened partner gift is waiting. */
  giftDot?: boolean
}

export default function SideNav({ giftsCount = 0, giftDot = false }: SideNavProps) {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'הרשימה שלי',
      icon: Heart,
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
      dot: giftDot,
    },
    {
      id: 'statistics',
      label: 'מבט על',
      icon: BarChart3,
      path: '/statistics',
    },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile Bottom Navigation Bar - Dashboard centered like Instagram */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e7e0ec] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-1 relative">
          {/* Right side items (RTL: appear first = right) */}
          {navItems.filter(i => i.id !== 'dashboard').slice(0, 2).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                to={item.path}
                data-tutorial={`nav-${item.id}-mobile`}
                className={`
                  flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-all duration-200 flex-1 max-w-[72px]
                  ${active ? 'text-[#6750a4]' : 'text-[#49454f]'}
                `}
              >
                <div className="relative">
                  <Icon className={`w-[22px] h-[22px] ${active ? 'text-[#6750a4]' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#b3261e] text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {item.dot && !item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#b3261e] rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-[#6750a4]' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* CENTER - Dashboard (raised, prominent) */}
          {(() => {
            const dashboardItem = navItems.find(i => i.id === 'dashboard')!
            const DashIcon = dashboardItem.icon
            const dashActive = isActive(dashboardItem.path)
            return (
              <Link
                to={dashboardItem.path}
                data-tutorial="nav-dashboard-mobile"
                className="flex flex-col items-center -mt-5 relative z-10"
              >
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90
                    ${dashActive
                      ? 'bg-gradient-to-br from-[#6750a4] to-[#503e85] shadow-[0_4px_20px_rgba(103,80,164,0.4)]'
                      : 'bg-gradient-to-br from-[#e91e63] to-[#c2185b] shadow-[0_4px_20px_rgba(233,30,99,0.3)]'
                    }
                  `}
                >
                  <DashIcon className="w-6 h-6 text-white fill-white" />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${dashActive ? 'text-[#6750a4]' : 'text-[#e91e63]'}`}>
                  {dashboardItem.label}
                </span>
              </Link>
            )
          })()}

          {/* Left side items (RTL: appear last = left) */}
          {navItems.filter(i => i.id !== 'dashboard').slice(2).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                to={item.path}
                data-tutorial={`nav-${item.id}-mobile`}
                className={`
                  flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-all duration-200 flex-1 max-w-[72px]
                  ${active ? 'text-[#6750a4]' : 'text-[#49454f]'}
                `}
              >
                <div className="relative">
                  <Icon className={`w-[22px] h-[22px] ${active ? 'text-[#6750a4]' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#b3261e] text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {item.dot && !item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#b3261e] rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-[#6750a4]' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Settings */}
          <Link
            to="/settings"
            data-tutorial="nav-settings-mobile"
            className={`
              flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-all duration-200 flex-1 max-w-[72px]
              ${isActive('/settings') ? 'text-[#6750a4]' : 'text-[#49454f]'}
            `}
          >
            <Settings className={`w-[22px] h-[22px] ${isActive('/settings') ? 'text-[#6750a4]' : ''}`} />
            <span className={`text-[10px] font-medium ${isActive('/settings') ? 'text-[#6750a4]' : ''}`}>
              הגדרות
            </span>
          </Link>
        </div>
      </nav>

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
                  <Icon className={`w-6 h-6 flex-shrink-0 ${item.id === 'dashboard' ? 'text-[#e91e63] fill-[#e91e63]' : active ? 'text-[#6750a4]' : ''}`} />
                  {item.badge && !isExpanded && (
                    <span className="absolute -top-2 -left-2 min-w-[20px] h-5 bg-[#b3261e] text-white text-[11px] rounded-full flex items-center justify-center font-bold px-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {item.dot && !item.badge && (
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#b3261e] rounded-full ring-2 ring-white" />
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

        {/* Bottom Actions - Settings */}
        <div className="p-3 border-t border-[#e7e0ec] flex-shrink-0 bg-[#fdfcff]">
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
