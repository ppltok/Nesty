/**
 * localStorage Version Manager
 *
 * Handles schema migrations and prevents app from breaking
 * when localStorage data format changes between versions.
 *
 * IMPORTANT: Increment STORAGE_VERSION when making breaking changes
 * to localStorage data structure.
 */

// Increment this when localStorage schema changes
const STORAGE_VERSION = 2  // Bumped to force clear on existing users

const STORAGE_VERSION_KEY = 'nesty-storage-version'

// All known Nesty localStorage keys
const NESTY_KEYS = [
  'nesty-checked-suggestions',
  'nesty-hidden-suggestions',
  'nesty-suggestion-quantities',
  'nesty-revealed-surprises',
  'nesty-storage-version',
]

/**
 * Initialize storage versioning
 * Call this at app startup BEFORE React renders
 * This function is designed to never throw - it will clear data on any error
 */
export function initializeStorageVersion(): void {
  try {
    // First, validate all existing data is parseable
    if (!validateAllStorageData()) {
      console.warn('Invalid localStorage data detected, clearing all Nesty data')
      clearAllNestyData()
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION))
      return
    }

    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0

    if (isNaN(currentVersion) || currentVersion < 0) {
      // Corrupted version - reset everything
      console.warn('Corrupted storage version, clearing all Nesty data')
      clearAllNestyData()
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION))
      return
    }

    if (currentVersion < STORAGE_VERSION) {
      // Version mismatch - clear and start fresh
      // This is simpler and safer than complex migrations
      console.log(`Storage version mismatch (${currentVersion} -> ${STORAGE_VERSION}), clearing data`)
      clearAllNestyData()
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION))
      return
    }

    // All good, version matches
  } catch (error) {
    console.error('Error initializing storage version:', error)
    // If anything goes wrong, clear and start fresh
    try {
      clearAllNestyData()
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION))
    } catch {
      // localStorage might be full or disabled - nothing we can do
      console.error('Unable to write to localStorage')
    }
  }
}

/**
 * Validate that all stored data can be parsed
 * Returns false if any data is corrupted
 */
function validateAllStorageData(): boolean {
  for (const key of NESTY_KEYS) {
    if (key === STORAGE_VERSION_KEY) continue // Skip version key

    try {
      const value = localStorage.getItem(key)
      if (value !== null) {
        const parsed = JSON.parse(value)
        // Additional validation based on key type
        if (key === 'nesty-checked-suggestions' ||
            key === 'nesty-hidden-suggestions' ||
            key === 'nesty-revealed-surprises') {
          if (!Array.isArray(parsed)) {
            console.warn(`${key} should be an array but got:`, typeof parsed)
            return false
          }
        }
        if (key === 'nesty-suggestion-quantities') {
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            console.warn(`${key} should be an object but got:`, typeof parsed)
            return false
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to parse ${key}:`, error)
      return false
    }
  }
  return true
}

/**
 * Clear all Nesty-related localStorage data
 */
export function clearAllNestyData(): void {
  NESTY_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore removal errors
    }
  })
  console.log('Cleared all Nesty localStorage data')
}

/**
 * Safe localStorage getter with fallback
 * Will NEVER throw - returns defaultValue on any error
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return defaultValue

    const parsed = JSON.parse(value)

    // Type validation
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`Expected array for ${key}, got ${typeof parsed}`)
      localStorage.removeItem(key)
      return defaultValue
    }

    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        console.warn(`Expected object for ${key}, got ${typeof parsed}`)
        localStorage.removeItem(key)
        return defaultValue
      }
    }

    return parsed as T
  } catch (error) {
    console.warn(`Failed to parse localStorage key ${key}:`, error)
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore
    }
    return defaultValue
  }
}

/**
 * Safe localStorage setter
 * Will NEVER throw - returns false on error
 */
export function safeSetItem(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to set localStorage key ${key}:`, error)
    return false
  }
}

/**
 * Emergency reset - clears everything and reloads
 * Call this from error boundaries or when app is in broken state
 */
export function emergencyReset(): void {
  try {
    clearAllNestyData()
    localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION))
  } catch {
    // If even this fails, try clearing all localStorage
    try {
      localStorage.clear()
    } catch {
      // Nothing more we can do
    }
  }
  // Reload the page
  window.location.reload()
}
