/**
 * Страница настроек приложения
 * 
 * Демонстрирует:
 * - Настройки приложения
 * - Использование переключателей и других UI элементов
 * - Сохранение настроек (можно использовать CloudStorage от Telegram)
 */

import { useState, useEffect } from 'react';
import { getTelegramWebApp } from '../lib/telegram';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const webApp = getTelegramWebApp();
  
  // Состояния для настроек
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState('auto');
  
  // Загружаем настройки при монтировании
  useEffect(() => {
    loadSettings();
  }, []);
  
  /**
   * Загружает настройки из CloudStorage Telegram (если доступно)
   * или из localStorage
   */
  const loadSettings = () => {
    if (webApp?.CloudStorage) {
      // Используем CloudStorage Telegram для синхронизации между устройствами
      webApp.CloudStorage.getItem('notifications', (error, value) => {
        if (!error && value !== null) {
          setNotifications(value === 'true');
        }
      });
      
      webApp.CloudStorage.getItem('sound', (error, value) => {
        if (!error && value !== null) {
          setSound(value === 'true');
        }
      });
      
      webApp.CloudStorage.getItem('language', (error, value) => {
        if (!error && value !== null) {
          setLanguage(value);
        }
      });
      
      webApp.CloudStorage.getItem('theme', (error, value) => {
        if (!error && value !== null && (value === 'light' || value === 'dark' || value === 'auto')) {
          setTheme(value);
        }
      });
    } else {
      // Fallback на localStorage
      const savedNotifications = localStorage.getItem('notifications');
      const savedSound = localStorage.getItem('sound');
      const savedLanguage = localStorage.getItem('language');
      const savedTheme = localStorage.getItem('theme');
      
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === 'true');
      }
      if (savedSound !== null) {
        setSound(savedSound === 'true');
      }
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
        setTheme(savedTheme);
      }
    }
  };
  
  /**
   * Сохраняет настройки в CloudStorage или localStorage
   */
  const saveSettings = () => {
    if (webApp?.CloudStorage) {
      // Сохраняем в CloudStorage Telegram
      webApp.CloudStorage.setItem('notifications', notifications.toString());
      webApp.CloudStorage.setItem('sound', sound.toString());
      webApp.CloudStorage.setItem('language', language);
      webApp.CloudStorage.setItem('theme', theme);
      
      if (webApp.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      webApp.showAlert('Настройки сохранены!');
    } else {
      // Fallback на localStorage
      localStorage.setItem('notifications', notifications.toString());
      localStorage.setItem('sound', sound.toString());
      localStorage.setItem('language', language);
      localStorage.setItem('theme', theme);
      
      alert('Настройки сохранены!');
    }
  };
  
  /**
   * Сбрасывает настройки к значениям по умолчанию
   */
  const resetSettings = () => {
    if (webApp) {
      webApp.showConfirm('Вы уверены, что хотите сбросить настройки?', (confirmed) => {
        if (confirmed) {
          setNotifications(true);
          setSound(true);
          setLanguage('ru');
          setTheme('auto');
          saveSettings();
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
        <Button onClick={saveSettings}>
          Сохранить настройки
        </Button>
        <Button onClick={resetSettings} variant="secondary">
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

