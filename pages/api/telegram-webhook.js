/**
 * Telegram Webhook endpoint
 *
 * Этот endpoint принимает обновления от Telegram Bot API.
 * Нужен, чтобы:
 * - обработать команду /start link_<ownerId>_<clientId>
 * - сохранить telegram_chat_id клиента в таблице clients (Supabase)
 *
 * ВАЖНО:
 * 1) Установите webhook для бота:
 *    https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ВАШ_ДОМЕН/api/telegram-webhook
 * 2) BOT_TOKEN должен совпадать с BOT_SECRET в переменных окружения проекта.
 */

import { createSupabaseClient } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const update = req.body;

    if (!update) {
      return res.status(200).json({ ok: true });
    }

    const message = update.message || update.edited_message || null;

    // Нас интересуют только обычные сообщения с текстом
    if (!message || !message.text) {
      return res.status(200).json({ ok: true });
    }

    const text = message.text.trim();

    // Обрабатываем только /start с payload
    if (!text.startsWith('/start')) {
      return res.status(200).json({ ok: true });
    }

    // Форматы:
    // "/start"                       — без payload
    // "/start link_ownerId_clientId" — с payload
    const parts = text.split(' ');
    const payload = parts[1] || '';

    if (!payload.startsWith('link_')) {
      // Обычный /start без привязки к клиенту
      return res.status(200).json({ ok: true });
    }

    // payload: "link_ownerId_clientId"
    const [, ownerIdRaw, clientIdRaw] = payload.split('_');
    const ownerId = ownerIdRaw?.trim();
    const clientId = clientIdRaw?.trim();

    if (!ownerId || !clientId) {
      console.error('Invalid payload in /start:', payload);
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat?.id;
    const from = message.from || {};

    if (!chatId) {
      console.error('No chat.id in update');
      return res.status(200).json({ ok: true });
    }

    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from('clients')
      .update({
        telegram_chat_id: chatId.toString(),
        telegram_username: from.username || null,
        telegram_first_name: from.first_name || null,
        telegram_last_name: from.last_name || null,
      })
      .eq('id', clientId)
      .eq('user_id', ownerId.toString());

    if (error) {
      console.error('Error updating client telegram data:', error);
    }

    // Отвечать в чат бота не обязательно через вебхук, но можно
    // Здесь мы просто возвращаем ok, чтобы Telegram не ретраил запрос
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}

