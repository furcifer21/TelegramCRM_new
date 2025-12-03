/**
 * Пример API Route в Next.js
 * 
 * Этот файл демонстрирует, как создать API endpoint на бэкенде
 * для взаимодействия с Telegram Mini App
 * 
 * В production вы можете использовать отдельный бэкенд сервер
 * (Node.js, Python, Go и т.д.) вместо API Routes Next.js
 */

/**
 * Обработчик API запросов
 * 
 * @param {Object} req - Запрос от клиента
 * @param {Object} res - Ответ сервера
 * 
 * В заголовке запроса должен быть 'X-Telegram-Init-Data'
 * с данными инициализации Telegram для аутентификации
 */
export default async function handler(req, res) {
  // Разрешаем только GET и POST запросы
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }
  
  // Получаем данные инициализации Telegram из заголовка
  const initData = req.headers['x-telegram-init-data'];
  
  // ВАЖНО: Проверяем подпись данных инициализации Telegram
  // Это необходимо для безопасности - убедитесь, что запрос пришел от Telegram
  if (!initData) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing Telegram init data',
    });
  }
  
  // Здесь должна быть проверка подписи данных
  // Используйте секретный ключ бота для проверки
  // Пример проверки (упрощенный):
  // const isValid = validateTelegramInitData(initData, BOT_SECRET);
  // if (!isValid) {
  //   return res.status(401).json({ success: false, error: 'Invalid signature' });
  // }
  
  // Парсим данные инициализации (упрощенный пример)
  // В реальном приложении используйте библиотеку для парсинга
  let userId = null;
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    if (userParam) {
      const user = JSON.parse(userParam);
      userId = user.id?.toString();
    }
  } catch (error) {
    console.error('Error parsing init data:', error);
  }
  
  // Обработка GET запроса
  if (req.method === 'GET') {
    // Пример: получение данных пользователя
    return res.status(200).json({
      success: true,
      data: {
        message: 'Данные успешно получены',
        userId: userId,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  // Обработка POST запроса
  if (req.method === 'POST') {
    // Получаем тело запроса
    const body = req.body;
    
    // Пример: сохранение данных
    // В реальном приложении здесь будет сохранение в базу данных
    return res.status(200).json({
      success: true,
      message: 'Данные успешно сохранены',
      data: {
        userId: userId,
        receivedData: body,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * ПРИМЕЧАНИЯ ПО БЕЗОПАСНОСТИ:
 * 
 * 1. ВСЕГДА проверяйте подпись данных инициализации Telegram
 *    Используйте секретный ключ бота для проверки HMAC-SHA256 подписи
 * 
 * 2. НЕ доверяйте данным от клиента без проверки
 *    Всегда проверяйте userId и другие данные на сервере
 * 
 * 3. Используйте HTTPS в production
 *    Telegram требует HTTPS для Mini Apps
 * 
 * 4. Валидируйте все входящие данные
 *    Проверяйте типы, форматы и ограничения данных
 * 
 * 5. Используйте rate limiting
 *    Ограничивайте количество запросов от одного пользователя
 * 
 * ПРИМЕР ПРОВЕРКИ ПОДПИСИ (Node.js):
 * 
 * const crypto = require('crypto');
 * 
 * function validateTelegramInitData(initData, botSecret) {
 *   const urlParams = new URLSearchParams(initData);
 *   const hash = urlParams.get('hash');
 *   urlParams.delete('hash');
 *   
 *   const dataCheckString = Array.from(urlParams.entries())
 *     .sort(([a], [b]) => a.localeCompare(b))
 *     .map(([key, value]) => `${key}=${value}`)
 *     .join('\n');
 *   
 *   const secretKey = crypto.createHmac('sha256', 'WebAppData')
 *     .update(botSecret)
 *     .digest();
 *   
 *   const calculatedHash = crypto.createHmac('sha256', secretKey)
 *     .update(dataCheckString)
 *     .digest('hex');
 *   
 *   return calculatedHash === hash;
 * }
 */

