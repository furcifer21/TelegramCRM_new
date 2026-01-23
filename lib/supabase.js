/**
 * Утилита для работы с Supabase
 * * Создает клиент Supabase для серверной части и клиента
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Создает клиент Supabase
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createSupabaseClient() {
  // Получаем переменные окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // ИСПРАВЛЕНИЕ: Проверяем оба варианта названия ключа
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Check your .env.local file. Needed: NEXT_PUBLIC_SUPABASE_URL and (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}