import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xiwwboyozcbflldgnsmz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpd3dib3lvemNiZmxsZGduc216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM1MTYsImV4cCI6MjA2NDcxOTUxNn0.6UlKagvbR1tBMBp4bY_3qytcwFxDFcS7HcibHMd5K-s'

export const supabase = createClient(supabaseUrl, supabaseKey)

