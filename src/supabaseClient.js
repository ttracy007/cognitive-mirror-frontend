import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qktrfgxocmemivtwcink.supabase.co' 
const supabaseKey = 'sb_publishable_7NICQC4zdbCM5Pk9rKfPBg_YypmqNRD'

export const supabase = createClient(supabaseUrl, supabaseKey)

