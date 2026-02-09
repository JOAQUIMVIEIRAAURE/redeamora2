import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// URL DO SEU PROJETO (Extraída do código que você encontrou)
const SUPABASE_URL = 'https://ecnowtbiighmxgzgpmus.supabase.co';

// SUA CHAVE DE API (Extraída do código que você encontrou)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbm93dGJpaWdobXhnemdwbXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzU1MjcsImV4cCI6MjA4NjE1MTUyN30.na-g_3mKDbRe7q_JvLCVvFTn702uBEUx-4U0S-ghgDY';

// Verificação de segurança
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO CRÍTICO: Chave do Supabase não configurada!');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
