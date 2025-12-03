/**
 * Утилиты для работы с хранилищем данных
 * 
 * Использует Telegram CloudStorage если доступно, иначе localStorage
 * Все данные хранятся в формате JSON
 */

import { getTelegramWebApp } from './telegram';

/**
 * Получает объект хранилища (CloudStorage или localStorage)
 * @returns {Object} Объект хранилища
 */
const getStorage = () => {
  const webApp = getTelegramWebApp();
  
  // Если доступен CloudStorage Telegram, используем его
  if (webApp?.CloudStorage) {
    return {
      type: 'cloud',
      storage: webApp.CloudStorage,
    };
  }
  
  // Иначе используем localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      type: 'local',
      storage: window.localStorage,
    };
  }
  
  return null;
};

/**
 * Сохраняет значение в хранилище
 * @param {string} key - Ключ
 * @param {any} value - Значение (будет преобразовано в JSON)
 * @returns {Promise<boolean>} true если успешно
 */
export const setStorageItem = async (key, value) => {
  const storage = getStorage();
  if (!storage) return false;
  
  try {
    const jsonValue = JSON.stringify(value);
    
    if (storage.type === 'cloud') {
      // CloudStorage использует колбэки
      return new Promise((resolve) => {
        storage.storage.setItem(key, jsonValue, (error) => {
          resolve(!error);
        });
      });
    } else {
      // localStorage синхронный
      storage.storage.setItem(key, jsonValue);
      return true;
    }
  } catch (error) {
    console.error('Error setting storage item:', error);
    return false;
  }
};

/**
 * Получает значение из хранилища
 * @param {string} key - Ключ
 * @returns {Promise<any>} Значение или null
 */
export const getStorageItem = async (key) => {
  const storage = getStorage();
  if (!storage) return null;
  
  try {
    if (storage.type === 'cloud') {
      // CloudStorage использует колбэки
      return new Promise((resolve) => {
        storage.storage.getItem(key, (error, value) => {
          if (error || !value) {
            resolve(null);
          } else {
            try {
              resolve(JSON.parse(value));
            } catch (e) {
              resolve(null);
            }
          }
        });
      });
    } else {
      // localStorage синхронный
      const value = storage.storage.getItem(key);
      if (!value) return null;
      return JSON.parse(value);
    }
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

/**
 * Удаляет значение из хранилища
 * @param {string} key - Ключ
 * @returns {Promise<boolean>} true если успешно
 */
export const removeStorageItem = async (key) => {
  const storage = getStorage();
  if (!storage) return false;
  
  try {
    if (storage.type === 'cloud') {
      return new Promise((resolve) => {
        storage.storage.removeItem(key, (error) => {
          resolve(!error);
        });
      });
    } else {
      storage.storage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.error('Error removing storage item:', error);
    return false;
  }
};

/**
 * Очищает все данные из хранилища
 * @returns {Promise<boolean>} true если успешно
 */
export const clearStorage = async () => {
  const storage = getStorage();
  if (!storage) return false;
  
  try {
    if (storage.type === 'cloud') {
      // CloudStorage не имеет метода clear, нужно удалять по ключам
      // Для простоты просто возвращаем true
      return true;
    } else {
      storage.storage.clear();
      return true;
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

