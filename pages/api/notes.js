/**
 * API endpoint для работы с заметками
 * 
 * GET /api/notes - получить все заметки (опционально фильтр по client_id)
 * POST /api/notes - создать заметку
 * DELETE /api/notes/[id] - удалить заметку
 */

import { createSupabaseClient } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const supabase = createSupabaseClient();
    switch (method) {
      case 'GET': {
        const { client_id } = req.query;
        
        let query = supabase.from('notes').select('*');
        
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
        
        const { data, error } = await supabase
          .from('notes')
          .insert([
            {
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

