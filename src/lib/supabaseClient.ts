import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isSupabaseConfigured = Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim())

if (!isSupabaseConfigured) {
  console.warn(
    '[36Chambers] Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as GitHub Actions secrets to enable the booking system.',
  )
}

// Use placeholder values when env vars are missing so the module doesn't
// throw at load time (which would crash React before it can mount).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)
