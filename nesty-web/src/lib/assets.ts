// Helper to get asset URLs with the correct base path for GitHub Pages
// This uses Vite's BASE_URL which is set from the `base` config in vite.config.ts
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanPath}`
}
