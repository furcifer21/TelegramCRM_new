/**
 * Страница просмотра карточки клиента
 * 
 * Отображает полную информацию о клиенте,
 * заметки, напоминания и позволяет управлять ими
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getClient, deleteClient, getClientNotes, getClientReminders, createNote, deleteNote, createReminder, deleteReminder } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';

export default function ClientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const webApp = getTelegramWebApp();
  
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Модальные окна
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  
  // Формы
  const [noteText, setNoteText] = useState('');
  const [reminderData, setReminderData] = useState({
    text: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
  });
  
  // Загружаем данные при загрузке страницы
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  
  /**
   * Загружает данные клиента, заметки и напоминания
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const clientData = await getClient(id);
      if (!clientData) {
        if (webApp) {
          webApp.showAlert('Клиент не найден');
        }
        router.push('/clients');
        return;
      }
      
      setClient(clientData);
      
      // Загружаем заметки
      const clientNotes = await getClientNotes(id);
      clientNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotes(clientNotes);
      
      // Загружаем напоминания
      const clientReminders = await getClientReminders(id);
      clientReminders.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
      setReminders(clientReminders);
    } catch (error) {
      console.error('Error loading client data:', error);
      if (webApp) {
        webApp.showAlert('Ошибка загрузки данных');
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Обработчик удаления клиента
   */
  const handleDelete = () => {
    if (webApp) {
      webApp.showConfirm(
        `Вы уверены, что хотите удалить клиента "${client.name}"?`,
        async (confirmed) => {
          if (confirmed) {
            try {
              await deleteClient(id);
              if (webApp.HapticFeedback) {
                webApp.HapticFeedback.notificationOccurred('success');
              }
              router.push('/clients');
            } catch (error) {
              console.error('Error deleting client:', error);
              webApp.showAlert('Ошибка при удалении клиента');
            }
          }
        }
      );
    } else {
      if (confirm(`Удалить клиента "${client.name}"?`)) {
        deleteClient(id).then(() => {
          router.push('/clients');
        });
      }
    }
  };
  
  /**
   * Обработчик создания заметки
   */
  const handleCreateNote = async () => {
    if (!noteText.trim()) {
      if (webApp) {
        webApp.showAlert('Введите текст заметки');
      }
      return;
    }
    
    try {
      await createNote({
        clientId: id,
        text: noteText,
      });
      
      setNoteText('');
      setShowNoteModal(false);
      await loadData();
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при создании заметки');
      }
    }
  };
  
  /**
   * Обработчик удаления заметки
   */
  const handleDeleteNote = async (noteId) => {
    if (webApp) {
      webApp.showConfirm('Удалить заметку?', async (confirmed) => {
        if (confirmed) {
          try {
            await deleteNote(noteId);
            await loadData();
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        }
      });
    } else {
      if (confirm('Удалить заметку?')) {
        await deleteNote(noteId);
        await loadData();
      }
    }
  };
  
  /**
   * Обработчик создания напоминания
   */
  const handleCreateReminder = async () => {
    if (!reminderData.text.trim()) {
      if (webApp) {
        webApp.showAlert('Введите текст напоминания');
      }
      return;
    }
    
    try {
      await createReminder({
        clientId: id,
        ...reminderData,
      });
      
      setReminderData({
        text: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
      });
      setShowReminderModal(false);
      await loadData();
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при создании напоминания');
      }
    }
  };
  
  /**
   * Обработчик удаления напоминания
   */
  const handleDeleteReminder = async (reminderId) => {
    if (webApp) {
      webApp.showConfirm('Удалить напоминание?', async (confirmed) => {
        if (confirmed) {
          try {
            await deleteReminder(reminderId);
            await loadData();
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
          } catch (error) {
            console.error('Error deleting reminder:', error);
          }
        }
      });
    } else {
      if (confirm('Удалить напоминание?')) {
        await deleteReminder(reminderId);
        await loadData();
      }
    }
  };
  
  if (loading) {
    return (
      <div className="client-detail-page">
        <Card>
          <p>Загрузка...</p>
        </Card>
      </div>
    );
  }
  
  if (!client) {
    return null;
  }
  
  return (
    <div className="client-detail-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => router.back()}>
          ← Назад
        </Button>
        <h1 className="page-title">{client.name || 'Без имени'}</h1>
      </div>
      
      {/* Информация о клиенте */}
      <Card>
        <div className="client-info">
          {client.company && (
            <div className="info-row">
              <span className="info-label">Компания:</span>
              <span className="info-value">{client.company}</span>
            </div>
          )}
          {client.phone && (
            <div className="info-row">
              <span className="info-label">Телефон:</span>
              <a href={`tel:${client.phone}`} className="info-value info-link">
                {client.phone}
              </a>
            </div>
          )}
          {client.email && (
            <div className="info-row">
              <span className="info-label">Email:</span>
              <a href={`mailto:${client.email}`} className="info-value info-link">
                {client.email}
              </a>
            </div>
          )}
          {client.notes && (
            <div className="info-row">
              <span className="info-label">Заметки:</span>
              <p className="info-value">{client.notes}</p>
            </div>
          )}
        </div>
        
        <div className="client-actions">
          <Button
            variant="secondary"
            onClick={() => router.push(`/client/edit/${id}`)}
          >
            ✏️ Редактировать
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
          >
            🗑️ Удалить
          </Button>
        </div>
      </Card>
      
      {/* Заметки */}
      <Card>
        <div className="section-header">
          <h2 className="section-title">Заметки</h2>
          <Button
            variant="secondary"
            onClick={() => setShowNoteModal(true)}
          >
            ➕ Добавить
          </Button>
        </div>
        
        {notes.length === 0 ? (
          <p className="empty-section">Нет заметок</p>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-item">
                <p className="note-text">{note.text}</p>
                <div className="note-footer">
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleString('ru-RU')}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteNote(note.id)}
                    className="note-delete-button"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Напоминания */}
      <Card>
        <div className="section-header">
          <h2 className="section-title">Напоминания</h2>
          <Button
            variant="secondary"
            onClick={() => setShowReminderModal(true)}
          >
            ➕ Добавить
          </Button>
        </div>
        
        {reminders.length === 0 ? (
          <p className="empty-section">Нет напоминаний</p>
        ) : (
          <div className="reminders-list">
            {reminders.map((reminder) => {
              const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
              const isPast = reminderDate < new Date();
              
              return (
                <div
                  key={reminder.id}
                  className={`reminder-item ${isPast && !reminder.notified ? 'reminder-past' : ''}`}
                >
                  <div className="reminder-content">
                    <p className="reminder-text">{reminder.text}</p>
                    <p className="reminder-date">
                      {reminderDate.toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="reminder-delete-button"
                  >
                    🗑️
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      
      {/* Модальное окно добавления заметки */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setNoteText('');
        }}
        title="Новая заметка"
      >
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Введите текст заметки"
          rows={4}
        />
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => {
              setShowNoteModal(false);
              setNoteText('');
            }}
          >
            Отмена
          </Button>
          <Button onClick={handleCreateNote}>
            Сохранить
          </Button>
        </div>
      </Modal>
      
      {/* Модальное окно добавления напоминания */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setReminderData({
            text: '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
          });
        }}
        title="Новое напоминание"
      >
        <Textarea
          value={reminderData.text}
          onChange={(e) => setReminderData(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Текст напоминания"
          rows={3}
        />
        <Input
          label="Дата"
          type="date"
          value={reminderData.date}
          onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
        />
        <Input
          label="Время"
          type="time"
          value={reminderData.time}
          onChange={(e) => setReminderData(prev => ({ ...prev, time: e.target.value }))}
        />
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => {
              setShowReminderModal(false);
              setReminderData({
                text: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
              });
            }}
          >
            Отмена
          </Button>
          <Button onClick={handleCreateReminder}>
            Сохранить
          </Button>
        </div>
      </Modal>
    </div>
  );
}

