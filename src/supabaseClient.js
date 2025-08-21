import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qktrfgxocmemivtwcink.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHJmZ3hvY21lbWl2dHdjaW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTk4NjcsImV4cCI6MjA3MTIzNTg2N30.xkIVAn2IrbOHHGAeOnk8VWURPd8Xau8OfNy930cIMNI
'

export const supabase = createClient(supabaseUrl, supabaseKey)

