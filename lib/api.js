/**
 * Утилиты для взаимодействия с API
 * 
 * Все запросы идут к локальным API endpoints в /pages/api
 */

/**
 * Выполняет запрос к API
 * 
 * @param {string} endpoint - Endpoint API (например, '/api/clients')
 * @param {Object} options - Опции запроса (method, body, headers и т.д.)
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(endpoint, {
      ...options,
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
 * GET запрос к API
 * 
 * @param {string} endpoint - Endpoint API
 * @param {Object} params - Query параметры
 * @returns {Promise<Object>} Promise с данными ответа
 */
export async function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return apiRequest(url, {
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

