import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from "@/types/supabase"

// Client-side Supabase client (singleton pattern)
let clientSupabaseClient: SupabaseClient<Database> | null = null

export const createClientSupabaseClient = (): SupabaseClient<Database> => {
  if (!clientSupabaseClient) {
    clientSupabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return clientSupabaseClient
}

// Server-side Supabase client with proper cookie handling
export const createServerSupabaseClient = (): SupabaseClient<Database> => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error if cookies can't be set
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error if cookies can't be removed
          }
        },
      },
    }
  )
}