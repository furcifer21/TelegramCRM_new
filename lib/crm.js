/**
 * Утилиты для работы с данными CRM
 * 
 * Управляет клиентами, заметками и напоминаниями
 * Все данные хранятся в локальном хранилище
 */

import { getStorageItem, setStorageItem } from './storage';

// Ключи для хранения данных
const STORAGE_KEYS = {
  CLIENTS: 'crm_clients',
  NOTES: 'crm_notes',
  REMINDERS: 'crm_reminders',
};

/**
 * Генерирует уникальный ID
 * @returns {string} Уникальный ID
 */
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ==================== КЛИЕНТЫ ====================

/**
 * Получает всех клиентов
 * @returns {Promise<Array>} Массив клиентов
 */
export const getClients = async () => {
  const clients = await getStorageItem(STORAGE_KEYS.CLIENTS);
  return clients || [];
};

/**
 * Получает клиента по ID
 * @param {string} id - ID клиента
 * @returns {Promise<Object|null>} Клиент или null
 */
export const getClient = async (id) => {
  const clients = await getClients();
  return clients.find(client => client.id === id) || null;
};

/**
 * Создает нового клиента
 * @param {Object} clientData - Данные клиента
 * @returns {Promise<Object>} Созданный клиент
 */
export const createClient = async (clientData) => {
  const clients = await getClients();
  const newClient = {
    id: generateId(),
    name: clientData.name || '',
    phone: clientData.phone || '',
    email: clientData.email || '',
    company: clientData.company || '',
    notes: clientData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  clients.push(newClient);
  await setStorageItem(STORAGE_KEYS.CLIENTS, clients);
  return newClient;
};

/**
 * Обновляет клиента
 * @param {string} id - ID клиента
 * @param {Object} clientData - Новые данные клиента
 * @returns {Promise<Object|null>} Обновленный клиент или null
 */
export const updateClient = async (id, clientData) => {
  const clients = await getClients();
  const index = clients.findIndex(client => client.id === id);
  
  if (index === -1) return null;
  
  clients[index] = {
    ...clients[index],
    ...clientData,
    updatedAt: new Date().toISOString(),
  };
  
  await setStorageItem(STORAGE_KEYS.CLIENTS, clients);
  return clients[index];
};

/**
 * Удаляет клиента
 * @param {string} id - ID клиента
 * @returns {Promise<boolean>} true если успешно
 */
export const deleteClient = async (id) => {
  const clients = await getClients();
  const filteredClients = clients.filter(client => client.id !== id);
  await setStorageItem(STORAGE_KEYS.CLIENTS, filteredClients);
  
  // Также удаляем все заметки и напоминания этого клиента
  await deleteNotesByClientId(id);
  await deleteRemindersByClientId(id);
  
  return true;
};

/**
 * Поиск клиентов по запросу
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} Массив найденных клиентов
 */
export const searchClients = async (query) => {
  const clients = await getClients();
  if (!query) return clients;
  
  const lowerQuery = query.toLowerCase();
  return clients.filter(client => {
    return (
      client.name?.toLowerCase().includes(lowerQuery) ||
      client.phone?.includes(query) ||
      client.email?.toLowerCase().includes(lowerQuery) ||
      client.company?.toLowerCase().includes(lowerQuery)
    );
  });
};

// ==================== ЗАМЕТКИ ====================

/**
 * Получает все заметки
 * @returns {Promise<Array>} Массив заметок
 */
export const getNotes = async () => {
  const notes = await getStorageItem(STORAGE_KEYS.NOTES);
  return notes || [];
};

/**
 * Получает заметки клиента
 * @param {string} clientId - ID клиента
 * @returns {Promise<Array>} Массив заметок клиента
 */
export const getClientNotes = async (clientId) => {
  const notes = await getNotes();
  return notes.filter(note => note.clientId === clientId);
};

/**
 * Создает новую заметку
 * @param {Object} noteData - Данные заметки
 * @returns {Promise<Object>} Созданная заметка
 */
export const createNote = async (noteData) => {
  const notes = await getNotes();
  const newNote = {
    id: generateId(),
    clientId: noteData.clientId || null,
    text: noteData.text || '',
    createdAt: new Date().toISOString(),
  };
  
  notes.push(newNote);
  await setStorageItem(STORAGE_KEYS.NOTES, notes);
  return newNote;
};

/**
 * Удаляет заметку
 * @param {string} id - ID заметки
 * @returns {Promise<boolean>} true если успешно
 */
export const deleteNote = async (id) => {
  const notes = await getNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  await setStorageItem(STORAGE_KEYS.NOTES, filteredNotes);
  return true;
};

/**
 * Удаляет все заметки клиента
 * @param {string} clientId - ID клиента
 * @returns {Promise<boolean>} true если успешно
 */
const deleteNotesByClientId = async (clientId) => {
  const notes = await getNotes();
  const filteredNotes = notes.filter(note => note.clientId !== clientId);
  await setStorageItem(STORAGE_KEYS.NOTES, filteredNotes);
  return true;
};

// ==================== НАПОМИНАНИЯ ====================

/**
 * Получает все напоминания
 * @returns {Promise<Array>} Массив напоминаний
 */
export const getReminders = async () => {
  const reminders = await getStorageItem(STORAGE_KEYS.REMINDERS);
  return reminders || [];
};

/**
 * Получает напоминания клиента
 * @param {string} clientId - ID клиента
 * @returns {Promise<Array>} Массив напоминаний клиента
 */
export const getClientReminders = async (clientId) => {
  const reminders = await getReminders();
  return reminders.filter(reminder => reminder.clientId === clientId);
};

/**
 * Создает новое напоминание
 * @param {Object} reminderData - Данные напоминания
 * @returns {Promise<Object>} Созданное напоминание
 */
export const createReminder = async (reminderData) => {
  const reminders = await getReminders();
  const newReminder = {
    id: generateId(),
    clientId: reminderData.clientId || null,
    text: reminderData.text || '',
    date: reminderData.date || new Date().toISOString(),
    time: reminderData.time || '09:00',
    notified: false,
    createdAt: new Date().toISOString(),
  };
  
  reminders.push(newReminder);
  await setStorageItem(STORAGE_KEYS.REMINDERS, reminders);
  return newReminder;
};

/**
 * Обновляет напоминание
 * @param {string} id - ID напоминания
 * @param {Object} reminderData - Новые данные напоминания
 * @returns {Promise<Object|null>} Обновленное напоминание или null
 */
export const updateReminder = async (id, reminderData) => {
  const reminders = await getReminders();
  const index = reminders.findIndex(reminder => reminder.id === id);
  
  if (index === -1) return null;
  
  reminders[index] = {
    ...reminders[index],
    ...reminderData,
  };
  
  await setStorageItem(STORAGE_KEYS.REMINDERS, reminders);
  return reminders[index];
};

/**
 * Удаляет напоминание
 * @param {string} id - ID напоминания
 * @returns {Promise<boolean>} true если успешно
 */
export const deleteReminder = async (id) => {
  const reminders = await getReminders();
  const filteredReminders = reminders.filter(reminder => reminder.id !== id);
  await setStorageItem(STORAGE_KEYS.REMINDERS, filteredReminders);
  return true;
};

/**
 * Удаляет все напоминания клиента
 * @param {string} clientId - ID клиента
 * @returns {Promise<boolean>} true если успешно
 */
const deleteRemindersByClientId = async (clientId) => {
  const reminders = await getReminders();
  const filteredReminders = reminders.filter(reminder => reminder.clientId !== clientId);
  await setStorageItem(STORAGE_KEYS.REMINDERS, filteredReminders);
  return true;
};

/**
 * Получает активные напоминания (которые нужно показать)
 * @returns {Promise<Array>} Массив активных напоминаний
 */
export const getActiveReminders = async () => {
  const reminders = await getReminders();
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
 * Помечает напоминание как уведомленное
 * @param {string} id - ID напоминания
 * @returns {Promise<boolean>} true если успешно
 */
export const markReminderAsNotified = async (id) => {
  return await updateReminder(id, { notified: true });
};

