/**
 * Lightweight Supabase Client for Chrome Extension
 * Uses REST API instead of the full Supabase SDK to avoid bundling issues
 */

import { config } from './config.js'

class SupabaseClient {
  constructor() {
    this.url = config.SUPABASE_URL
    this.anonKey = config.SUPABASE_ANON_KEY
    this.accessToken = null
  }

  /**
   * Get the current session from localStorage
   * Supabase stores session in localStorage with key pattern: supabase.auth.token
   */
  async getSession() {
    try {
      // Try to get session from localStorage
      const storageKey = `sb-${this.url.split('//')[1].split('.')[0]}-auth-token`
      const sessionData = localStorage.getItem(storageKey)

      if (sessionData) {
        const session = JSON.parse(sessionData)
        this.accessToken = session.access_token
        return {
          data: { session },
          error: null
        }
      }

      return { data: { session: null }, error: null }
    } catch (error) {
      console.error('Error getting session:', error)
      return { data: { session: null }, error }
    }
  }

  /**
   * Make a request to Supabase REST API
   */
  async request(method, endpoint, body = null) {
    const headers = {
      'apikey': this.anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const options = {
      method,
      headers
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/${endpoint}`, options)

      if (!response.ok) {
        const error = await response.json()
        return { data: null, error }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Query builder for SELECT operations
   */
  from(table) {
    return {
      select: (columns = '*') => {
        return {
          eq: (column, value) => {
            return {
              maybeSingle: async () => {
                const endpoint = `${table}?select=${columns}&${column}=eq.${value}`
                const { data, error } = await this.request('GET', endpoint)
                return {
                  data: data && data.length > 0 ? data[0] : null,
                  error
                }
              },
              execute: async () => {
                const endpoint = `${table}?select=${columns}&${column}=eq.${value}`
                return await this.request('GET', endpoint)
              }
            }
          }
        }
      },
      insert: (values) => {
        return {
          execute: async () => {
            return await this.request('POST', table, values)
          }
        }
      }
    }
  }
}

// Export singleton instance
export const supabase = new SupabaseClient()
