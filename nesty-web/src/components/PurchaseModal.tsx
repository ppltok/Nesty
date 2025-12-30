import { useState } from 'react'
import { X, Gift, Check, ExternalLink, Heart, EyeOff, Store, MapPin, MessageCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { supabase } from '../lib/supabase'
import type { Item } from '../types'
import { trackGiftPurchased } from '../utils/tracking'

// Common stores in Israel for baby products
const STORE_OPTIONS = [
  { value: '', label: 'בחרו חנות...' },
  { value: 'שילב', label: 'שילב' },
  { value: 'מוצצים', label: 'מוצצים' },
  { value: 'בייבי סטאר', label: 'בייבי סטאר' },
  { value: 'סופר פארם', label: 'סופר פארם' },
  { value: 'באבי ליין', label: 'באבי ליין' },
  { value: 'בייביז אר אס', label: 'בייביז אר אס' },
  { value: 'טויס אר אס', label: 'טויס אר אס' },
  { value: 'KSP', label: 'KSP' },
  { value: 'באג', label: 'באג' },
  { value: 'איקאה', label: 'איקאה' },
  { value: 'עליאקספרס', label: 'עליאקספרס' },
  { value: 'אמזון', label: 'אמזון' },
  { value: 'אתר המותג', label: 'אתר המותג' },
  { value: 'חנות פיזית', label: 'חנות פיזית' },
  { value: 'אחר', label: 'אחר' },
]

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
  onSuccess: () => void
  registryId?: string
  ownerInfo?: {
    name: string
    email: string
  }
  addressInfo?: {
    isPrivate: boolean
    city: string
    street: string
    apt: string
    postal: string
    phone: string
    ownerName: string
  }
}

interface PurchaseFormData {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  purchasedAt: string
  customStore: string
  giftMessage: string
  isSurprise: boolean
  quantity: number
}

export default function PurchaseModal({
  isOpen,
  onClose,
  item,
  onSuccess,
  registryId,
  ownerInfo,
  addressInfo,
}: PurchaseModalProps) {
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info')
  const [showAddress, setShowAddress] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addressCopied, setAddressCopied] = useState(false)
  const [formData, setFormData] = useState<PurchaseFormData>({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    purchasedAt: '',
    customStore: '',
    giftMessage: '',
    isSurprise: false,
    quantity: 1,
  })

  const remainingQuantity = item ? item.quantity - item.quantity_received : 0

  // Send email notifications via Edge Function
  const sendEmailNotifications = async (purchaseData: {
    buyerName: string
    buyerEmail: string
    itemName: string
    itemPrice: number
    storeName: string
    giftMessage: string | null
  }) => {
    if (!ownerInfo) return

    try {
      // Send notification to registry owner
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'purchase_notification',
          to: ownerInfo.email,
          data: {
            ownerName: ownerInfo.name,
            buyerName: purchaseData.buyerName,
            buyerEmail: purchaseData.buyerEmail,
            itemName: purchaseData.itemName,
            itemPrice: purchaseData.itemPrice,
            storeName: purchaseData.storeName,
            giftMessage: purchaseData.giftMessage,
          },
        },
      })

      // Send thank you email to buyer
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'thank_you',
          to: purchaseData.buyerEmail,
          data: {
            ownerName: ownerInfo.name,
            buyerName: purchaseData.buyerName,
            itemName: purchaseData.itemName,
            itemPrice: purchaseData.itemPrice,
          },
        },
      })
    } catch (emailError) {
      // Don't fail the purchase if email fails
      console.error('Failed to send email notifications:', emailError)
    }
  }

  const handleClose = () => {
    setStep('info')
    setShowAddress(false)
    setFormData({
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      purchasedAt: '',
      customStore: '',
      giftMessage: '',
      isSurprise: false,
      quantity: 1,
    })
    setError(null)
    onClose()
  }

  const handleGoToStore = () => {
    if (item?.original_url) {
      window.open(item.original_url, '_blank')
    }
    setStep('form')
  }

  const handleSubmit = async () => {
    if (!formData.buyerName.trim()) {
      setError('נא להזין את שמך')
      return
    }
    if (!formData.buyerEmail.trim()) {
      setError('נא להזין כתובת אימייל')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      setError('כתובת אימייל לא תקינה')
      return
    }
    if (!formData.purchasedAt) {
      setError('נא לבחור היכן רכשתם')
      return
    }
    if (formData.purchasedAt === 'אחר' && !formData.customStore.trim()) {
      setError('נא להזין את שם החנות')
      return
    }
    if (!item) return

    setIsLoading(true)
    setError(null)

    // Determine store name
    const storeName = formData.purchasedAt === 'אחר'
      ? formData.customStore.trim()
      : formData.purchasedAt

    try {
      // CRITICAL: Fetch fresh item data to prevent race conditions
      const { data: freshItem, error: fetchError } = await supabase
        .from('items')
        .select('quantity, quantity_received')
        .eq('id', item.id)
        .single()

      if (fetchError || !freshItem) {
        throw new Error('הפריט לא נמצא. ייתכן שהוסר מהרשימה.')
      }

      // Check if there's still enough quantity available
      const currentRemaining = freshItem.quantity - freshItem.quantity_received
      if (currentRemaining < formData.quantity) {
        if (currentRemaining <= 0) {
          throw new Error('הפריט כבר נרכש במלואו. רעננו את הדף לראות את המצב העדכני.')
        } else {
          throw new Error(`נותרו רק ${currentRemaining} יחידות זמינות. מישהו אחר כבר רכש חלק מהפריט.`)
        }
      }

      console.log('Attempting to insert purchase for item:', item.id)

      const purchaseData = {
        item_id: item.id,
        buyer_name: formData.buyerName.trim(),
        buyer_email: formData.buyerEmail.trim().toLowerCase(),
        buyer_phone: formData.buyerPhone.trim() || null,
        purchased_at: storeName,
        gift_message: formData.giftMessage.trim() || null,
        is_surprise: formData.isSurprise,
        quantity_purchased: formData.quantity,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      }

      console.log('Purchase data:', purchaseData)

      const { error: insertError, data: insertedPurchase } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()

      console.log('Purchase insert result:', { error: insertError, data: insertedPurchase })

      if (insertError) {
        console.error('Purchase insert error details:', insertError)
        throw new Error(`שגיאה בהוספת הרכישה: ${insertError.message}`)
      }

      // Update item quantity_received using fresh data
      console.log('Updating item quantity_received...')
      const { error: updateError, data: updatedItem } = await supabase
        .from('items')
        .update({
          quantity_received: freshItem.quantity_received + formData.quantity,
        })
        .eq('id', item.id)
        .select()

      console.log('Item update result:', { error: updateError, data: updatedItem })

      if (updateError) {
        console.error('Item update error:', updateError)
        // Don't throw - purchase was recorded, item update is secondary
      }

      // Send email notifications (don't await - let it run in background)
      sendEmailNotifications({
        buyerName: formData.buyerName.trim(),
        buyerEmail: formData.buyerEmail.trim().toLowerCase(),
        itemName: item.name,
        itemPrice: item.price,
        storeName: storeName,
        giftMessage: formData.giftMessage.trim() || null,
      })

      // Track the gift purchase
      if (registryId) {
        trackGiftPurchased({
          registry_id: registryId,
          item_id: item.id,
          item_name: item.name,
          item_category: item.category || '',
          item_price: item.price,
          quantity: formData.quantity,
          has_greeting: !!formData.giftMessage.trim(),
          is_surprise: formData.isSurprise,
          store_selected: storeName,
        })
      }

      setStep('success')
      onSuccess()
    } catch (err: unknown) {
      console.error('Full error:', err)
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'info' && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                קנייה כמתנה
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                אתם עומדים לרכוש מתנה נפלאה!
              </p>
            </div>

            {/* Item info */}
            <div className="bg-muted-light rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                {item.image_url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  {item.price > 0 && (
                    <p className="text-primary font-bold">₪{item.price}</p>
                  )}
                  {item.store_name && item.store_name !== 'ידני' && (
                    <p className="text-sm text-muted-foreground">
                      {item.store_name}
                    </p>
                  )}
                  {remainingQuantity > 1 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      נותרו {remainingQuantity} פריטים
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">קנו את המוצר</p>
                  <p className="text-sm text-muted-foreground">
                    {item.original_url
                      ? 'לחצו על הכפתור למטה לעבור לחנות'
                      : 'רכשו את המוצר בחנות לבחירתכם'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">חזרו אלינו וספרו לנו שרכשתם</p>
                  <p className="text-sm text-muted-foreground">
                    מלאו את הפרטים והמתנה תסומן כנרכשה
                  </p>
                </div>
              </div>
            </div>

            {/* Address Section */}
            {addressInfo && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddress(!showAddress)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#f3edff] hover:bg-[#eaddff] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      צריכים את הכתובת למשלוח?
                    </span>
                  </div>
                  {showAddress ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {showAddress && (
                  <div className="mt-3 p-4 rounded-xl border border-border bg-white">
                    {addressInfo.isPrivate || !addressInfo.city ? (
                      // Address is private or not set
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent-pink/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageCircle className="w-6 h-6 text-accent-pink" />
                        </div>
                        <p className="text-sm text-foreground font-medium mb-1">
                          הכתובת מוסתרת 🤫
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {addressInfo.ownerName ? (
                            <>תודה על התמיכה! {addressInfo.ownerName} בחרה להסתיר את הכתובת - פנו אליה בפרטי לקבל את פרטי המשלוח 💜</>
                          ) : (
                            <>תודה על התמיכה! ההורים בחרו להסתיר את הכתובת - פנו אליהם בפרטי לקבל את פרטי המשלוח 💜</>
                          )}
                        </p>
                      </div>
                    ) : (
                      // Address is visible
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-foreground">
                            <p className="font-medium">כתובת למשלוח:</p>
                            <p>
                              {addressInfo.street}
                              {addressInfo.apt && `, דירה ${addressInfo.apt}`}
                            </p>
                            <p>
                              {addressInfo.city}
                              {addressInfo.postal && ` ${addressInfo.postal}`}
                            </p>
                            {addressInfo.phone && (
                              <p className="mt-1 text-muted-foreground">
                                טלפון: {addressInfo.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Copy Address Button */}
                        <button
                          onClick={() => {
                            const addressText = [
                              addressInfo.street,
                              addressInfo.apt ? `דירה ${addressInfo.apt}` : '',
                              addressInfo.city,
                              addressInfo.postal || '',
                              addressInfo.phone ? `טלפון: ${addressInfo.phone}` : ''
                            ].filter(Boolean).join(', ')
                            navigator.clipboard.writeText(addressText)
                            setAddressCopied(true)
                            setTimeout(() => setAddressCopied(false), 2000)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#f3edff] text-[#6750a4] text-sm font-medium hover:bg-[#e8deff] transition-colors"
                        >
                          {addressCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              הכתובת הועתקה!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              העתק כתובת
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {item.original_url ? (
                <Button onClick={handleGoToStore} className="w-full">
                  <ExternalLink className="w-5 h-5 ml-2" />
                  עבור לחנות לרכישה
                </Button>
              ) : (
                <Button onClick={() => setStep('form')} className="w-full">
                  <Gift className="w-5 h-5 ml-2" />
                  רכשתי מתנה זו
                </Button>
              )}
              <button
                onClick={handleClose}
                className="w-full text-muted-foreground hover:text-primary text-sm py-2"
              >
                חזרה לרשימה
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                מעולה! רכשתם?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                ספרו לנו על הרכישה
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-center text-sm mb-4">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <Input
                label="השם שלכם *"
                value={formData.buyerName}
                onChange={(e) =>
                  setFormData({ ...formData, buyerName: e.target.value })
                }
                placeholder="השם שיופיע להורים"
              />

              <Input
                label="אימייל *"
                type="email"
                value={formData.buyerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, buyerEmail: e.target.value })
                }
                placeholder="כדי שנוכל לשלוח תודה"
              />

              <Input
                label="טלפון (לוואטסאפ)"
                type="tel"
                value={formData.buyerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, buyerPhone: e.target.value })
                }
                placeholder="050-1234567"
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Store className="w-4 h-4 inline ml-1 text-primary" />
                  היכן רכשתם? *
                </label>
                <select
                  value={formData.purchasedAt}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasedAt: e.target.value, customStore: '' })
                  }
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  {STORE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.purchasedAt === 'אחר' && (
                <Input
                  label="שם החנות *"
                  value={formData.customStore}
                  onChange={(e) =>
                    setFormData({ ...formData, customStore: e.target.value })
                  }
                  placeholder="הזינו את שם החנות"
                />
              )}

              {remainingQuantity > 1 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    כמה רכשתם?
                  </label>
                  <div className="flex items-center rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          quantity: Math.max(1, formData.quantity - 1),
                        })
                      }
                      className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-medium">
                      {formData.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          quantity: Math.min(
                            remainingQuantity,
                            formData.quantity + 1
                          ),
                        })
                      }
                      className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Heart className="w-4 h-4 inline ml-1 text-accent-pink" />
                  ברכה להורים (אופציונלי)
                </label>
                <textarea
                  value={formData.giftMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, giftMessage: e.target.value })
                  }
                  placeholder="מזל טוב! מאחלים לכם..."
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                  rows={3}
                />
              </div>

              {/* Surprise toggle */}
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isSurprise: !formData.isSurprise })
                }
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  formData.isSurprise
                    ? 'border-accent-pink bg-accent-pink/5'
                    : 'border-border hover:border-accent-pink/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <EyeOff
                    className={`w-5 h-5 ${
                      formData.isSurprise
                        ? 'text-accent-pink'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <div className="text-right">
                    <p className="font-medium text-foreground">מתנה הפתעה</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.isSurprise
                        ? 'המתנה תיחשף רק לאחר הלידה'
                        : 'ההורים יראו מי קנה את המתנה'}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    formData.isSurprise ? 'bg-accent-pink' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.isSurprise ? 'right-1' : 'left-1'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                className="w-full"
              >
                <Check className="w-5 h-5 ml-2" />
                אישור הרכישה
              </Button>
              <button
                onClick={() => setStep('info')}
                className="w-full text-muted-foreground hover:text-primary text-sm py-2"
              >
                חזרה
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                תודה רבה!
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                המתנה נרשמה בהצלחה
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-green-700 font-medium">
                המתנה סומנה כנרכשה!
              </p>
              <p className="text-xs text-green-600 mt-1">
                ההורים יראו שמישהו קנה להם את המתנה הזו
              </p>
            </div>

            {formData.isSurprise && (
              <div className="bg-accent-pink/10 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff className="w-4 h-4 text-accent-pink" />
                  <span className="font-medium text-foreground">
                    מתנה הפתעה
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ההורים לא יראו את המתנה עד לאחר הלידה
                </p>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              חזרה לרשימה
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
