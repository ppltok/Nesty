import { useNavigate } from 'react-router-dom'
import { Users, X } from 'lucide-react'
import { dismissPopup } from '../../hooks/usePopups'

interface Props {
  userId: string
  onClose: () => void
}

export default function PartnerInviteCard({ userId, onClose }: Props) {
  const navigate = useNavigate()

  const handleInvite = async () => {
    await dismissPopup(userId, 'partner_invite_card')
    onClose()
    navigate('/settings#co-parent')
  }

  const handleDismiss = async () => {
    await dismissPopup(userId, 'partner_invite_card')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300" dir="rtl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="סגור"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#7c4dbd] to-[#9b62d4] flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d192b] mb-2">בונים את הקן ביחד</h2>
          <p className="text-sm text-[#49454f] mb-6 leading-relaxed">
            תוסיפי את בן/בת הזוג לרשימה כדי שתוכלו לערוך, להוסיף ולעקוב יחד.
            <br />
            הקן הזה לא צריך להיות פרויקט של בן אדם אחד.
          </p>

          <button
            onClick={handleInvite}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-[#7c4dbd] to-[#9b62d4] text-white font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-opacity mb-3"
          >
            <Users className="w-5 h-5" />
            הזמיני את בן/בת הזוג
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3 text-sm text-[#49454f] hover:text-[#1d192b] transition-colors"
          >
            לא עכשיו
          </button>
        </div>
      </div>
    </div>
  )
}
