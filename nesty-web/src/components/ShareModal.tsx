import { useState } from 'react'
import { X, Link2, Check, MessageCircle, Mail, QrCode, Copy, Share2 } from 'lucide-react'
import { Button } from './ui/Button'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  registrySlug: string
  ownerName: string
}

export default function ShareModal({ isOpen, onClose, registrySlug, ownerName }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const registryUrl = `${window.location.origin}${import.meta.env.BASE_URL}registry/${registrySlug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registryUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleWhatsAppShare = () => {
    const text = `היי! הכנתי רשימת מתנות לתינוק 🎁\nתוכלו לראות מה אני צריך/ה ולבחור מתנה:\n${registryUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailShare = () => {
    const subject = `רשימת המתנות של ${ownerName}`
    const body = `היי!\n\nהכנתי רשימת מתנות לתינוק ואשמח אם תעיפו מבט.\n\nלרשימה: ${registryUrl}\n\nתודה! ❤️`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              שתפו את הרשימה
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              שלחו את הלינק לחברים ומשפחה
            </p>
          </div>

          {/* Link Preview */}
          <div className="bg-muted-light/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">הלינק שלכם</p>
                <p className="text-sm font-medium text-foreground truncate" dir="ltr">
                  {registryUrl}
                </p>
              </div>
              <Button
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                onClick={handleCopyLink}
                className={copied ? 'bg-success hover:bg-success text-white' : ''}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 ml-1" />
                    הועתק!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 ml-1" />
                    העתק
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-4 p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-foreground">שיתוף בוואטסאפ</p>
                <p className="text-sm text-muted-foreground">שליחה לאנשים או לקבוצות</p>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="w-full flex items-center gap-4 p-4 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-foreground">שיתוף באימייל</p>
                <p className="text-sm text-muted-foreground">שליחה לכתובת מייל</p>
              </div>
            </button>

            {/* Copy Link Button (Alternative) */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-4 p-4 bg-muted-light/50 hover:bg-muted-light rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-foreground">העתקת לינק</p>
                <p className="text-sm text-muted-foreground">העתיקו את הלינק ושתפו בכל מקום</p>
              </div>
            </button>
          </div>

          {/* QR Code Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground mb-3">
                <QrCode className="w-4 h-4" />
                <span className="text-sm">QR Code</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-border inline-block">
                {/* QR Code - Using a simple API for QR generation */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(registryUrl)}`}
                  alt="QR Code לרשימה"
                  className="w-[150px] h-[150px]"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                סרקו את הקוד כדי להגיע לרשימה
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
