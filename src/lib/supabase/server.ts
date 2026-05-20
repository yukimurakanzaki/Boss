import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options?: Parameters<ReturnType<typeof cookies>['set']>[2]) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options?: Parameters<ReturnType<typeof cookies>['set']>[2]) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}