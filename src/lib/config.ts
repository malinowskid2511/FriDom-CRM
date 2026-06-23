const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

export const demoMode =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('dashboard/project'))

export const skipAuth = demoMode || import.meta.env.VITE_SKIP_AUTH === 'true'
