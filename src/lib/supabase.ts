import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Card {
  id: string;
  code: string;
  sender_name: string;
  recipient_name: string;
  message: string;
  audio_url: string | null;
  theme: string;
  created_at: string;
  delivery_date: string | null;
}
