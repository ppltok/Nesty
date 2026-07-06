// Israeli mobile helpers shared by the onboarding phone step and the
// WhatsApp re-capture modal. Inputs keep a human 05X-XXX-XXXX format;
// storage is E.164 (+9725XXXXXXXX).

export function formatIlPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`
  return d
}

export const isIlMobileValid = (digits: string) => /^05\d{8}$/.test(digits)

/** "052-123-4567" (or any formatting) → "+972521234567". Assumes valid input. */
export function ilToE164(formatted: string): string {
  const d = formatted.replace(/\D/g, '')
  return `+972${d.slice(1)}`
}
