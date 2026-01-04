/**
 * Компонент Layout - основной макет приложения
 * 
 * Этот компонент оборачивает все страницы и предоставляет:
 * - Общую структуру приложения
 * - Навигацию между страницами
 * - Инициализацию Telegram WebApp
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { initTelegramWebApp, getTelegramWebApp } from '../lib/telegram';
import { getActiveReminders, markReminderAsNotified } from '../lib/crm';
import Navigation from './Navigation';
import Loader from './Loader';
import { LoaderProvider, useLoader } from '../contexts/LoaderContext';

function LayoutContent({ children }) {
  const router = useRouter();
  const { setLoading } = useLoader();
  
  // Управление лоадером при переходах между страницами
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setLoading(true);
    };
    
    const handleRouteChangeComplete = () => {
      setLoading(false);
    };
    
    const handleRouteChangeError = () => {
      setLoading(false);
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router, setLoading]);
  
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
            // Формируем текст сообщения
            const messageText = `⏰ Событие\n\n${reminder.text || 'У вас есть событие!'}`;
            
            // Показываем уведомление в чате через showAlert
            webApp.showAlert(messageText);
            
            // Отправляем данные в бота (если бэкенд настроен)
            // webApp.sendData(JSON.stringify({ type: 'reminder', id: reminder.id, text: reminder.text }));
            
            // Помечаем как уведомленное и архивируем
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
  
  const { loading } = useLoader();
  
  return (
    <div className="layout">
      {/* Лоадер */}
      <Loader show={loading} />
      
      {/* Основной контент страницы */}
      <main className="layout-main">
        {children}
      </main>
      
      {/* Навигация внизу экрана */}
      <Navigation currentPath={router.pathname} />
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <LoaderProvider>
      <LayoutContent>{children}</LayoutContent>
    </LoaderProvider>
  );
}

