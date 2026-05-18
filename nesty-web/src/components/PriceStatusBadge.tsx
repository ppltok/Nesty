import { TrendingDown, TrendingUp } from 'lucide-react'

interface Props {
  originalPrice: number
  lastCheckedPrice: number | null
  lastPriceCheck: string | null
  className?: string
}

const MIN_PERCENT = 3
const MIN_AMOUNT = 10

function daysAgo(iso: string | null): number | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export default function PriceStatusBadge({
  originalPrice,
  lastCheckedPrice,
  lastPriceCheck,
  className = '',
}: Props) {
  if (!lastCheckedPrice || !originalPrice) return null

  const diff = lastCheckedPrice - originalPrice
  const absPercent = Math.abs(diff / originalPrice) * 100
  const absAmount = Math.abs(diff)

  if (absPercent < MIN_PERCENT || absAmount < MIN_AMOUNT) return null

  const dropped = diff < 0
  const days = daysAgo(lastPriceCheck)
  const ago =
    days === null
      ? ''
      : days === 0
        ? 'נבדק היום'
        : days === 1
          ? 'נבדק אתמול'
          : `נבדק לפני ${days} ימים`

  const styles = dropped
    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
    : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'

  const Icon = dropped ? TrendingDown : TrendingUp
  const label = dropped ? 'המחיר ירד' : 'המחיר עלה'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles} ${className}`}
      title={`${label}: ₪${lastCheckedPrice.toLocaleString()} • ${ago}`}
    >
      <Icon className="w-3 h-3" />
      <bdi>₪{lastCheckedPrice.toLocaleString()}</bdi>
    </span>
  )
}
