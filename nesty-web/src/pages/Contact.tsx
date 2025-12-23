import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Send, CheckCircle, Loader2 } from 'lucide-react'
import { asset } from '../lib/assets'
import { supabase } from '../lib/supabase'

type FormStep = 'name' | 'email' | 'subject' | 'message' | 'sending' | 'success'

export default function Contact() {
  const [step, setStep] = useState<FormStep>('name')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleNext = () => {
    setError('')
    if (step === 'name') {
      if (!name.trim()) {
        setError('נא להזין שם')
        return
      }
      setStep('email')
    } else if (step === 'email') {
      if (!email.trim()) {
        setError('נא להזין כתובת אימייל')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('נא להזין כתובת אימייל תקינה')
        return
      }
      setStep('subject')
    } else if (step === 'subject') {
      if (!subject.trim()) {
        setError('נא להזין נושא')
        return
      }
      setStep('message')
    } else if (step === 'message') {
      if (!message.trim()) {
        setError('נא להזין הודעה')
        return
      }
      handleSubmit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step !== 'message') {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setStep('sending')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'contact',
          name,
          email,
          subject,
          message,
        },
      })

      if (fnError) {
        console.error('Function error:', fnError)
        throw fnError
      }

      // Check if the response indicates success
      if (data && data.success === false) {
        console.error('Email send error:', data.error)
        throw new Error(data.error || 'Failed to send email')
      }

      setStep('success')
    } catch (err) {
      console.error('Contact form error:', err)
      setError('אירעה שגיאה בשליחת ההודעה. נסו שוב.')
      setStep('message')
    }
  }

  const getProgress = () => {
    const steps: FormStep[] = ['name', 'email', 'subject', 'message']
    const currentIndex = steps.indexOf(step as FormStep)
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 100
  }

  return (
    <div className="min-h-screen bg-[#fffbff] text-[#1d192b]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fffbff]/80 backdrop-blur-xl border-b border-[#e7e0ec] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-[#6750a4] hover:text-[#503e85] transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לדף הבית
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#1d192b] mb-2">צור קשר</h1>
        <p className="text-[#49454f] mb-12">נשמח לשמוע מכם! מלאו את הפרטים ונחזור אליכם בהקדם.</p>

        {/* Progress bar */}
        {step !== 'success' && step !== 'sending' && (
          <div className="w-full h-1 bg-[#e7e0ec] rounded-full mb-12">
            <div
              className="h-full bg-[#6750a4] rounded-full transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        )}

        {/* Form steps */}
        <div className="min-h-[300px] flex flex-col justify-center">
          {step === 'name' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block">
                <span className="text-2xl font-medium text-[#1d192b]">מה השם שלך?</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="הזינו את שמכם..."
                  className="mt-4 w-full text-xl bg-transparent border-b-2 border-[#e7e0ec] focus:border-[#6750a4] outline-none py-3 transition-colors placeholder:text-[#cac4d0]"
                  autoFocus
                />
              </label>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#503e85] transition-colors"
              >
                המשך
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block">
                <span className="text-2xl font-medium text-[#1d192b]">מה כתובת האימייל שלך?</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="example@email.com"
                  className="mt-4 w-full text-xl bg-transparent border-b-2 border-[#e7e0ec] focus:border-[#6750a4] outline-none py-3 transition-colors placeholder:text-[#cac4d0]"
                  autoFocus
                  dir="ltr"
                />
              </label>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('name')}
                  className="flex items-center gap-2 border border-[#e7e0ec] text-[#49454f] px-6 py-3 rounded-xl font-medium hover:bg-[#f3edf7] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#503e85] transition-colors"
                >
                  המשך
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {step === 'subject' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block">
                <span className="text-2xl font-medium text-[#1d192b]">במה נוכל לעזור?</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="נושא הפנייה..."
                  className="mt-4 w-full text-xl bg-transparent border-b-2 border-[#e7e0ec] focus:border-[#6750a4] outline-none py-3 transition-colors placeholder:text-[#cac4d0]"
                  autoFocus
                />
              </label>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('email')}
                  className="flex items-center gap-2 border border-[#e7e0ec] text-[#49454f] px-6 py-3 rounded-xl font-medium hover:bg-[#f3edf7] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#503e85] transition-colors"
                >
                  המשך
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {step === 'message' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block">
                <span className="text-2xl font-medium text-[#1d192b]">ספרו לנו עוד</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="כתבו את ההודעה שלכם כאן..."
                  rows={5}
                  className="mt-4 w-full text-lg bg-transparent border-2 border-[#e7e0ec] focus:border-[#6750a4] outline-none p-4 rounded-xl transition-colors placeholder:text-[#cac4d0] resize-none"
                  autoFocus
                />
              </label>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('subject')}
                  className="flex items-center gap-2 border border-[#e7e0ec] text-[#49454f] px-6 py-3 rounded-xl font-medium hover:bg-[#f3edf7] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#503e85] transition-colors"
                >
                  <Send className="w-4 h-4" />
                  שלח הודעה
                </button>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <Loader2 className="w-12 h-12 text-[#6750a4] animate-spin mb-4" />
              <p className="text-xl text-[#49454f]">שולח את ההודעה...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1d192b] mb-2">תודה רבה!</h2>
              <p className="text-[#49454f] mb-8">ההודעה שלך נשלחה בהצלחה. נחזור אליך בהקדם האפשרי.</p>
              <Link
                to="/"
                className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#503e85] transition-colors"
              >
                חזרה לדף הבית
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-[#fffbff] border-t border-[#e7e0ec]">
        <div className="max-w-4xl mx-auto px-6 text-center text-[#49454f] text-sm">
          © {new Date().getFullYear()} Nesty. כל הזכויות שמורות.
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
