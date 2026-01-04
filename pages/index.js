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
import Modal from '../components/Modal';
import { ClockIcon, FileTextIcon, UsersIcon, PlusIcon, InfoIcon } from '../components/Icons';

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
  const [showInfoModal, setShowInfoModal] = useState(false);
  
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
      <div className="home-title-wrapper">
        <h1 className="home-title">
          {user ? `Привет, ${user.first_name}!` : 'CRM система'}
        </h1>
        <button 
          className="home-info-button"
          onClick={() => setShowInfoModal(true)}
          aria-label="Информация о приложении"
        >
          <InfoIcon className="home-info-icon" width={20} height={20} />
        </button>
      </div>
      
      {/* Модалка с информацией о приложении */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="О приложении"
      >
        <div className="app-info-content">
          <div className="app-info-section">
            <h3 className="app-info-section-title">Для кого</h3>
            <p className="app-info-text">
              CRM система для управления клиентами, событиями и заметками. 
              Подходит для малого бизнеса, фрилансеров и всех, кому нужно 
              организовать работу с клиентами.
            </p>
          </div>
          
          <div className="app-info-section">
            <h3 className="app-info-section-title">Основные возможности</h3>
            <ul className="app-info-list">
              <li className="app-info-list-item">
                <strong>Клиенты</strong> — управление базой клиентов с контактами и информацией
              </li>
              <li className="app-info-list-item">
                <strong>События</strong> — напоминания, встречи, задачи с привязкой к дате и времени
              </li>
              <li className="app-info-list-item">
                <strong>Заметки</strong> — хранение важной информации и записей
              </li>
              <li className="app-info-list-item">
                <strong>Календарь</strong> — визуальный просмотр событий по датам
              </li>
            </ul>
          </div>
          
          <div className="app-info-section">
            <h3 className="app-info-section-title">Преимущества</h3>
            <ul className="app-info-list">
              <li className="app-info-list-item">
                Работает прямо в Telegram — не нужно устанавливать отдельное приложение
              </li>
              <li className="app-info-list-item">
                Все данные синхронизируются в облаке
              </li>
              <li className="app-info-list-item">
                Простой и понятный интерфейс
              </li>
              <li className="app-info-list-item">
                Быстрый доступ к важной информации
              </li>
            </ul>
          </div>
        </div>
        
        <div className="app-info-actions">
          <Button onClick={() => setShowInfoModal(false)}>
            Понятно
          </Button>
        </div>
      </Modal>
      
      {/* События сегодня */}
      <Card>
        <h2 className="home-card-title">События сегодня</h2>
        {!loading && (
          <div className="home-today-reminders">
            <span className="today-reminders-value">{stats.todayRemindersCount}</span>
            <span className="today-reminders-label">
              {stats.todayRemindersCount === 1 
                ? 'событие' 
                : stats.todayRemindersCount > 1 && stats.todayRemindersCount < 5
                ? 'события'
                : 'событий'}
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
      
      {/* События */}
      <Card>
        <h2 className="home-card-title">События</h2>
        <div className="home-actions">
          <Button onClick={handleViewReminders} variant="secondary" className="action-button">
            <ClockIcon className="action-icon" />
            Все события
          </Button>
          <Button onClick={handleCreateReminder} variant="secondary" className="action-button">
            <PlusIcon className="action-icon" />
            Создать событие
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

