/**
 * Утилиты для работы с Telegram Bot API
 * 
 * Отправка сообщений пользователям через Telegram Bot API
 */

/**
 * Отправляет сообщение пользователю через Telegram Bot API
 * @param {string} chatId - ID чата пользователя (user_id из Telegram)
 * @param {string} text - Текст сообщения
 * @returns {Promise<Object>} Результат отправки
 */
export async function sendTelegramMessage(chatId, text) {
  const botToken = process.env.BOT_SECRET || process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('BOT_SECRET или TELEGRAM_BOT_TOKEN не настроен в переменных окружения');
  }
  
  if (!chatId) {
    throw new Error('chatId обязателен для отправки сообщения');
  }
  
  if (!text || !text.trim()) {
    throw new Error('Текст сообщения обязателен');
  }
  
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      throw new Error(data.description || `Ошибка отправки сообщения: ${response.status}`);
    }
    
    return {
      success: true,
      messageId: data.result.message_id,
    };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

/**
 * Форматирует текст напоминания для отправки
 * @param {Object} reminder - Объект напоминания
 * @param {string} clientName - Имя клиента (опционально)
 * @returns {string} Отформатированный текст
 */
export function formatReminderMessage(reminder, clientName = null) {
  let message = '🔔 <b>Напоминание</b>\n\n';
  message += `${reminder.text}\n\n`;
  
  if (clientName) {
    message += `👤 Клиент: ${clientName}\n`;
  }
  
  const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
  const formattedDate = reminderDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  message += `📅 ${formattedDate}`;
  
  return message;
}

