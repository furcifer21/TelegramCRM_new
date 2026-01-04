/**
 * Утилиты для работы с Telegram на сервере (API routes)
 * 
 * Парсит данные инициализации Telegram для получения user_id
 */

/**
 * Получает user_id из данных инициализации Telegram
 * @param {string} initData - Строка с данными инициализации Telegram (из заголовка или body)
 * @returns {string|null} - user_id или null, если не найден
 */
export function getUserIdFromInitData(initData) {
  if (!initData) return null;
  
  try {
    // Парсим query string
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      return user.id?.toString() || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing Telegram init data:', error);
    return null;
  }
}

/**
 * Получает user_id из запроса (из заголовка или body)
 * @param {Object} req - Request объект из Next.js API route
 * @returns {string|null} - user_id или null
 */
export function getUserIdFromRequest(req) {
  // Пробуем получить из заголовка
  const initDataFromHeader = req.headers['x-telegram-init-data'] || req.headers['x-telegram-init-data'.toLowerCase()];
  if (initDataFromHeader) {
    const userId = getUserIdFromInitData(initDataFromHeader);
    if (userId) return userId;
  }
  
  // Пробуем получить из body (если клиент отправляет)
  if (req.body?.initData) {
    const userId = getUserIdFromInitData(req.body.initData);
    if (userId) return userId;
  }
  
  // Пробуем получить напрямую из body (если клиент отправляет user_id)
  if (req.body?.user_id) {
    return req.body.user_id.toString();
  }
  
  return null;
}

