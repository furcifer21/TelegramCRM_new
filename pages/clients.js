/**
 * Страница списка клиентов
 * 
 * Отображает всех клиентов с возможностью поиска и фильтрации
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getClients, searchClients, deleteClient } from '../lib/crm';
import { getTelegramWebApp } from '../lib/telegram';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { PlusIcon, EditIcon, TrashIcon } from '../components/Icons';

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const webApp = getTelegramWebApp();
  
  // Загружаем клиентов при загрузке страницы
  useEffect(() => {
    loadClients();
  }, []);
  
  // Фильтруем клиентов при изменении поискового запроса
  useEffect(() => {
    if (searchQuery.trim()) {
      filterClients(searchQuery);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);
  
  /**
   * Загружает список клиентов
   */
  const loadClients = async () => {
    setLoading(true);
    try {
      const clientsList = await getClients();
      // Сортируем по дате обновления (новые сверху)
      clientsList.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setClients(clientsList);
      setFilteredClients(clientsList);
    } catch (error) {
      console.error('Error loading clients:', error);
      if (webApp) {
        webApp.showAlert('Ошибка загрузки клиентов');
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Фильтрует клиентов по поисковому запросу
   */
  const filterClients = async (query) => {
    try {
      const results = await searchClients(query);
      setFilteredClients(results);
    } catch (error) {
      console.error('Error filtering clients:', error);
    }
  };
  
  /**
   * Обработчик удаления клиента
   */
  const handleDelete = async (clientId, clientName) => {
    if (webApp) {
      webApp.showConfirm(
        `Вы уверены, что хотите удалить клиента "${clientName}"?`,
        async (confirmed) => {
          if (confirmed) {
            try {
              await deleteClient(clientId);
              await loadClients();
              if (webApp.HapticFeedback) {
                webApp.HapticFeedback.notificationOccurred('success');
              }
            } catch (error) {
              console.error('Error deleting client:', error);
              webApp.showAlert('Ошибка при удалении клиента');
            }
          }
        }
      );
    } else {
      if (confirm(`Удалить клиента "${clientName}"?`)) {
        try {
          await deleteClient(clientId);
          await loadClients();
        } catch (error) {
          console.error('Error deleting client:', error);
          alert('Ошибка при удалении клиента');
        }
      }
    }
  };
  
  return (
    <div className="clients-page">
      <div className="page-header">
        <h1 className="page-title">Клиенты</h1>
        <Button onClick={() => router.push('/client/new')} className="icon-button">
          <PlusIcon className="icon" />
        </Button>
      </div>
      
      {/* Поиск */}
      <div className="search-section">
        <Input
          type="text"
          placeholder="Поиск по имени, телефону, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      {/* Список клиентов */}
      {loading ? (
        <Card>
          <p>Загрузка...</p>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card>
          <div className="empty-state">
            <p className="empty-state-text">
              {searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/client/new')}>
                Добавить первого клиента
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="clients-list">
          {filteredClients.map((client) => (
            <Card key={client.id} className="client-card">
              <Link href={`/client/${client.id}`}>
                <div className="client-card-content">
                  <div className="client-card-header">
                    <h3 className="client-name">{client.name || 'Без имени'}</h3>
                    {client.company && (
                      <span className="client-company">{client.company}</span>
                    )}
                  </div>
                  <div className="client-card-info">
                    {client.phone && (
                      <p className="client-info-item">📞 {client.phone}</p>
                    )}
                    {client.email && (
                      <p className="client-info-item">✉️ {client.email}</p>
                    )}
                  </div>
                </div>
              </Link>
              <div className="client-card-actions">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/client/edit/${client.id}`)}
                  className="client-action-button"
                >
                  <EditIcon className="icon" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDelete(client.id, client.name)}
                  className="client-action-button"
                >
                  <TrashIcon className="icon" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Статистика */}
      {!loading && (
        <Card className="clients-stats">
          <p className="stats-text">
            Всего клиентов: <strong>{clients.length}</strong>
            {searchQuery && ` (найдено: ${filteredClients.length})`}
          </p>
        </Card>
      )}
    </div>
  );
}

