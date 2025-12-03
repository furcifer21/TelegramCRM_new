/**
 * Утилиты для взаимодействия с бэкендом
 * 
 * Этот файл содержит функции для отправки запросов на сервер
 * Все запросы должны включать данные инициализации Telegram для аутентификации
 */

import { getTelegramWebApp } from './telegram';

// Базовый URL вашего бэкенда
// В production замените на реальный URL вашего сервера
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.com/api';

/**
 * Выполняет запрос к API
 * 
 * @param {string} endpoint - Endpoint API (например, '/users/profile')
 * @param {Object} options - Опции запроса (method, body, headers и т.д.)
 * @returns {Promise<Object>} Promise с данными ответа
 * 
 * @example
 * // GET запрос
 * const data = await apiRequest('/users/profile');
 * 
 * @example
 * // POST запрос
 * const result = await apiRequest('/users/update', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 *   headers: { 'Content-Type': 'application/json' }
 * });
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Получаем данные инициализации Telegram
    const webApp = getTelegramWebApp();
    const initData = webApp?.initData || '';
    
    // Формируем полный URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Формируем заголовки запроса
    const headers = {
      'Content-Type': 'application/json',
      // Передаем данные инициализации Telegram для аутентификации на бэкенде
      // Бэкенд должен проверить подпись этих данных
      'X-Telegram-Init-Data': initData,
      ...options.headers,
    };
    
    // Выполняем запрос
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Парсим JSON ответ
    const data = await response.json();
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    // Обрабатываем ошибки
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
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiGet(endpoint) {
  return apiRequest(endpoint, {
    method: 'GET',
  });
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

/**
 * Примеры использования API функций:
 * 
 * // Получить профиль пользователя
 * const profileResponse = await apiGet('/users/profile');
 * if (profileResponse.success) {
 *   console.log('Profile:', profileResponse.data);
 * }
 * 
 * // Обновить профиль
 * const updateResponse = await apiPost('/users/update', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * 
 * // Удалить что-то
 * const deleteResponse = await apiDelete('/items/123');
 */

