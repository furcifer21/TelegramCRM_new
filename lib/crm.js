/**
 * Утилиты для работы с данными CRM
 * 
 * Управляет клиентами, заметками и напоминаниями
 * Все данные хранятся в Supabase через API
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api';

/**
 * Преобразует поля клиента из snake_case в camelCase
 */
const transformClient = (client) => {
  if (!client) return null;
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    company: client.company,
    notes: client.notes,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  };
};

// ==================== КЛИЕНТЫ ====================

/**
 * Получает всех клиентов
 * @param {string} search - Поисковый запрос (опционально)
 * @returns {Promise<Array>} Массив клиентов
 */
export const getClients = async (search = '') => {
  const response = await apiGet('/api/clients', search ? { search } : {});
  if (!response.success) {
    throw new Error(response.error || 'Ошибка загрузки клиентов');
  }
  return (response.data || []).map(transformClient);
};

/**
 * Получает клиента по ID
 * @param {string} id - ID клиента
 * @returns {Promise<Object|null>} Клиент или null
 */
export const getClient = async (id) => {
  const response = await apiGet(`/api/clients/${id}`);
  if (!response.success) {
    if (response.error?.includes('не найден') || response.error?.includes('404')) {
      return null;
    }
    throw new Error(response.error || 'Ошибка загрузки клиента');
  }
  return transformClient(response.data);
};

/**
 * Создает нового клиента
 * @param {Object} clientData - Данные клиента
 * @returns {Promise<Object>} Созданный клиент
 */
export const createClient = async (clientData) => {
  const response = await apiPost('/api/clients', clientData);
  if (!response.success) {
    throw new Error(response.error || 'Ошибка создания клиента');
  }
  return transformClient(response.data);
};

/**
 * Обновляет клиента
 * @param {string} id - ID клиента
 * @param {Object} clientData - Новые данные клиента
 * @returns {Promise<Object|null>} Обновленный клиент или null
 */
export const updateClient = async (id, clientData) => {
  const response = await apiPut(`/api/clients/${id}`, clientData);
  if (!response.success) {
    if (response.error?.includes('не найден') || response.error?.includes('404')) {
      return null;
    }
    throw new Error(response.error || 'Ошибка обновления клиента');
  }
  return transformClient(response.data);
};

/**
 * Удаляет клиента
 * @param {string} id - ID клиента
 * @returns {Promise<boolean>} true если успешно
 */
export const deleteClient = async (id) => {
  const response = await apiDelete(`/api/clients/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Ошибка удаления клиента');
  }
  return true;
};

/**
 * Поиск клиентов по запросу
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} Массив найденных клиентов
 */
export const searchClients = async (query) => {
  if (!query) {
    return await getClients();
  }
  return await getClients(query);
};

// ==================== ЗАМЕТКИ ====================

/**
 * Получает все заметки
 * @param {string} clientId - ID клиента (опционально, для фильтрации)
 * @returns {Promise<Array>} Массив заметок
 */
export const getNotes = async (clientId = null) => {
  const params = clientId ? { client_id: clientId } : {};
  const response = await apiGet('/api/notes', params);
  if (!response.success) {
    throw new Error(response.error || 'Ошибка загрузки заметок');
  }
  // Преобразуем названия полей для совместимости
  return (response.data || []).map(note => ({
    id: note.id,
    clientId: note.client_id,
    text: note.text,
    createdAt: note.created_at,
  }));
};

/**
 * Получает заметки клиента
 * @param {string} clientId - ID клиента
 * @returns {Promise<Array>} Массив заметок клиента
 */
export const getClientNotes = async (clientId) => {
  return await getNotes(clientId);
};

/**
 * Создает новую заметку
 * @param {Object} noteData - Данные заметки
 * @returns {Promise<Object>} Созданная заметка
 */
export const createNote = async (noteData) => {
  const response = await apiPost('/api/notes', {
    client_id: noteData.clientId || null,
    text: noteData.text || '',
  });
  if (!response.success) {
    throw new Error(response.error || 'Ошибка создания заметки');
  }
  // Преобразуем названия полей для совместимости
  const note = response.data;
  return {
    id: note.id,
    clientId: note.client_id,
    text: note.text,
    createdAt: note.created_at,
  };
};

/**
 * Удаляет заметку
 * @param {string} id - ID заметки
 * @returns {Promise<boolean>} true если успешно
 */
export const deleteNote = async (id) => {
  const response = await apiDelete(`/api/notes/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Ошибка удаления заметки');
  }
  return true;
};

// ==================== НАПОМИНАНИЯ ====================

/**
 * Получает все напоминания
 * @param {string} clientId - ID клиента (опционально, для фильтрации)
 * @param {boolean} archived - Фильтр по архивированным (опционально)
 * @returns {Promise<Array>} Массив напоминаний
 */
export const getReminders = async (clientId = null, archived = null) => {
  const params = {};
  if (clientId) params.client_id = clientId;
  if (archived !== null) params.archived = archived;
  
  const response = await apiGet('/api/reminders', params);
  if (!response.success) {
    throw new Error(response.error || 'Ошибка загрузки напоминаний');
  }
  // Преобразуем названия полей для совместимости
  return (response.data || []).map(reminder => ({
    id: reminder.id,
    clientId: reminder.client_id,
    text: reminder.text,
    date: reminder.date,
    time: reminder.time,
    notified: reminder.notified,
    archived: reminder.archived,
    createdAt: reminder.created_at,
    archivedAt: reminder.archived_at,
  }));
};

/**
 * Получает напоминания клиента
 * @param {string} clientId - ID клиента
 * @returns {Promise<Array>} Массив напоминаний клиента
 */
export const getClientReminders = async (clientId) => {
  return await getReminders(clientId);
};

/**
 * Создает новое напоминание
 * @param {Object} reminderData - Данные напоминания
 * @returns {Promise<Object>} Созданное напоминание
 */
export const createReminder = async (reminderData) => {
  const response = await apiPost('/api/reminders', {
    client_id: reminderData.clientId || null,
    text: reminderData.text || '',
    date: reminderData.date || new Date().toISOString().split('T')[0],
    time: reminderData.time || '09:00',
  });
  if (!response.success) {
    throw new Error(response.error || 'Ошибка создания напоминания');
  }
  // Преобразуем названия полей для совместимости
  const reminder = response.data;
  return {
    id: reminder.id,
    clientId: reminder.client_id,
    text: reminder.text,
    date: reminder.date,
    time: reminder.time,
    notified: reminder.notified,
    archived: reminder.archived,
    createdAt: reminder.created_at,
    archivedAt: reminder.archived_at,
  };
};

/**
 * Обновляет напоминание
 * @param {string} id - ID напоминания
 * @param {Object} reminderData - Новые данные напоминания
 * @returns {Promise<Object|null>} Обновленное напоминание или null
 */
export const updateReminder = async (id, reminderData) => {
  const response = await apiPut(`/api/reminders/${id}`, reminderData);
  if (!response.success) {
    if (response.error?.includes('не найдено') || response.error?.includes('404')) {
      return null;
    }
    throw new Error(response.error || 'Ошибка обновления напоминания');
  }
  // Преобразуем названия полей для совместимости
  const reminder = response.data;
  return {
    id: reminder.id,
    clientId: reminder.client_id,
    text: reminder.text,
    date: reminder.date,
    time: reminder.time,
    notified: reminder.notified,
    archived: reminder.archived,
    createdAt: reminder.created_at,
    archivedAt: reminder.archived_at,
  };
};

/**
 * Удаляет напоминание
 * @param {string} id - ID напоминания
 * @returns {Promise<boolean>} true если успешно
 */
export const deleteReminder = async (id) => {
  const response = await apiDelete(`/api/reminders/${id}`);
  if (!response.success) {
    throw new Error(response.error || 'Ошибка удаления напоминания');
  }
  return true;
};

/**
 * Получает активные напоминания (которые нужно показать)
 * @returns {Promise<Array>} Массив активных напоминаний
 */
export const getActiveReminders = async () => {
  const reminders = await getReminders(null, false);
  const now = new Date();
  
  return reminders.filter(reminder => {
    if (reminder.notified) return false;
    
    // Создаем дату и время напоминания
    const reminderDate = new Date(reminder.date);
    const [hours, minutes] = reminder.time.split(':');
    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Проверяем, прошло ли время напоминания
    return reminderDate <= now;
  });
};

/**
 * Получает все активные (неархивные) напоминания
 * @returns {Promise<Array>} Массив активных напоминаний
 */
export const getNonArchivedReminders = async () => {
  return await getReminders(null, false);
};

/**
 * Получает архивные напоминания
 * @returns {Promise<Array>} Массив архивных напоминаний
 */
export const getArchivedReminders = async () => {
  return await getReminders(null, true);
};

/**
 * Помечает напоминание как уведомленное и архивирует его
 * @param {string} id - ID напоминания
 * @returns {Promise<boolean>} true если успешно
 */
export const markReminderAsNotified = async (id) => {
  const result = await updateReminder(id, { 
    notified: true, 
    archived: true,
  });
  return result !== null;
};

