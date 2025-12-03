/**
 * Компонент Layout - основной макет приложения
 * 
 * Этот компонент оборачивает все страницы и предоставляет:
 * - Общую структуру приложения
 * - Навигацию между страницами
 * - Инициализацию Telegram WebApp
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initTelegramWebApp, getTelegramWebApp } from '../lib/telegram';
import { getActiveReminders, markReminderAsNotified } from '../lib/crm';
import Navigation from './Navigation';

export default function Layout({ children }) {
  const router = useRouter();
  
  // Инициализируем Telegram WebApp при загрузке компонента
  useEffect(() => {
    // Инициализируем Telegram WebApp
    initTelegramWebApp();
    
    // Можно добавить обработчики событий Telegram
    const webApp = getTelegramWebApp();
    if (webApp) {
      // Обработчик изменения видимости (когда пользователь сворачивает/разворачивает приложение)
      webApp.onEvent('viewportChanged', () => {
        console.log('Viewport changed');
      });
      
      // Обработчик изменения темы
      webApp.onEvent('themeChanged', () => {
        console.log('Theme changed');
        // Перезагружаем страницу для применения новой темы
        window.location.reload();
      });
    }
    
    // Проверяем активные напоминания каждую минуту
    const checkReminders = async () => {
      try {
        const activeReminders = await getActiveReminders();
        
        if (activeReminders.length > 0 && webApp) {
          // Показываем уведомление для каждого активного напоминания
          for (const reminder of activeReminders) {
            // Показываем уведомление
            webApp.showAlert(reminder.text || 'У вас есть напоминание!');
            
            // Помечаем как уведомленное
            await markReminderAsNotified(reminder.id);
            
            // Тактильная обратная связь
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
          }
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };
    
    // Проверяем сразу при загрузке
    checkReminders();
    
    // Проверяем каждую минуту
    const reminderInterval = setInterval(checkReminders, 60000);
    
    // Cleanup при размонтировании компонента
    return () => {
      if (webApp) {
        webApp.offEvent('viewportChanged', () => {});
        webApp.offEvent('themeChanged', () => {});
      }
      clearInterval(reminderInterval);
    };
  }, []);
  
  return (
    <div className="layout">
      {/* Основной контент страницы */}
      <main className="layout-main">
        {children}
      </main>
      
      {/* Навигация внизу экрана */}
      <Navigation currentPath={router.pathname} />
    </div>
  );
}

