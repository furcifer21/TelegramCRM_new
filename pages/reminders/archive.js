/**
 * Страница архива напоминаний
 * 
 * Отображает все архивные напоминания
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getArchivedReminders, getClients, deleteReminder } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArchiveIcon, ArrowLeftIcon, TrashIcon, ClockIcon } from '../../components/Icons';

export default function RemindersArchive() {
  const router = useRouter();
  const webApp = getTelegramWebApp();
  
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  /**
   * Загружает архивные напоминания и клиентов
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [remindersData, clientsData] = await Promise.all([
        getArchivedReminders(),
        getClients()
      ]);
      
      // Сортируем по дате архивирования (новые сверху)
      const sortedReminders = remindersData.sort((a, b) => {
        const dateA = new Date(a.archivedAt || a.createdAt);
        const dateB = new Date(b.archivedAt || b.createdAt);
        return dateB - dateA;
      });
      
      setReminders(sortedReminders);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading archived reminders:', error);
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
   * Форматирует дату архивирования
   */
  const formatArchivedDate = (archivedAt) => {
    if (!archivedAt) return 'Неизвестно';
    const date = new Date(archivedAt);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Удаляет напоминание
   */
  const handleDelete = async (id) => {
    if (webApp) {
      webApp.showConfirm('Удалить напоминание из архива?', async (confirmed) => {
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
      if (confirm('Удалить напоминание из архива?')) {
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
   * Фильтрует напоминания по поисковому запросу
   */
  const filteredReminders = reminders.filter(reminder => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = getClientName(reminder.clientId) || '';
    return (
      reminder.text?.toLowerCase().includes(query) ||
      clientName.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="reminders-archive-page">
      <div className="page-header">
        <Button
          variant="secondary"
          onClick={() => router.push('/reminders')}
          className="back-button"
        >
          <ArrowLeftIcon className="icon" />
        </Button>
        <h1 className="page-title">Архив напоминаний</h1>
      </div>
      
      {/* Поиск */}
      <Card>
        <div className="search-group">
          <input
            type="text"
            placeholder="Поиск в архиве..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </Card>
      
      {/* Список архивных напоминаний */}
      {loading ? (
        <Card>
          <p>Загрузка...</p>
        </Card>
      ) : filteredReminders.length === 0 ? (
        <Card>
          <div className="empty-state">
            <ArchiveIcon className="empty-icon" />
            <p>Архив пуст</p>
          </div>
        </Card>
      ) : (
        <div className="reminders-list">
          {filteredReminders.map((reminder) => (
            <Card key={reminder.id} className="reminder-card archived">
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
                  onClick={() => handleDelete(reminder.id)}
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
                <span className="reminder-archived">
                  Архивировано: {formatArchivedDate(reminder.archivedAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

