/**
 * Утилиты для взаимодействия с API
 * 
 * Все запросы идут к локальным API endpoints в /pages/api
 */

import { getTelegramWebApp } from './telegram';

/**
 * Получает user_id из Telegram WebApp
 * @returns {string|null} - user_id или null
 */
function getUserId() {
  const webApp = getTelegramWebApp();
  const user = webApp?.initDataUnsafe?.user;
  return user?.id?.toString() || null;
}

/**
 * Выполняет запрос к API
 * 
 * @param {string} endpoint - Endpoint API (например, '/api/clients')
 * @param {Object} options - Опции запроса (method, body, headers и т.д.)
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Получаем user_id из Telegram и добавляем в body
    const userId = getUserId();
    const body = options.body ? JSON.parse(options.body) : {};
    
    // Добавляем user_id в body, если он есть
    // Если user_id нет (локальная разработка), API вернет ошибку 401
    if (userId) {
      body.user_id = userId;
    }
    
    // Также отправляем initData в заголовке для серверной проверки
    const webApp = getTelegramWebApp();
    const initData = webApp?.initData || '';
    
    const headers = {
      'Content-Type': 'application/json',
      ...(initData && { 'X-Telegram-Init-Data': initData }),
      ...options.headers,
    };
    
    // Если body был пустым, не отправляем его
    const requestBody = Object.keys(body).length > 0 ? JSON.stringify(body) : options.body;
    
    const response = await fetch(endpoint, {
      ...options,
      headers,
      body: requestBody,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API request error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * GET запрос к API
 * 
 * @param {string} endpoint - Endpoint API
 * @param {Object} params - Query параметры
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiGet(endpoint, params = {}) {
  // Получаем user_id из Telegram и добавляем в query параметры
  const userId = getUserId();
  if (userId) {
    params.user_id = userId;
  }
  
  // Также отправляем initData в заголовке для серверной проверки
  const webApp = getTelegramWebApp();
  const initData = webApp?.initData || '';
  
  const headers = {
    'Content-Type': 'application/json',
    ...(initData && { 'X-Telegram-Init-Data': initData }),
  };
  
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API request error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * POST запрос к API
 * 
 * @param {string} endpoint - Endpoint API
 * @param {any} body - Тело запроса (будет автоматически преобразовано в JSON)
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiPost(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT запрос к API
 * 
 * @param {string} endpoint - Endpoint API
 * @param {any} body - Тело запроса
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiPut(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE запрос к API
 * 
 * @param {string} endpoint - Endpoint API
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: 'DELETE',
  });
}

