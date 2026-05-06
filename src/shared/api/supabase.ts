import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


//     Proyecto - Settings - API - Legacy ANON KEY
const SUPABASE_URL = 'https://bvvynuzqlbrelxegfffk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dnludXpxbGJyZWx4ZWdmZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTQyNDksImV4cCI6MjA5MjYzMDI0OX0.zYEVfXpR4_WNmA6_K3Jk1VBAPiaV1FZT8NRjJ7g9CPQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
