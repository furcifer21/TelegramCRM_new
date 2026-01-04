/**
 * API endpoint для работы с конкретным напоминанием
 * 
 * PUT /api/reminders/[id] - обновить напоминание
 * DELETE /api/reminders/[id] - удалить напоминание
 */

import { createSupabaseClient } from '../../../lib/supabase';
import { getUserIdFromRequest } from '../../../lib/telegram-server';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID напоминания обязателен' });
  }

  try {
    // Получаем user_id из запроса
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID не найден. Приложение должно быть запущено в Telegram.' });
    }
    
    const supabase = createSupabaseClient();
    
    switch (method) {
      case 'PUT': {
        // Проверяем, что напоминание принадлежит пользователю
        const { data: existingReminder } = await supabase
          .from('reminders')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (!existingReminder) {
          return res.status(404).json({ error: 'Напоминание не найдено или не принадлежит вам' });
        }
        
        const updateData = {};
        const { text, date, time, notified, archived } = req.body;
        
        if (text !== undefined) updateData.text = text.trim();
        if (date !== undefined) updateData.date = date;
        if (time !== undefined) updateData.time = time;
        if (notified !== undefined) updateData.notified = notified;
        if (archived !== undefined) {
          updateData.archived = archived;
          if (archived) {
            updateData.archived_at = new Date().toISOString();
          }
        }
        
        const { data, error } = await supabase
          .from('reminders')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Напоминание не найдено' });
        }
        return res.status(200).json(data);
      }
      
      case 'DELETE': {
        // Проверяем, что напоминание принадлежит пользователю
        const { data: existingReminder } = await supabase
          .from('reminders')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (!existingReminder) {
          return res.status(404).json({ error: 'Напоминание не найдено или не принадлежит вам' });
        }
        
        const { error } = await supabase
          .from('reminders')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

