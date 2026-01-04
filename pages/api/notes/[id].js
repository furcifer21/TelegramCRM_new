/**
 * API endpoint для работы с конкретной заметкой
 * 
 * DELETE /api/notes/[id] - удалить заметку
 */

import { createSupabaseClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID заметки обязателен' });
  }

  try {
    const supabase = createSupabaseClient();
    
    switch (method) {
      case 'DELETE': {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      
      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

