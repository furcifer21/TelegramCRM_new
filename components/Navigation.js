/**
 * Компонент Navigation - нижняя навигация приложения
 * 
 * Предоставляет навигацию между основными страницами приложения
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeIcon, UsersIcon, ClockIcon, FileTextIcon, CalendarIcon } from './Icons';

export default function Navigation({ currentPath }) {
  const router = useRouter();
  
  // Массив пунктов навигации
  const navItems = [
    {
      path: '/',
      label: 'Главная',
      icon: HomeIcon,
    },
    {
      path: '/clients',
      label: 'Клиенты',
      icon: UsersIcon,
    },
    {
      path: '/calendar',
      label: 'Календарь',
      icon: CalendarIcon,
      isCenter: true,
    },
    {
      path: '/reminders',
      label: 'Напоминания',
      icon: ClockIcon,
    },
    {
      path: '/notes',
      label: 'Заметки',
      icon: FileTextIcon,
    },
  ];
  
  return (
    <nav className="navigation">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-item ${isActive ? 'active' : ''} ${item.isCenter ? 'nav-item-center' : ''}`}
            title={item.label}
          >
            <IconComponent className={`nav-icon ${item.isCenter ? 'nav-icon-center' : ''}`} />
          </Link>
        );
      })}
    </nav>
  );
}

