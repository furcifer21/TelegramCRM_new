/**
 * Компонент Navigation - нижняя навигация приложения
 * 
 * Предоставляет навигацию между основными страницами приложения
 */

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation({ currentPath }) {
  const router = useRouter();
  
  // Массив пунктов навигации
  const navItems = [
    {
      path: '/',
      label: 'Главная',
      icon: '🏠', // Можно заменить на SVG иконки
    },
    {
      path: '/clients',
      label: 'Клиенты',
      icon: '👥',
    },
  ];
  
  return (
    <nav className="navigation">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

