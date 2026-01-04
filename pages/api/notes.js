/**
 * API endpoint для работы с заметками
 * 
 * GET /api/notes - получить все заметки (опционально фильтр по client_id)
 * POST /api/notes - создать заметку
 * DELETE /api/notes/[id] - удалить заметку
 */

import { createSupabaseClient } from '../../lib/supabase';
import { getUserIdFromRequest } from '../../lib/telegram-server';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // Получаем user_id из запроса (из query параметров для GET или из body/header для POST)
    let userId = getUserIdFromRequest(req);
    
    // Для GET запросов также проверяем query параметры
    if (!userId && method === 'GET') {
      userId = req.query.user_id || null;
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID не найден. Приложение должно быть запущено в Telegram.' });
    }
    
    const supabase = createSupabaseClient();
    switch (method) {
      case 'GET': {
        const { client_id } = req.query;
        
        let query = supabase.from('notes').select('*').eq('user_id', userId);
        
        if (client_id) {
          query = query.eq('client_id', client_id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      
      case 'POST': {
        const { client_id, text } = req.body;
        
        if (!text || !text.trim()) {
          return res.status(400).json({ error: 'Текст заметки обязателен' });
        }
        
        // Если указан client_id, проверяем, что клиент принадлежит пользователю
        if (client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('id', client_id)
            .eq('user_id', userId)
            .single();
          
          if (!client) {
            return res.status(404).json({ error: 'Клиент не найден или не принадлежит вам' });
          }
        }
        
        const { data, error } = await supabase
          .from('notes')
          .insert([
            {
              user_id: userId,
              client_id: client_id || null,
              text: text.trim(),
            }
          ])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(data);
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

