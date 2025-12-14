import { useState } from 'react'
import { X, MapPin, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { supabase } from '../lib/supabase'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  registryId: string
  onSave: () => void
}

export default function AddressModal({ isOpen, onClose, registryId, onSave }: AddressModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hideAddress, setHideAddress] = useState(true)
  const [address, setAddress] = useState({
    city: '',
    street: '',
    apt: '',
    postal: '',
    phone: '',
  })

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('registries')
        .update({
          address_city: address.city || null,
          address_street: address.street || null,
          address_apt: address.apt || null,
          address_postal: address.postal || null,
          address_phone: address.phone || null,
          address_is_private: hideAddress,
        })
        .eq('id', registryId)

      if (updateError) throw updateError

      onSave()
      onClose()
    } catch (err) {
      setError('שגיאה בשמירת הכתובת. נסו שוב.')
      console.error('Error saving address:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onClose()
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
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              לאן לשלוח את המתנות?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              הוסיפו כתובת כדי שחברים ומשפחה ידעו לאן לשלוח
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
              label="עיר"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              placeholder="תל אביב"
            />
            <Input
              label="רחוב ומספר בית"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              placeholder="רחוב הרצל 1"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="דירה"
                value={address.apt}
                onChange={(e) => setAddress({ ...address, apt: e.target.value })}
                placeholder="5"
              />
              <Input
                label="מיקוד"
                value={address.postal}
                onChange={(e) => setAddress({ ...address, postal: e.target.value })}
                placeholder="6100000"
              />
            </div>
            <Input
              label="טלפון ליצירת קשר"
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              placeholder="050-1234567"
            />
          </div>

          {/* Hide Address Toggle */}
          <div className="mt-6 p-4 bg-muted-light/50 rounded-xl">
            <button
              onClick={() => setHideAddress(!hideAddress)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {hideAddress ? (
                  <EyeOff className="w-5 h-5 text-primary" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {hideAddress ? 'הכתובת מוסתרת' : 'הכתובת גלויה'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hideAddress
                      ? 'נותני מתנות יצרו איתך קשר לפני המשלוח'
                      : 'הכתובת תוצג לכל מי שרואה את הרשימה'}
                  </p>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  hideAddress ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    hideAddress ? 'right-1' : 'left-1'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              className="w-full"
            >
              שמור כתובת
            </Button>
            <button
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-primary text-sm py-2"
            >
              אעשה את זה אחר כך
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
