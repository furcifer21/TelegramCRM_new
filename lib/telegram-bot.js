// lib/telegram-bot.js

/**
 * Отправляет текстовое сообщение в Telegram через Bot API
 */
export const sendTelegramMessage = async (chatId, text) => {
    // ИСПРАВЛЕНО: используем вашу переменную BOT_SECRET
    const token = process.env.BOT_SECRET;

    if (!token) {
        console.error('BOT_SECRET is missing in .env');
        return false;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            // Логируем ошибку, чтобы видеть её в дебаге
            console.error('Telegram API Error:', data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Network Error sending Telegram message:', error);
        return { success: false, error: error.message };
    }
};