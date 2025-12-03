/**
 * Страница профиля пользователя
 * 
 * Демонстрирует:
 * - Отображение и редактирование профиля
 * - Взаимодействие с бэкендом для сохранения данных
 * - Использование форм
 */

import { useState, useEffect } from 'react';
import { getTelegramUser, getTelegramWebApp } from '../lib/telegram';
import { apiGet, apiPost } from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Profile() {
  // Получаем данные пользователя из Telegram
  const telegramUser = getTelegramUser();
  const webApp = getTelegramWebApp();
  
  // Состояние для данных профиля
  const [profile, setProfile] = useState({
    name: telegramUser?.first_name || '',
    email: '',
    phone: '',
    bio: '',
  });
  
  // Состояния для UI
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Загружаем профиль с бэкенда при монтировании компонента
  useEffect(() => {
    loadProfile();
  }, []);
  
  /**
   * Загружает профиль пользователя с бэкенда
   */
  const loadProfile = async () => {
    setLoading(true);
    
    // Пример запроса к API для получения профиля
    // const response = await apiGet('/users/profile');
    // if (response.success && response.data) {
    //   setProfile(response.data);
    // } else {
    //   // Если профиля нет, используем данные из Telegram
    //   if (telegramUser) {
    //     setProfile(prev => ({
    //       ...prev,
    //       name: telegramUser.first_name + ' ' + (telegramUser.last_name || ''),
    //     }));
    //   }
    // }
    
    // Имитация загрузки для примера
    setTimeout(() => {
      if (telegramUser) {
        setProfile({
          name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
          email: 'user@example.com',
          phone: '+1234567890',
          bio: 'Это пример биографии пользователя',
        });
      }
      setLoading(false);
    }, 500);
  };
  
  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
    // Сбрасываем сообщение при изменении
    setMessage(null);
  };
  
  /**
   * Сохраняет профиль на бэкенд
   */
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    // Валидация (базовая)
    if (!profile.name.trim()) {
      setMessage({ type: 'error', text: 'Имя обязательно для заполнения' });
      setSaving(false);
      return;
    }
    
    // Пример запроса к API для сохранения профиля
    // const response = await apiPost('/users/profile', profile);
    // if (response.success) {
    //   setMessage({ type: 'success', text: 'Профиль успешно сохранен!' });
    //   if (webApp?.HapticFeedback) {
    //     webApp.HapticFeedback.notificationOccurred('success');
    //   }
    // } else {
    //   setMessage({ type: 'error', text: response.error || 'Ошибка при сохранении' });
    //   if (webApp?.HapticFeedback) {
    //     webApp.HapticFeedback.notificationOccurred('error');
    //   }
    // }
    
    // Имитация сохранения для примера
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Профиль успешно сохранен!' });
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      setSaving(false);
    }, 1000);
  };
  
  return (
    <div className="profile">
      <h1 className="profile-title">Профиль</h1>
      
      {loading ? (
        <Card>
          <p className="profile-loading">Загрузка профиля...</p>
        </Card>
      ) : (
        <>
          {/* Форма редактирования профиля */}
          <Card>
            <h2 className="profile-card-title">Редактировать профиль</h2>
            
            <div className="profile-form">
              <div className="profile-form-group">
                <label htmlFor="name">Имя</label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите ваше имя"
                  className="profile-input"
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Введите ваш email"
                  className="profile-input"
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Введите ваш телефон"
                  className="profile-input"
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="bio">О себе</label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Расскажите о себе"
                  className="profile-textarea"
                  rows={4}
                />
              </div>
            </div>
            
            {/* Сообщение об успехе/ошибке */}
            {message && (
              <div className={`profile-message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Card>
          
          {/* Информация из Telegram */}
          {telegramUser && (
            <Card>
              <h2 className="profile-card-title">Данные из Telegram</h2>
              <div className="profile-telegram-info">
                <p><strong>ID:</strong> {telegramUser.id}</p>
                {telegramUser.username && (
                  <p><strong>Username:</strong> @{telegramUser.username}</p>
                )}
                {telegramUser.language_code && (
                  <p><strong>Язык:</strong> {telegramUser.language_code}</p>
                )}
                {telegramUser.is_premium && (
                  <p><strong>Premium:</strong> ✅</p>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

