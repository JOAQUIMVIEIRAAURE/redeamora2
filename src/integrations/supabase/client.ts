import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usar variáveis de ambiente para URL e Chave
// Isso permite que o Lovable (e o Vite) injetem os valores corretos automaticamente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação de segurança (apenas para debug)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas! Verifique se o projeto está conectado corretamente.');
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

