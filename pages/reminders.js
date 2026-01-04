/**
 * Страница со всеми напоминаниями
 * 
 * Отображает все активные (неархивные) напоминания
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getNonArchivedReminders, getClients, deleteReminder } from '../lib/crm';
import { getTelegramWebApp } from '../lib/telegram';
import Card from '../components/Card';
import Button from '../components/Button';
import { ClockIcon, PlusIcon, ArchiveIcon, TrashIcon } from '../components/Icons';

export default function Reminders() {
  const router = useRouter();
  const webApp = getTelegramWebApp();
  
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Получаем дату из query параметров
  const dateFilter = router.query.date || '';
  
  useEffect(() => {
    loadData();
  }, []);
  
  /**
   * Загружает напоминания и клиентов
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [remindersData, clientsData] = await Promise.all([
        getNonArchivedReminders(),
        getClients()
      ]);
      
      // Сортируем по дате и времени (ближайшие сверху)
      const sortedReminders = remindersData.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
      
      setReminders(sortedReminders);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Получает имя клиента по ID
   */
  const getClientName = (clientId) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Неизвестный клиент';
  };
  
  /**
   * Форматирует дату и время
   */
  const formatDateTime = (date, time) => {
    const d = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = d - now;
    
    if (diff < 0) {
      return 'Просрочено';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `Через ${days} дн. ${hours} ч.`;
    } else if (hours > 0) {
      return `Через ${hours} ч.`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Через ${minutes} мин.`;
    }
  };
  
  /**
   * Удаляет напоминание
   */
  const handleDelete = async (id) => {
    if (webApp) {
      webApp.showConfirm('Удалить напоминание?', async (confirmed) => {
        if (confirmed) {
          try {
            await deleteReminder(id);
            await loadData();
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
          } catch (error) {
            console.error('Error deleting reminder:', error);
            webApp.showAlert('Ошибка при удалении');
          }
        }
      });
    } else {
      if (confirm('Удалить напоминание?')) {
        try {
          await deleteReminder(id);
          await loadData();
        } catch (error) {
          console.error('Error deleting reminder:', error);
          alert('Ошибка при удалении');
        }
      }
    }
  };
  
  /**
   * Фильтрует напоминания по поисковому запросу и дате
   */
  const filteredReminders = reminders.filter(reminder => {
    // Фильтр по дате (если передан в query параметрах)
    if (dateFilter && reminder.date !== dateFilter) {
      return false;
    }
    
    // Фильтр по поисковому запросу
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = getClientName(reminder.clientId) || '';
    return (
      reminder.text?.toLowerCase().includes(query) ||
      clientName.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="reminders-page">
      <div className="page-header">
        <h1 className="page-title">Напоминания</h1>
        <div className="page-actions">
          <Button
            variant="secondary"
            onClick={() => router.push('/reminders/archive')}
            className="icon-button"
          >
            <ArchiveIcon className="icon" />
          </Button>
          <Button
            onClick={() => router.push('/reminder/new')}
            className="icon-button"
          >
            <PlusIcon className="icon" />
          </Button>
        </div>
      </div>
      
      {/* Фильтр по дате (если передан) */}
      {dateFilter && (
        <Card>
          <div className="date-filter-info">
            <p>Напоминания на {new Date(dateFilter).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</p>
            <Button
              variant="secondary"
              onClick={() => router.push('/reminders')}
              className="clear-filter-button"
            >
              Сбросить фильтр
            </Button>
          </div>
        </Card>
      )}
      
      {/* Поиск */}
      <Card>
        <div className="search-group">
          <input
            type="text"
            placeholder="Поиск напоминаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </Card>
      
      {/* Список напоминаний */}
      {loading ? (
        <Card>
          <p>Загрузка...</p>
        </Card>
      ) : filteredReminders.length === 0 ? (
        <Card>
          <div className="empty-state">
            <ClockIcon className="empty-icon" />
            <p>Нет активных напоминаний</p>
            <Button onClick={() => router.push('/reminder/new')}>
              Создать напоминание
            </Button>
          </div>
        </Card>
      ) : (
        <div className="reminders-list">
          {filteredReminders.map((reminder) => {
            const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
            const isOverdue = reminderDate < new Date();
            
            return (
              <Card 
                key={reminder.id} 
                className={isOverdue ? 'reminder-card overdue' : 'reminder-card'}
                onClick={() => router.push(`/reminder/${reminder.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="reminder-header">
                  <div className="reminder-info">
                    <ClockIcon className="reminder-icon" />
                    <div>
                      <p className="reminder-text">{reminder.text}</p>
                      {reminder.clientId && (
                        <p className="reminder-client">
                          Клиент: {getClientName(reminder.clientId)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(reminder.id);
                    }}
                    className="delete-button"
                    aria-label="Удалить"
                  >
                    <TrashIcon className="icon" />
                  </button>
                </div>
                <div className="reminder-footer">
                  <span className="reminder-date">
                    {new Date(reminder.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}, {reminder.time}
                  </span>
                  <span className={`reminder-time ${isOverdue ? 'overdue' : ''}`}>
                    {formatDateTime(reminder.date, reminder.time)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

