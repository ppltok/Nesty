export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  due_date: string | null
  is_first_time_parent: boolean
  feeling: 'excited' | 'overwhelmed' | 'exploring' | null
  preferred_language: 'en' | 'he'
  onboarding_completed: boolean
  email_notifications: boolean
  marketing_emails: boolean
  created_at: string
  updated_at: string
}

export interface Registry {
  id: string
  owner_id: string
  slug: string
  title: string | null
  address_city: string | null
  address_street: string | null
  address_apt: string | null
  address_postal: string | null
  address_phone: string | null
  address_is_private: boolean
  is_public: boolean
  welcome_message: string | null
  created_at: string
  updated_at: string
}

export type ItemCategory =
  | 'strollers'
  | 'car_safety'
  | 'furniture'
  | 'safety'
  | 'feeding'
  | 'nursing'
  | 'bath'
  | 'clothing'
  | 'bedding'
  | 'toys'

export interface Item {
  id: string
  registry_id: string
  name: string
  price: number
  image_url: string | null
  original_url: string | null
  store_name: string
  category: ItemCategory
  quantity: number
  quantity_received: number
  is_most_wanted: boolean
  is_private: boolean
  notes: string | null
  cheaper_alternative_url: string | null
  cheaper_alternative_price: number | null
  cheaper_alternative_store: string | null
  price_alert_sent: boolean
  enable_chip_in: boolean
  chip_in_goal: number | null
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  item_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  purchased_at: string | null
  gift_message: string | null
  is_surprise: boolean
  quantity_purchased: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
  confirmation_token: string
  confirmation_sent_at: string | null
  confirmed_at: string | null
  expires_at: string
  is_seen: boolean
  is_received: boolean
  thanked_at: string | null
  created_at: string
}

export type PriorityLevel = 'essential' | 'nice_to_have'

export interface ChecklistPreference {
  id: string
  user_id: string
  category_id: string
  item_name: string
  quantity: number
  is_checked: boolean
  is_hidden: boolean
  notes: string
  priority: PriorityLevel
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  item_id: string
  contributor_name: string
  contributor_email: string
  amount: number
  message: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  confirmation_token: string
  confirmed_at: string | null
  created_at: string
}

export interface PriceAlert {
  id: string
  item_id: string
  original_price: number
  found_price: number
  found_url: string
  found_store: string
  savings_amount: number
  savings_percent: number
  is_read: boolean
  is_dismissed: boolean
  created_at: string
}

// Helper functions
export function isPurchased(item: Item): boolean {
  return item.quantity_received >= item.quantity
}

export function remainingQuantity(item: Item): number {
  return Math.max(0, item.quantity - item.quantity_received)
}

export function getProgressPercentage(item: Item): number {
  if (item.quantity === 0) return 0
  return Math.min(100, (item.quantity_received / item.quantity) * 100)
}
