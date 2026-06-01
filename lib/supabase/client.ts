import { createBrowserClient } from '@supabase/ssr'

// Singleton to avoid creating multiple clients
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing client if available
  if (client) return client
  
  // Check if environment variables are available (they won't be during build)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return a no-op client during build or when env vars are missing
  if (!url || !key) {
    // Return a proxy that will throw meaningful errors only when methods are called
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get() {
        return () => {
          throw new Error('Supabase client cannot be used during build time. This is a client component that should only run in the browser.')
        }
      }
    })
  }
  
  client = createBrowserClient(url, key)
  return client
}
