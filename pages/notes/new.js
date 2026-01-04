/**
 * Страница создания заметки
 * 
 * Форма для создания заметки (с привязкой к клиенту или без)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getClients, createNote } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import { useLoader } from '../../contexts/LoaderContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Textarea from '../../components/Textarea';
import { ArrowLeftIcon } from '../../components/Icons';

export default function NewNote() {
  const router = useRouter();
  const { clientId } = router.query; // Опциональный параметр из URL
  const webApp = getTelegramWebApp();
  const { setLoading: setGlobalLoading } = useLoader();
  
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: clientId || '',
    text: '',
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
        webApp.showAlert('Введите текст заметки');
      } else {
        alert('Введите текст заметки');
      }
      return;
    }
    
    setSaving(true);
    
    try {
      await createNote({
        clientId: formData.clientId || null,
        text: formData.text,
      });
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      // Возвращаемся назад или на страницу клиента
      if (formData.clientId) {
        router.push(`/client/${formData.clientId}`);
      } else {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при создании заметки');
      } else {
        alert('Ошибка при создании заметки');
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
    <div className="note-form-page">
      <div className="page-header">
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="back-button"
        >
          <ArrowLeftIcon className="icon" />
        </Button>
        <h1 className="page-title">Новая заметка</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="note-form">
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
                label="Текст заметки *"
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Введите текст заметки..."
                required
                rows={8}
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

