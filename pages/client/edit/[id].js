/**
 * Страница редактирования клиента
 * 
 * Форма для изменения данных существующего клиента
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getClient, updateClient } from '../../../lib/crm';
import { getTelegramWebApp } from '../../../lib/telegram';
import { unformatPhone, formatPhone, PHONE_FORMATS } from '../../../lib/phoneMask';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Textarea from '../../../components/Textarea';

export default function EditClient() {
  const router = useRouter();
  const { id } = router.query;
  const webApp = getTelegramWebApp();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneFormat, setPhoneFormat] = useState(PHONE_FORMATS.MD);
  
  // Загружаем данные клиента
  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);
  
  /**
   * Загружает данные клиента
   */
  const loadClient = async () => {
    setLoading(true);
    try {
      const client = await getClient(id);
      if (!client) {
        if (webApp) {
          webApp.showAlert('Клиент не найден');
        }
        router.push('/clients');
        return;
      }
      
      setFormData({
        name: client.name || '',
        phone: client.phone ? formatPhone(client.phone) : '',
        email: client.email || '',
        company: client.company || '',
        notes: client.notes || '',
      });
    } catch (error) {
      console.error('Error loading client:', error);
      if (webApp) {
        webApp.showAlert('Ошибка загрузки клиента');
      }
      router.push('/clients');
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
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };
  
  /**
   * Валидация формы
   */
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      if (webApp) {
        webApp.showAlert('Пожалуйста, заполните все обязательные поля');
      }
      return;
    }
    
    setSaving(true);
    
    try {
      // Сохраняем телефон без форматирования
      const clientData = {
        ...formData,
        phone: formData.phone ? unformatPhone(formData.phone) : '',
      };
      await updateClient(id, clientData);
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      // Возвращаемся на страницу клиента
      router.push(`/client/${id}`);
    } catch (error) {
      console.error('Error updating client:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при обновлении клиента');
      } else {
        alert('Ошибка при обновлении клиента');
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
  
  if (loading) {
    return (
      <div className="client-form-page">
        <Card>
          <p>Загрузка...</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="client-form-page">
      <div className="page-header">
        <h1 className="page-title">Редактировать клиента</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="client-form">
        <Card>
          <Input
            label="Имя *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите имя клиента"
            required
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
          
          <div className="input-group">
            <label className="input-label">Формат телефона</label>
            <select
              value={phoneFormat}
              onChange={(e) => setPhoneFormat(e.target.value)}
              className="input-field"
            >
              <option value={PHONE_FORMATS.MD}>Молдавский (+373)</option>
              <option value={PHONE_FORMATS.UA}>Украинский (+380)</option>
            </select>
          </div>
          
          <Input
            label="Телефон"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            phoneMask={true}
            phoneFormat={phoneFormat}
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="client@example.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
          
          <Input
            label="Компания"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Название компании"
          />
          
          <Textarea
            label="Заметки"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Дополнительная информация о клиенте"
            rows={4}
          />
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

