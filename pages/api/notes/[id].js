/**
 * API endpoint для работы с конкретной заметкой
 * 
 * DELETE /api/notes/[id] - удалить заметку
 */

import { createSupabaseClient } from '../../../lib/supabase';
import { getUserIdFromRequest } from '../../../lib/telegram-server';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID заметки обязателен' });
  }

  try {
    // Получаем user_id из запроса
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID не найден. Приложение должно быть запущено в Telegram.' });
    }
    
    const supabase = createSupabaseClient();
    
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Заметка не найдена' });
        }
        return res.status(200).json(data);
      }
      
      case 'PUT': {
        // Проверяем, что заметка принадлежит пользователю
        const { data: existingNote } = await supabase
          .from('notes')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (!existingNote) {
          return res.status(404).json({ error: 'Заметка не найдена или не принадлежит вам' });
        }
        
        const updateData = {};
        const { text, client_id } = req.body;
        
        if (text !== undefined) updateData.text = text.trim();
        if (client_id !== undefined) updateData.client_id = client_id || null;
        
        const { data, error } = await supabase
          .from('notes')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Заметка не найдена' });
        }
        return res.status(200).json(data);
      }
      
      case 'DELETE': {
        // Проверяем, что заметка принадлежит пользователю
        const { data: existingNote } = await supabase
          .from('notes')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (!existingNote) {
          return res.status(404).json({ error: 'Заметка не найдена или не принадлежит вам' });
        }
        
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

