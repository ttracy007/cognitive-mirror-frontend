import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qktrfgxocmemivtwcink.supabase.co' 
const supabaseKey = 'sb_publishable_7NICQC4zdbCM5Pk9rKfPBg_YypmqNRD
Service Role Key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHJmZ3hvY21lbWl2dHdjaW5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1OTg2NywiZXhwIjoyMDcxMjM1ODY3fQ.V0M-WgHSoR3EPcMt9yvgh7zNPt11b5lnl177ntlEk-w'

export const supabase = createClient(supabaseUrl, supabaseKey)

