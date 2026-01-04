/**
 * API endpoint для работы с настройками
 * 
 * GET /api/settings - получить настройки пользователя
 * POST /api/settings - сохранить настройки пользователя
 */

import { createSupabaseClient } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const supabase = createSupabaseClient();
    switch (method) {
      case 'GET': {
        // Получаем настройки (можно добавить user_id позже для мультипользовательского режима)
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', 'default') // Пока используем default, позже можно добавить user_id из Telegram
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }
        
        // Если настроек нет, возвращаем значения по умолчанию
        if (!data) {
          return res.status(200).json({
            notifications: true,
            sound: true,
            language: 'ru',
            theme: 'auto',
          });
        }
        
        return res.status(200).json(data);
      }
      
      case 'POST': {
        const { notifications, sound, language, theme } = req.body;
        
        const settingsData = {
          user_id: 'default', // Пока используем default
          notifications: notifications !== undefined ? notifications : true,
          sound: sound !== undefined ? sound : true,
          language: language || 'ru',
          theme: theme || 'auto',
        };
        
        // Используем upsert для создания или обновления
        const { data, error } = await supabase
          .from('settings')
          .upsert(settingsData, {
            onConflict: 'user_id',
          })
          .select()
          .single();
        
        if (error) throw error;
        return res.status(200).json(data);
      }
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

