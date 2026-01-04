/**
 * Страница отдельной заметки
 * 
 * Отображает детали заметки и позволяет редактировать/удалять
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getNote, updateNote, deleteNote, getClients } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Textarea from '../../components/Textarea';
import { FileTextIcon, EditIcon, TrashIcon, ArrowLeftIcon } from '../../components/Icons';

export default function NoteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const webApp = getTelegramWebApp();
  
  const [note, setNote] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    text: '',
  });
  
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  
  /**
   * Загружает данные заметки и клиентов
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [noteData, clientsData] = await Promise.all([
        getNote(id),
        getClients()
      ]);
      
      if (!noteData) {
        if (webApp) {
          webApp.showAlert('Заметка не найдена');
        }
        router.push('/notes');
        return;
      }
      
      setNote(noteData);
      setClients(clientsData);
      setFormData({
        clientId: noteData.clientId || '',
        text: noteData.text || '',
      });
    } catch (error) {
      console.error('Error loading note:', error);
      if (webApp) {
        webApp.showAlert('Ошибка загрузки заметки');
      }
    } finally {
      setLoading(false);
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
        webApp.showAlert('Введите текст заметки');
      }
      return;
    }
    
    setSaving(true);
    try {
      await updateNote(id, {
        clientId: formData.clientId || null,
        text: formData.text,
      });
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      setEditing(false);
      await loadData();
    } catch (error) {
      console.error('Error updating note:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при сохранении');
      }
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Удаляет заметку
   */
  const handleDelete = async () => {
    if (webApp) {
      webApp.showConfirm('Удалить заметку?', async (confirmed) => {
        if (confirmed) {
          try {
            await deleteNote(id);
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
            router.push('/notes');
          } catch (error) {
            console.error('Error deleting note:', error);
            webApp.showAlert('Ошибка при удалении');
          }
        }
      });
    } else {
      if (confirm('Удалить заметку?')) {
        try {
          await deleteNote(id);
          router.push('/notes');
        } catch (error) {
          console.error('Error deleting note:', error);
          alert('Ошибка при удалении');
        }
      }
    }
  };
  
  /**
   * Получает имя клиента по ID
   */
  const getClientName = (clientId) => {
    if (!clientId) return 'Без привязки к клиенту';
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Неизвестный клиент';
  };
  
  /**
   * Форматирует дату создания
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="note-detail-page">
        <Card>
          <p>Загрузка...</p>
        </Card>
      </div>
    );
  }
  
  if (!note) {
    return null;
  }
  
  return (
    <div className="note-detail-page">
      <div className="page-header">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="back-button"
        >
          <ArrowLeftIcon className="icon" />
        </Button>
        <h1 className="page-title">Заметка</h1>
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
                  clientId: note.clientId || '',
                  text: note.text || '',
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
          <div className="note-detail-content">
            <div className="note-detail-header">
              <FileTextIcon className="note-detail-icon" />
              <div>
                <p className="note-detail-text">{note.text}</p>
                <p className="note-detail-client">{getClientName(note.clientId)}</p>
              </div>
            </div>
            
            <div className="note-detail-info">
              <div className="info-row">
                <span className="info-label">Создано</span>
                <span className="info-value">{formatDate(note.createdAt)}</span>
              </div>
            </div>
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
            label="Текст заметки *"
            value={formData.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Текст заметки"
            required
            rows={8}
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

