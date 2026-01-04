/**
 * Страница настроек приложения
 * 
 * Демонстрирует:
 * - Настройки приложения
 * - Использование переключателей и других UI элементов
 * - Сохранение настроек в Supabase
 */

import { useState, useEffect } from 'react';
import { getTelegramWebApp } from '../lib/telegram';
import { apiGet, apiPost } from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const webApp = getTelegramWebApp();
  
  // Состояния для настроек
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState('auto');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Загружаем настройки при монтировании
  useEffect(() => {
    loadSettings();
  }, []);
  
  /**
   * Загружает настройки из API
   */
  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/settings');
      if (response.success && response.data) {
        setNotifications(response.data.notifications !== false);
        setSound(response.data.sound !== false);
        setLanguage(response.data.language || 'ru');
        setTheme(response.data.theme || 'auto');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Сохраняет настройки через API
   */
  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await apiPost('/api/settings', {
        notifications,
        sound,
        language,
        theme,
      });
      
      if (response.success) {
        if (webApp?.HapticFeedback) {
          webApp.HapticFeedback.notificationOccurred('success');
        }
        if (webApp) {
          webApp.showAlert('Настройки сохранены!');
        } else {
          alert('Настройки сохранены!');
        }
      } else {
        throw new Error(response.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при сохранении настроек');
      } else {
        alert('Ошибка при сохранении настроек');
      }
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Сбрасывает настройки к значениям по умолчанию
   */
  const resetSettings = () => {
    if (webApp) {
      webApp.showConfirm('Вы уверены, что хотите сбросить настройки?', async (confirmed) => {
        if (confirmed) {
          setNotifications(true);
          setSound(true);
          setLanguage('ru');
          setTheme('auto');
          await saveSettings();
        }
      });
    } else {
      if (confirm('Вы уверены, что хотите сбросить настройки?')) {
        setNotifications(true);
        setSound(true);
        setLanguage('ru');
        setTheme('auto');
        saveSettings();
      }
    }
  };
  
  return (
    <div className="settings">
      <h1 className="settings-title">Настройки</h1>
      
      {/* Настройки уведомлений */}
      <Card>
        <h2 className="settings-card-title">Уведомления</h2>
        
        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-label">Включить уведомления</span>
            <span className="settings-description">
              Получать push-уведомления от приложения
            </span>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <span className="settings-toggle-slider"></span>
          </label>
        </div>
        
        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-label">Звук уведомлений</span>
            <span className="settings-description">
              Воспроизводить звук при получении уведомлений
            </span>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              disabled={!notifications}
            />
            <span className="settings-toggle-slider"></span>
          </label>
        </div>
      </Card>
      
      {/* Настройки языка */}
      <Card>
        <h2 className="settings-card-title">Язык</h2>
        
        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-label">Выберите язык</span>
            <span className="settings-description">
              Язык интерфейса приложения
            </span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="settings-select"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="uk">Українська</option>
          </select>
        </div>
      </Card>
      
      {/* Настройки темы */}
      <Card>
        <h2 className="settings-card-title">Тема оформления</h2>
        
        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-label">Тема</span>
            <span className="settings-description">
              Выберите тему оформления приложения
            </span>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="settings-select"
          >
            <option value="auto">Автоматически</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
      </Card>
      
      {/* Кнопки действий */}
      <div className="settings-actions">
        <Button onClick={saveSettings} disabled={loading || saving}>
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
        <Button onClick={resetSettings} variant="secondary" disabled={loading || saving}>
          Сбросить настройки
        </Button>
      </div>
      
      {/* Информация о приложении */}
      {webApp && (
        <Card>
          <h2 className="settings-card-title">О приложении</h2>
          <div className="settings-app-info">
            <p><strong>Версия WebApp:</strong> {webApp.version}</p>
            <p><strong>Платформа:</strong> {webApp.platform}</p>
            <p><strong>Текущая тема:</strong> {webApp.colorScheme}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

