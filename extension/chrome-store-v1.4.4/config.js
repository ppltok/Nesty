/**
 * Nesty Extension - Environment Configuration
 * Switch between local development and production
 */

const ENV = 'development' // Change to 'production' for deployed version

const CONFIG = {
  development: {
    WEB_URL: 'http://localhost:5173',
    SUPABASE_URL: 'https://wopsrjfdaovlyibivijl.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHNyamZkYW92bHlpYml2aWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTgxMjMsImV4cCI6MjA4MTE5NDEyM30.x4yVBmmbKyGKylOepJwOHessCfIjVxzRvSNbyJ4VyJw',
  },
  production: {
    WEB_URL: 'https://nestyil.com',
    SUPABASE_URL: 'https://wopsrjfdaovlyibivijl.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHNyamZkYW92bHlpYml2aWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTgxMjMsImV4cCI6MjA4MTE5NDEyM30.x4yVBmmbKyGKylOepJwOHessCfIjVxzRvSNbyJ4VyJw',
  }
}

// Export current environment config
export const config = CONFIG[ENV]
export const isProduction = ENV === 'production'
