// pages/api/cron.js
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '../../lib/telegram-bot';

// ИСПРАВЛЕНО: используем ваши переменные
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Создаем клиент.
// ВНИМАНИЕ: С public ключом этот скрипт увидит только те данные,
// которые разрешены политиками RLS (Row Level Security) для анонимных пользователей.
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const debugLog = [];

    try {
        // 1. Проверяем Токен
        const token = process.env.BOT_SECRET;
        if (!token) {
            throw new Error("BOT_SECRET не найден в .env");
        }
        debugLog.push(`Bot Token loaded: ${token.substring(0, 5)}...`);

        const now = new Date();

        // 2. Получаем напоминания
        // Ищем записи, где notified = false и archived = false
        const { data: reminders, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('notified', false)
            .eq('archived', false);

        if (error) {
            debugLog.push(`Supabase Error: ${JSON.stringify(error)}`);
            throw error;
        }

        debugLog.push(`Found ${reminders?.length || 0} reminders in DB`);

        const notificationsSent = [];

        // Если напоминаний нет, сразу выходим
        if (!reminders || reminders.length === 0) {
            return res.status(200).json({ success: true, message: "No reminders found", debug: debugLog });
        }

        // Фильтруем по времени
        const remindersToSend = reminders.filter(reminder => {
            if (!reminder.date || !reminder.time) return false;
            const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
            return reminderDate <= now;
        });

        debugLog.push(`Reminders ready due to time: ${remindersToSend.length}`);

        // 3. Отправляем
        for (const reminder of remindersToSend) {
            // Здесь предполагается, что поле user_id содержит Telegram ID (число)
            const userId = reminder.user_id;

            // Проверка на UUID (если ID выглядит как f47ac10b-..., то это ошибка архитектуры)
            const isUuid = typeof userId === 'string' && userId.includes('-');

            debugLog.push(`Processing Reminder ID: ${reminder.id}. Target UserID: ${userId} (Is UUID: ${isUuid})`);

            if (!userId) {
                debugLog.push(`ERROR: UserID is empty. Cannot send.`);
                continue;
            }

            if (isUuid) {
                debugLog.push(`WARNING: UserID looks like a UUID, not a Telegram ID. Telegram API will likely fail.`);
            }

            // Отправляем сообщение
            const result = await sendTelegramMessage(
                userId,
                `🔔 <b>Напоминание!</b>\n\n${reminder.text}`
            );

            if (result.success) {
                debugLog.push(`SUCCESS: Message sent to ${userId}`);

                // Помечаем как отправленное
                await supabase
                    .from('reminders')
                    .update({ notified: true, archived: true })
                    .eq('id', reminder.id);

                notificationsSent.push(reminder.id);
            } else {
                debugLog.push(`FAIL: Telegram Error for ${userId}: ${JSON.stringify(result.error)}`);
            }
        }

        res.status(200).json({
            success: true,
            sent_count: notificationsSent.length,
            debug: debugLog
        });

    } catch (error) {
        console.error('Cron error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            debug: debugLog
        });
    }
}