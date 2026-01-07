import { createClient } from '@supabase/supabase-js'

// Substitua pela SUA URL do Supabase (Project Settings > API)
const supabaseUrl = 'https://qhpcqebnnktsmweixvbm.supabase.co'

// Substitua pela SUA CHAVE ANON (Project Settings > API)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocGNxZWJubmt0c213ZWl4dmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzA1MzgsImV4cCI6MjA4MzMwNjUzOH0.zhBWwd6_oLmRkXOSQUB3xTCEYOJA68O58gPGfxrjrXg'

export const supabase = createClient(supabaseUrl, supabaseKey)
