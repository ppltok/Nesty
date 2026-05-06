// Legal footer shared by every marketing/transactional email Nesty sends.
//
// Israeli law (חוק התקשורת תיקון 40, סעיף 30א) requires every commercial
// email to identify the sender's full legal company name and a contact
// channel. This footer renders that, plus the unsubscribe link and standard
// privacy/site links. Use this anywhere we currently render bespoke footer
// HTML so we have one place to update if/when the registered address or
// contact email changes.
//
// Usage:
//   import { renderLegalFooter } from '../_shared/legal-footer.ts'
//   const footer = renderLegalFooter({ unsubscribeLinkHtml, variant: 'light' })
//   // Then inject ${footer} into the email template.

export interface LegalFooterOpts {
  /** Pre-rendered <a>...</a> for the per-category unsubscribe link. */
  unsubscribeLinkHtml: string
  /** 'light' = small gray text on white card. 'dark' = same but tuned darker
   *  for transactional emails on lighter backgrounds. */
  variant?: 'light' | 'dark'
}

export const COMPANY_LEGAL_NAME_HE = 'באבו קפיטל בע"מ'
export const COMPANY_LEGAL_NAME_EN = 'Babu Capital Ltd'
export const COMPANY_CONTACT_EMAIL = 'hello@nestyil.com'
export const COMPANY_WEBSITE = 'https://nestyil.com'
export const PRIVACY_URL = 'https://nestyil.com/privacy'

/**
 * Returns the inner HTML for the email footer block. Caller should already
 * have a wrapper td/div with appropriate padding.
 */
export function renderLegalFooter(opts: LegalFooterOpts): string {
  const { unsubscribeLinkHtml } = opts
  const muted = opts.variant === 'dark' ? '#7a6090' : '#bca8d4'
  const link = '#9070b8'
  return `
    <p style="margin:0 0 8px;font-size:13px;color:#a087c0;">
      נשלח על ידי <strong style="color:#7c4dbd;">${COMPANY_LEGAL_NAME_EN}</strong>
      &nbsp;·&nbsp;
      <a href="mailto:${COMPANY_CONTACT_EMAIL}" style="color:${link};text-decoration:underline;">${COMPANY_CONTACT_EMAIL}</a>
    </p>
    <p style="margin:0 0 8px;font-size:11px;color:${muted};">
      ${COMPANY_LEGAL_NAME_HE} (Babu Capital Ltd) · נסטי / Nesty
    </p>
    <p style="margin:0;font-size:12px;color:${muted};">
      ${unsubscribeLinkHtml}
      &nbsp;·&nbsp;
      <a href="${PRIVACY_URL}" style="color:${link};text-decoration:underline;">מדיניות פרטיות</a>
      &nbsp;·&nbsp;
      <a href="${COMPANY_WEBSITE}" style="color:${link};text-decoration:underline;">nestyil.com</a>
    </p>
  `
}
