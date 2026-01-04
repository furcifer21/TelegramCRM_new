/**
 * Страница отдельного напоминания
 * 
 * Отображает детали напоминания и позволяет редактировать/удалять
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getReminder, updateReminder, deleteReminder, getClients } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import { useLoader } from '../../contexts/LoaderContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { ClockIcon, EditIcon, TrashIcon, ArrowLeftIcon } from '../../components/Icons';

export default function ReminderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const webApp = getTelegramWebApp();
  const { setLoading: setGlobalLoading } = useLoader();
  
  const [reminder, setReminder] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    text: '',
    date: '',
    time: '',
  });
  
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  
  /**
   * Загружает данные напоминания и клиентов
   */
  const loadData = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const [reminderData, clientsData] = await Promise.all([
        getReminder(id),
        getClients()
      ]);
      
      if (!reminderData) {
        if (webApp) {
          webApp.showAlert('Напоминание не найдено');
        }
        router.push('/reminders');
        return;
      }
      
      setReminder(reminderData);
      setClients(clientsData);
      setFormData({
        clientId: reminderData.clientId || '',
        text: reminderData.text || '',
        date: reminderData.date || '',
        time: reminderData.time || '',
      });
    } catch (error) {
      console.error('Error loading reminder:', error);
      if (webApp) {
        webApp.showAlert('Ошибка загрузки напоминания');
      }
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };
  
  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  /**
   * Сохраняет изменения
   */
  const handleSave = async () => {
    if (!formData.text.trim()) {
      if (webApp) {
        webApp.showAlert('Введите текст напоминания');
      }
      return;
    }
    
    setSaving(true);
    setGlobalLoading(true);
    try {
      await updateReminder(id, {
        clientId: formData.clientId || null,
        text: formData.text,
        date: formData.date,
        time: formData.time,
      });
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      setEditing(false);
      await loadData();
    } catch (error) {
      console.error('Error updating reminder:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при сохранении');
      }
    } finally {
      setSaving(false);
      setGlobalLoading(false);
    }
  };
  
  /**
   * Удаляет напоминание
   */
  const handleDelete = async () => {
    if (webApp) {
      webApp.showConfirm('Удалить напоминание?', async (confirmed) => {
        if (confirmed) {
          try {
            await deleteReminder(id);
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
            router.push('/reminders');
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
          router.push('/reminders');
        } catch (error) {
          console.error('Error deleting reminder:', error);
          alert('Ошибка при удалении');
        }
      }
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
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading) {
    return (
      <div className="reminder-detail-page">
        <Card>
          <p>Загрузка...</p>
        </Card>
      </div>
    );
  }
  
  if (!reminder) {
    return null;
  }
  
  return (
    <div className="reminder-detail-page">
      <div className="page-header">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="back-button"
        >
          <ArrowLeftIcon className="icon" />
        </Button>
        <h1 className="page-title">Напоминание</h1>
        <div className="page-actions">
          {!editing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setEditing(true)}
                className="icon-button"
                title="Редактировать"
              >
                <EditIcon className="icon" />
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelete}
                className="icon-button"
                title="Удалить"
              >
                <TrashIcon className="icon" />
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(false);
                setFormData({
                  clientId: reminder.clientId || '',
                  text: reminder.text || '',
                  date: reminder.date || '',
                  time: reminder.time || '',
                });
              }}
            >
              Отмена
            </Button>
          )}
        </div>
      </div>
      
      {!editing ? (
        <Card>
          <div className="reminder-detail-content">
            <div className="reminder-detail-meta">
              <div className="reminder-detail-meta-row">
                <ClockIcon className="reminder-detail-icon" />
                <span className="reminder-detail-datetime">{formatDateTime(reminder.date, reminder.time)}</span>
              </div>
              {reminder.clientId && (
                <div className="reminder-detail-client-row">
                  <span className="reminder-detail-client-label">Клиент:</span>
                  <span className="reminder-detail-client-value">{getClientName(reminder.clientId)}</span>
                </div>
              )}
            </div>
            
            <div className="reminder-detail-text-wrapper">
              <p className="reminder-detail-text">{reminder.text}</p>
            </div>
            
            {reminder.notified && (
              <div className="reminder-detail-status">
                <span className="info-label">Статус:</span>
                <span className="info-value">Уведомление отправлено</span>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="input-group">
            <label className="input-label">Клиент (необязательно)</label>
            <select
              value={formData.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              className="input-field"
            >
              <option value="">Без привязки к клиенту</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || 'Без имени'}
                </option>
              ))}
            </select>
          </div>
          
          <Textarea
            label="Текст напоминания *"
            value={formData.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="О чем нужно напомнить?"
            required
            rows={4}
          />
          
          <Input
            label="Дата *"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />
          
          <Input
            label="Время *"
            type="time"
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            required
          />
          
          <div className="form-actions">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

