/**
 * Компонент Input - поле ввода
 * 
 * Используется для создания форм
 */

import { handlePhoneChange, formatPhone, PHONE_FORMATS } from '../lib/phoneMask';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  phoneMask = false,
  phoneFormat = null, // 'md' или 'ua'
  ...props
}) {
  // Если включена маска телефона, применяем форматирование
  const handleChange = phoneMask && type === 'tel' 
    ? (e) => handlePhoneChange(e, onChange, phoneFormat)
    : onChange;
  
  // Форматируем значение при использовании маски телефона
  const displayValue = phoneMask && type === 'tel' && value
    ? formatPhone(value, phoneFormat)
    : value;
  
  // Определяем тип инпута
  const inputType = phoneMask ? 'tel' : type;
  
  // Плейсхолдер для телефона
  const phonePlaceholder = phoneMask && type === 'tel' 
    ? (phoneFormat === PHONE_FORMATS.UA ? '+380 (XX) XXX-XX-XX' : '+373 (XXX) XX-XXX')
    : placeholder;
  
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={inputType}
        value={displayValue}
        onChange={handleChange}
        placeholder={phonePlaceholder}
        required={required}
        className="input-field"
        {...props}
      />
    </div>
  );
}

