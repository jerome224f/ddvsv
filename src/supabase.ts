import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fsulcmyiawcfzpurahoc.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0Ql0JXCEFCddEWoq2hf4Tg_VHljsH1I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

