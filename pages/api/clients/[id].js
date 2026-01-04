/**
 * API endpoint для работы с конкретным клиентом
 * 
 * GET /api/clients/[id] - получить клиента
 * PUT /api/clients/[id] - обновить клиента
 * DELETE /api/clients/[id] - удалить клиента
 */

import { createSupabaseClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID клиента обязателен' });
  }

  try {
    const supabase = createSupabaseClient();
    
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Клиент не найден' });
        }
        return res.status(200).json(data);
      }
      
      case 'PUT': {
        const { name, phone, email, company, notes } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone || null;
        if (email !== undefined) updateData.email = email || null;
        if (company !== undefined) updateData.company = company || null;
        if (notes !== undefined) updateData.notes = notes || null;
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Клиент не найден' });
        }
        return res.status(200).json(data);
      }
      
      case 'DELETE': {
        // Удаляем связанные заметки и напоминания
        await supabase.from('notes').delete().eq('client_id', id);
        await supabase.from('reminders').delete().eq('client_id', id);
        
        // Удаляем клиента
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);
        
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

