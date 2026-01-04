/**
 * Страница календаря с событиями
 * 
 * Отображает календарь с событиями, позволяет переключать месяцы
 * и переходить к событиям по выбранной дате
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getNonArchivedReminders } from '../lib/crm';
import { useLoader } from '../contexts/LoaderContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { ClockIcon, ArrowLeftIcon } from '../components/Icons';

export default function Calendar() {
  const router = useRouter();
  const { setLoading: setGlobalLoading } = useLoader();
  const [reminders, setReminders] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Загружаем события при загрузке страницы
  useEffect(() => {
    loadReminders();
  }, []);
  
  /**
   * Загружает все события
   */
  const loadReminders = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const remindersData = await getNonArchivedReminders();
      setReminders(remindersData);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };
  
  /**
   * Получает события для конкретной даты
   */
  const getRemindersForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reminders.filter(reminder => reminder.date === dateStr);
  };
  
  /**
   * Переход на предыдущий месяц
   */
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  /**
   * Переход на следующий месяц
   */
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  /**
   * Переход на текущий месяц
   */
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  /**
   * Обработчик клика на дату с событием
   */
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    router.push(`/reminders?date=${dateStr}`);
  };
  
  /**
   * Генерирует календарную сетку для текущего месяца
   */
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    
    // День недели первого дня (0 = воскресенье, 1 = понедельник, ...)
    // В России неделя начинается с понедельника, поэтому корректируем
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) {
      firstDayOfWeek = 6; // Воскресенье становится последним днем
    } else {
      firstDayOfWeek = firstDayOfWeek - 1; // Сдвигаем на 1 день назад
    }
    
    // Количество дней в месяце
    const daysInMonth = lastDay.getDate();
    
    // Массив для хранения дней календаря
    const calendarDays = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendarDays.push(date);
    }
    
    return calendarDays;
  };
  
  /**
   * Форматирует название месяца и года
   */
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  /**
   * Проверяет, является ли дата сегодняшней
   */
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const calendarDays = generateCalendar();
  const monthYear = formatMonthYear();
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();
  
  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1 className="page-title">Календарь</h1>
      </div>
      
      {/* Переключение месяцев */}
      <Card>
        <div className="calendar-header">
          <Button
            variant="secondary"
            onClick={goToPreviousMonth}
            className="calendar-nav-button"
          >
            <ArrowLeftIcon className="icon" />
          </Button>
          <div className="calendar-month-year">
            <span className="calendar-month-text">{monthYear}</span>
            {!isCurrentMonth && (
              <Button
                variant="secondary"
                onClick={goToCurrentMonth}
                className="calendar-today-button"
              >
                Сегодня
              </Button>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={goToNextMonth}
            className="calendar-nav-button"
          >
            <ArrowLeftIcon className="icon icon-flipped" />
          </Button>
        </div>
      </Card>
      
      {/* Календарь */}
      {!loading && (
        <Card>
          <div className="calendar-grid">
            {/* Заголовки дней недели */}
            <div className="calendar-weekday">Пн</div>
            <div className="calendar-weekday">Вт</div>
            <div className="calendar-weekday">Ср</div>
            <div className="calendar-weekday">Чт</div>
            <div className="calendar-weekday">Пт</div>
            <div className="calendar-weekday">Сб</div>
            <div className="calendar-weekday">Вс</div>
            
            {/* Дни месяца */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-day calendar-day-empty"></div>;
              }
              
              const dateReminders = getRemindersForDate(date);
              const hasReminders = dateReminders.length > 0;
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`calendar-day ${isTodayDate ? 'calendar-day-today' : ''} ${hasReminders ? 'calendar-day-has-reminders' : ''}`}
                  onClick={hasReminders ? () => handleDateClick(date) : undefined}
                >
                  <span className="calendar-day-number">{date.getDate()}</span>
                  {hasReminders && (
                    <div className="calendar-day-reminder">
                      <ClockIcon className="calendar-reminder-icon" />
                      {dateReminders.length > 1 && (
                        <span className="calendar-reminder-count">{dateReminders.length}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

