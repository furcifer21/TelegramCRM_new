/**
 * API endpoint для работы с клиентами
 * 
 * GET /api/clients - получить всех клиентов
 * POST /api/clients - создать клиента
 * GET /api/clients/[id] - получить клиента по ID
 * PUT /api/clients/[id] - обновить клиента
 * DELETE /api/clients/[id] - удалить клиента
 */

import { createSupabaseClient } from '../../lib/supabase';
import { getUserIdFromRequest } from '../../lib/telegram-server';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // Получаем user_id из запроса
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID не найден. Приложение должно быть запущено в Telegram.' });
    }
    
    const supabase = createSupabaseClient();
    switch (method) {
      case 'GET': {
        const { id, search } = req.query;
        
        if (id) {
          // Получить одного клиента (только своего)
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
          
          if (error) throw error;
          if (!data) {
            return res.status(404).json({ error: 'Клиент не найден' });
          }
          return res.status(200).json(data);
        }
        
        // Получить всех клиентов пользователя
        let query = supabase.from('clients').select('*').eq('user_id', userId);
        
        // Поиск по имени, телефону, email, компании
        if (search) {
          query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
        }
        
        const { data, error } = await query.order('updated_at', { ascending: false });
        
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      
      case 'POST': {
        // Создать клиента
        const { name, phone, email, company, notes } = req.body;
        
        if (!name || !name.trim()) {
          return res.status(400).json({ error: 'Имя обязательно' });
        }
        
        const { data, error } = await supabase
          .from('clients')
          .insert([
            {
              user_id: userId,
              name: name.trim(),
              phone: phone || null,
              email: email || null,
              company: company || null,
              notes: notes || null,
            }
          ])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json(data);
      }
      
      case 'PUT': {
        // Обновить клиента
        const { id } = req.query;
        const { name, phone, email, company, notes } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'ID клиента обязателен' });
        }
        
        // Проверяем, что клиент принадлежит пользователю
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (!existingClient) {
          return res.status(404).json({ error: 'Клиент не найден или не принадлежит вам' });
        }
        
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
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: 'Клиент не найден' });
        }
        return res.status(200).json(data);
      }
      
      case 'DELETE': {
        // Удалить клиента
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'ID клиента обязателен' });
        }
        
        // Проверяем, что клиент принадлежит пользователю
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (!existingClient) {
          return res.status(404).json({ error: 'Клиент не найден или не принадлежит вам' });
        }
        
        // Сначала удаляем связанные заметки и напоминания
        await supabase.from('notes').delete().eq('client_id', id).eq('user_id', userId);
        await supabase.from('reminders').delete().eq('client_id', id).eq('user_id', userId);
        
        // Затем удаляем клиента
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    
    // Более детальная информация об ошибке для отладки
    const errorMessage = error.message || 'Internal server error';
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { 
          message: errorMessage,
          stack: error.stack,
          hint: error.hint || null
        }
      : { message: errorMessage };
    
    return res.status(500).json({ 
      error: errorMessage,
      ...errorDetails
    });
  }
}

