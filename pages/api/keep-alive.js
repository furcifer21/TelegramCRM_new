/**
 * API endpoint для keep-alive запросов к Supabase
 * 
 * Простой запрос к базе данных, чтобы предотвратить переход Supabase в режим сна
 * на бесплатном тарифе
 * 
 * GET /api/keep-alive - выполнить keep-alive запрос
 */

import { createSupabaseClient } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем наличие переменных окружения перед созданием клиента
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(200).json({ 
        success: true, 
        timestamp: new Date().toISOString(),
        note: 'Supabase not configured'
      });
    }
    
    const supabase = createSupabaseClient();
    
    // Выполняем простой запрос к базе данных
    // Используем таблицу settings, так как она всегда должна существовать
    const { error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    // Игнорируем ошибку, если таблица пустая или не существует
    // Главное - что запрос был выполнен
    
    return res.status(200).json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    // Даже при ошибке возвращаем успех, так как главная цель - keep-alive
    console.log('Keep-alive request:', error.message);
    return res.status(200).json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });
  }
}

