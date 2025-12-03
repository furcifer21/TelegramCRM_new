/**
 * Компонент Navigation - нижняя навигация приложения
 * 
 * Предоставляет навигацию между основными страницами приложения
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeIcon, UsersIcon } from './Icons';

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
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <IconComponent className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

