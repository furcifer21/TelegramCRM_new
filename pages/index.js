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
import { getClients, getReminders, getActiveReminders, getNotes } from '../lib/crm';
import { useLoader } from '../contexts/LoaderContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { ClockIcon, FileTextIcon, UsersIcon, PlusIcon } from '../components/Icons';

export default function Home() {
  const router = useRouter();
  const [user] = useState(getTelegramUser());
  const { setLoading: setGlobalLoading } = useLoader();
  const [stats, setStats] = useState({
    clientsCount: 0,
    remindersCount: 0,
    activeRemindersCount: 0,
    notesCount: 0,
    todayRemindersCount: 0,
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
    setGlobalLoading(true);
    try {
      const [clients, reminders, activeReminders, notes] = await Promise.all([
        getClients(),
        getReminders(),
        getActiveReminders(),
        getNotes()
      ]);
      
      // Подсчитываем напоминания на сегодня
      const today = new Date().toISOString().split('T')[0];
      const todayReminders = reminders.filter(reminder => reminder.date === today);
      
      setStats({
        clientsCount: clients.length,
        remindersCount: reminders.length,
        activeRemindersCount: activeReminders.length,
        notesCount: notes.length,
        todayRemindersCount: todayReminders.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
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
  
  /**
   * Переход на страницу всех напоминаний
   */
  const handleViewReminders = () => {
    router.push('/reminders');
  };
  
  /**
   * Переход на страницу всех заметок
   */
  const handleViewNotes = () => {
    router.push('/notes');
  };
  
  /**
   * Переход на страницу создания заметки
   */
  const handleCreateNote = () => {
    router.push('/notes/new');
  };
  
  return (
    <div className="home">
      <h1 className="home-title">
        {user ? `Привет, ${user.first_name}!` : 'CRM система'}
      </h1>
      
      {/* Напоминания сегодня */}
      <Card>
        <h2 className="home-card-title">Напоминания сегодня</h2>
        {!loading && (
          <div className="home-today-reminders">
            <span className="today-reminders-value">{stats.todayRemindersCount}</span>
            <span className="today-reminders-label">
              {stats.todayRemindersCount === 1 
                ? 'напоминание' 
                : stats.todayRemindersCount > 1 && stats.todayRemindersCount < 5
                ? 'напоминания'
                : 'напоминаний'}
            </span>
          </div>
        )}
      </Card>
      
      {/* Клиенты */}
      <Card>
        <h2 className="home-card-title">Клиенты ({stats.clientsCount})</h2>
        <div className="home-actions">
          <Button onClick={handleAddClient} className="action-button">
            <PlusIcon className="action-icon" />
            Добавить клиента
          </Button>
          <Button onClick={handleViewClients} variant="secondary" className="action-button">
            <UsersIcon className="action-icon" />
            Все клиенты
          </Button>
        </div>
      </Card>
      
      {/* Напоминания */}
      <Card>
        <h2 className="home-card-title">Напоминания</h2>
        <div className="home-actions">
          <Button onClick={handleViewReminders} variant="secondary" className="action-button">
            <ClockIcon className="action-icon" />
            Все напоминания
          </Button>
          <Button onClick={handleCreateReminder} variant="secondary" className="action-button">
            <PlusIcon className="action-icon" />
            Создать напоминание
          </Button>
        </div>
      </Card>
      
      {/* Заметки */}
      <Card>
        <h2 className="home-card-title">Заметки</h2>
        <div className="home-actions">
          <Button onClick={handleViewNotes} variant="secondary" className="action-button">
            <FileTextIcon className="action-icon" />
            Все заметки
          </Button>
          <Button onClick={handleCreateNote} variant="secondary" className="action-button">
            <PlusIcon className="action-icon" />
            Создать заметку
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

