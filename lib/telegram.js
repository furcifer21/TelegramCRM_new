/**
 * Утилиты для работы с Telegram WebApp API
 * 
 * Telegram Mini App предоставляет доступ к WebApp API через объект window.Telegram.WebApp
 * Этот файл содержит функции для удобной работы с API
 */

/**
 * Получает объект Telegram WebApp
 * @returns Объект Telegram WebApp или null, если не запущено в Telegram
 */
export const getTelegramWebApp = () => {
  // Проверяем, запущено ли приложение внутри Telegram
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

/**
 * Инициализирует Telegram WebApp
 * Вызывается при загрузке приложения
 */
export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  
  if (webApp) {
    // Уведомляем Telegram, что приложение готово
    webApp.ready();
    
    // Разворачиваем приложение на весь экран
    webApp.expand();
    
    // Применяем цвета темы Telegram к CSS переменным
    if (webApp.themeParams) {
      const root = document.documentElement;
      const theme = webApp.themeParams;
      
      if (theme.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
      }
      if (theme.text_color) {
        root.style.setProperty('--tg-theme-text-color', theme.text_color);
      }
      if (theme.hint_color) {
        root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
      }
      if (theme.link_color) {
        root.style.setProperty('--tg-theme-link-color', theme.link_color);
      }
      if (theme.button_color) {
        root.style.setProperty('--tg-theme-button-color', theme.button_color);
      }
      if (theme.button_text_color) {
        root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
      }
      if (theme.secondary_bg_color) {
        root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
      }
    }
  }
};

/**
 * Получает данные пользователя из Telegram
 * @returns Данные пользователя или null
 */
export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

/**
 * Проверяет, запущено ли приложение внутри Telegram
 * @returns true, если запущено в Telegram, иначе false
 */
export const isTelegramWebApp = () => {
  return getTelegramWebApp() !== null;
};

