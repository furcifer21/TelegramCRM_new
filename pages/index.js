/**
 * Главная страница CRM системы
 * 
 * Предоставляет быстрый доступ к основным функциям:
 * - Добавление клиента
 * - Просмотр всех клиентов
 * - Создание напоминания
 * - Статистика
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTelegramUser, getTelegramWebApp } from '../lib/telegram';
import { getClients, getReminders, getActiveReminders } from '../lib/crm';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Home() {
  const router = useRouter();
  const [user] = useState(getTelegramUser());
  const [stats, setStats] = useState({
    clientsCount: 0,
    remindersCount: 0,
    activeRemindersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  
  const webApp = getTelegramWebApp();
  
  // Загружаем статистику при загрузке страницы
  useEffect(() => {
    loadStats();
    
    // Проверяем активные напоминания каждую минуту
    const interval = setInterval(() => {
      checkActiveReminders();
    }, 60000); // Каждую минуту
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Загружает статистику (количество клиентов, напоминаний)
   */
  const loadStats = async () => {
    setLoading(true);
    try {
      const clients = await getClients();
      const reminders = await getReminders();
      const activeReminders = await getActiveReminders();
      
      setStats({
        clientsCount: clients.length,
        remindersCount: reminders.length,
        activeRemindersCount: activeReminders.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Проверяет активные напоминания и показывает уведомления
   */
  const checkActiveReminders = async () => {
    try {
      const activeReminders = await getActiveReminders();
      
      if (activeReminders.length > 0 && webApp) {
        // Показываем уведомление о напоминаниях
        const reminderText = activeReminders.length === 1
          ? activeReminders[0].text
          : `У вас ${activeReminders.length} активных напоминаний`;
        
        webApp.showAlert(reminderText);
        
        // Тактильная обратная связь
        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.notificationOccurred('success');
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };
  
  /**
   * Переход на страницу добавления клиента
   */
  const handleAddClient = () => {
    router.push('/client/new');
  };
  
  /**
   * Переход на страницу списка клиентов
   */
  const handleViewClients = () => {
    router.push('/clients');
  };
  
  /**
   * Переход на страницу создания напоминания
   */
  const handleCreateReminder = () => {
    router.push('/reminder/new');
  };
  
  return (
    <div className="home">
      <h1 className="home-title">
        {user ? `Привет, ${user.first_name}!` : 'CRM система'}
      </h1>
      
      {/* Статистика */}
      <Card>
        <h2 className="home-card-title">Статистика</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="home-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.clientsCount}</span>
              <span className="stat-label">Клиентов</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.remindersCount}</span>
              <span className="stat-label">Напоминаний</span>
            </div>
            {stats.activeRemindersCount > 0 && (
              <div className="stat-item stat-item-active">
                <span className="stat-value">{stats.activeRemindersCount}</span>
                <span className="stat-label">Активных</span>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Быстрые действия */}
      <Card>
        <h2 className="home-card-title">Быстрые действия</h2>
        <div className="home-actions">
          <Button onClick={handleAddClient} className="action-button">
            ➕ Добавить клиента
          </Button>
          <Button onClick={handleViewClients} variant="secondary" className="action-button">
            👥 Все клиенты
          </Button>
          <Button onClick={handleCreateReminder} variant="secondary" className="action-button">
            ⏰ Создать напоминание
          </Button>
        </div>
      </Card>
      
      {/* Информация о пользователе (если в Telegram) */}
      {user && (
        <Card>
          <h2 className="home-card-title">Профиль</h2>
          <div className="home-user-info">
            <p><strong>Имя:</strong> {user.first_name} {user.last_name || ''}</p>
            {user.username && <p><strong>Username:</strong> @{user.username}</p>}
          </div>
        </Card>
      )}
    </div>
  );
}

