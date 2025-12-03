/**
 * Страница создания нового клиента
 * 
 * Форма для добавления нового клиента в CRM
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../../lib/crm';
import { getTelegramWebApp } from '../../lib/telegram';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';

export default function NewClient() {
  const router = useRouter();
  const webApp = getTelegramWebApp();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Очищаем ошибку для этого поля
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
    
    // Валидация email (если указан)
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
    
    setLoading(true);
    
    try {
      const newClient = await createClient(formData);
      
      // Тактильная обратная связь
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      
      // Переходим на страницу клиента
      router.push(`/client/${newClient.id}`);
    } catch (error) {
      console.error('Error creating client:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при создании клиента');
      } else {
        alert('Ошибка при создании клиента');
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Обработчик отмены
   */
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <div className="client-form-page">
      <div className="page-header">
        <h1 className="page-title">Новый клиент</h1>
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
          
          <Input
            label="Телефон"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+7 (999) 123-45-67"
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
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
}

