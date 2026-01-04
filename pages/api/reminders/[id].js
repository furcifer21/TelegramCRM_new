/**
 * API endpoint для работы с конкретным напоминанием
 * 
 * PUT /api/reminders/[id] - обновить напоминание
 * DELETE /api/reminders/[id] - удалить напоминание
 */

import { createSupabaseClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID напоминания обязателен' });
  }

  try {
    const supabase = createSupabaseClient();
    
    switch (method) {
      case 'PUT': {
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
          .select()
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Напоминание не найдено' });
        }
        return res.status(200).json(data);
      }
      
      case 'DELETE': {
        const { error } = await supabase
          .from('reminders')
          .delete()
          .eq('id', id);
        
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

