import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = 'https://qktrfgxocmemivtwcink.supabase.co' 
// const supabaseKey = 'sb_publishable_7NICQC4zdbCM5Pk9rKfPBg_YypmqNRD'

// export const supabase = createClient(supabaseUrl, supabaseKey)

export const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)

