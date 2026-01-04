/**
 * Страница создания напоминания
 * 
 * Форма для создания напоминания (с привязкой к клиенту или без)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getClients, createReminder } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import { useLoader } from '../../contexts/LoaderContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';

export default function NewReminder() {
  const router = useRouter();
  const { clientId } = router.query; // Опциональный параметр из URL
  const webApp = getTelegramWebApp();
  const { setLoading: setGlobalLoading } = useLoader();
  
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: clientId || '',
    text: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Загружаем список клиентов
  useEffect(() => {
    loadClients();
  }, []);
  
  /**
   * Загружает список клиентов
   */
  const loadClients = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const clientsList = await getClients();
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading clients:', error);
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
   * Обработчик отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      if (webApp) {
        webApp.showAlert('Введите текст напоминания');
      } else {
        alert('Введите текст напоминания');
      }
      return;
    }
    
    setSaving(true);
    
    try {
      await createReminder({
        clientId: formData.clientId || null,
        text: formData.text,
        date: formData.date,
        time: formData.time,
      });
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      // Возвращаемся назад или на страницу клиента
      if (formData.clientId) {
        router.push(`/client/${formData.clientId}`);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при создании напоминания');
      } else {
        alert('Ошибка при создании напоминания');
      }
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Обработчик отмены
   */
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <div className="reminder-form-page">
      <div className="page-header">
        <h1 className="page-title">Новое напоминание</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="reminder-form">
        <Card>
          {!loading && (
            <>
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
            </>
          )}
        </Card>
        
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
}

