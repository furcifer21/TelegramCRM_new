/**
 * Страница со всеми заметками
 * 
 * Отображает все заметки с фильтрацией
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getNotes, getClients, deleteNote } from '../lib/crm';
import { getTelegramWebApp } from '../lib/telegram';
import Card from '../components/Card';
import Button from '../components/Button';
import { FileTextIcon, PlusIcon, TrashIcon, FilterIcon } from '../components/Icons';

export default function Notes() {
  const router = useRouter();
  const webApp = getTelegramWebApp();
  
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  /**
   * Загружает заметки и клиентов
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [notesData, clientsData] = await Promise.all([
        getNotes(),
        getClients()
      ]);
      
      // Сортируем по дате создания (новые сверху)
      const sortedNotes = notesData.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setNotes(sortedNotes);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
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
  
  /**
   * Удаляет заметку
   */
  const handleDelete = async (id) => {
    if (webApp) {
      webApp.showConfirm('Удалить заметку?', async (confirmed) => {
        if (confirmed) {
          try {
            await deleteNote(id);
            await loadData();
            if (webApp.HapticFeedback) {
              webApp.HapticFeedback.notificationOccurred('success');
            }
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
          await loadData();
        } catch (error) {
          console.error('Error deleting note:', error);
          alert('Ошибка при удалении');
        }
      }
    }
  };
  
  /**
   * Фильтрует заметки по поисковому запросу и клиенту
   */
  const filteredNotes = notes.filter(note => {
    // Фильтр по клиенту
    if (clientFilter && note.clientId !== clientFilter) {
      return false;
    }
    
    // Фильтр по поисковому запросу
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = getClientName(note.clientId).toLowerCase();
    return (
      note.text?.toLowerCase().includes(query) ||
      clientName.includes(query)
    );
  });
  
  return (
    <div className="notes-page">
      <div className="page-header">
        <h1 className="page-title">Заметки</h1>
        <Button
          onClick={() => router.push('/notes/new')}
          className="icon-button"
        >
          <PlusIcon className="icon" />
        </Button>
      </div>
      
      {/* Фильтры */}
      <Card>
        <div className="filters-group">
          <div className="search-group">
            <input
              type="text"
              placeholder="Поиск заметок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <FilterIcon className="filter-icon" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Все клиенты</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || 'Без имени'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      {/* Список заметок */}
      {loading ? (
        <Card>
          <p>Загрузка...</p>
        </Card>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <div className="empty-state">
            <FileTextIcon className="empty-icon" />
            <p>Нет заметок</p>
            <Button onClick={() => router.push('/notes/new')}>
              Создать заметку
            </Button>
          </div>
        </Card>
      ) : (
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="note-card">
              <div className="note-header">
                <div className="note-info">
                  <FileTextIcon className="note-icon" />
                  <div>
                    <p className="note-text">{note.text}</p>
                    <p className="note-client">{getClientName(note.clientId)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="delete-button"
                  aria-label="Удалить"
                >
                  <TrashIcon className="icon" />
                </button>
              </div>
              <div className="note-footer">
                <span className="note-date">{formatDate(note.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

