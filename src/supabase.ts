import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'public'

const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder',
  {
    db: {
      schema: supabaseSchema,
    },
  }
)

export const hasSupabaseConfig = isConfigured


