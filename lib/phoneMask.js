/**
 * Утилиты для работы с маской телефона
 * 
 * Поддерживает форматы:
 * - Молдавский: +373 (XXX) XX-XXX
 * - Украинский: +380 (XX) XXX-XX-XX
 */

// Форматы телефонов
export const PHONE_FORMATS = {
  MD: 'md', // Молдова: +373 (XXX) XX-XXX
  UA: 'ua', // Украина: +380 (XX) XXX-XX-XX
};

/**
 * Определяет формат телефона по коду страны
 * @param {string} numbers - Цифры номера
 * @returns {string} Формат (md или ua)
 */
const detectFormat = (numbers) => {
  if (numbers.startsWith('373')) {
    return PHONE_FORMATS.MD;
  } else if (numbers.startsWith('380')) {
    return PHONE_FORMATS.UA;
  }
  // По умолчанию молдавский
  return PHONE_FORMATS.MD;
};

/**
 * Форматирует номер телефона в молдавском формате +373 (XXX) XX-XXX
 * @param {string} numbers - Цифры номера
 * @returns {string} Отформатированный номер
 */
const formatMoldova = (numbers) => {
  // Молдова: +373 (XXX) XX-XXX (8 цифр после кода страны)
  const code = numbers.substring(0, 3); // 373
  const rest = numbers.substring(3, 11); // максимум 8 цифр
  
  if (rest.length === 0) {
    return `+${code}`;
  } else if (rest.length <= 3) {
    return `+${code} (${rest}`;
  } else if (rest.length <= 5) {
    return `+${code} (${rest.substring(0, 3)}) ${rest.substring(3)}`;
  } else {
    return `+${code} (${rest.substring(0, 3)}) ${rest.substring(3, 5)}-${rest.substring(5)}`;
  }
};

/**
 * Форматирует номер телефона в украинском формате +380 (XX) XXX-XX-XX
 * @param {string} numbers - Цифры номера
 * @returns {string} Отформатированный номер
 */
const formatUkraine = (numbers) => {
  // Украина: +380 (XX) XXX-XX-XX (9 цифр после кода страны)
  const code = numbers.substring(0, 3); // 380
  const rest = numbers.substring(3, 12); // максимум 9 цифр
  
  if (rest.length === 0) {
    return `+${code}`;
  } else if (rest.length <= 2) {
    return `+${code} (${rest}`;
  } else if (rest.length <= 5) {
    return `+${code} (${rest.substring(0, 2)}) ${rest.substring(2)}`;
  } else if (rest.length <= 7) {
    return `+${code} (${rest.substring(0, 2)}) ${rest.substring(2, 5)}-${rest.substring(5)}`;
  } else {
    return `+${code} (${rest.substring(0, 2)}) ${rest.substring(2, 5)}-${rest.substring(5, 7)}-${rest.substring(7)}`;
  }
};

/**
 * Форматирует номер телефона
 * @param {string} value - Введенное значение
 * @param {string} format - Формат (md или ua), если не указан - определяется автоматически
 * @returns {string} Отформатированный номер телефона
 */
export const formatPhone = (value, format = null) => {
  // Удаляем все нецифровые символы
  let numbers = value.replace(/\D/g, '');
  
  // Если формат не указан, определяем автоматически
  if (!format) {
    format = detectFormat(numbers);
  }
  
  // Если номер начинается с 0, заменяем на код страны
  if (numbers.startsWith('0')) {
    if (format === PHONE_FORMATS.MD) {
      numbers = '373' + numbers.substring(1);
    } else if (format === PHONE_FORMATS.UA) {
      numbers = '380' + numbers.substring(1);
    }
  }
  
  // Если номер не начинается с кода страны, добавляем его
  if (!numbers.startsWith('373') && !numbers.startsWith('380')) {
    if (format === PHONE_FORMATS.MD) {
      numbers = '373' + numbers;
    } else if (format === PHONE_FORMATS.UA) {
      numbers = '380' + numbers;
    }
  }
  
  // Ограничиваем длину
  if (format === PHONE_FORMATS.MD) {
    numbers = numbers.substring(0, 11); // 373 + 8 цифр
  } else if (format === PHONE_FORMATS.UA) {
    numbers = numbers.substring(0, 12); // 380 + 9 цифр
  }
  
  // Форматируем в зависимости от формата
  if (format === PHONE_FORMATS.MD) {
    return formatMoldova(numbers);
  } else if (format === PHONE_FORMATS.UA) {
    return formatUkraine(numbers);
  }
  
  return value;
};

/**
 * Обработчик изменения значения с применением маски
 * @param {Event} e - Событие изменения
 * @param {Function} onChange - Функция обратного вызова
 * @param {string} format - Формат (md или ua)
 */
export const handlePhoneChange = (e, onChange, format = null) => {
  const formatted = formatPhone(e.target.value, format);
  const syntheticEvent = {
    ...e,
    target: {
      ...e.target,
      value: formatted,
    },
  };
  onChange(syntheticEvent);
};

/**
 * Удаляет форматирование из номера телефона
 * @param {string} phone - Отформатированный номер
 * @returns {string} Номер без форматирования
 */
export const unformatPhone = (phone) => {
  return phone.replace(/\D/g, '');
};

