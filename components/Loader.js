/**
 * Компонент Loader - индикатор загрузки
 * 
 * Отображает полупрозрачный фон с анимированным спиннером в центре
 */

export default function Loader({ show = false }) {
  if (!show) return null;
  
  return (
    <div className="loader-overlay">
      <div className="loader-spinner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            strokeDasharray="47.124" 
            strokeDashoffset="47.124"
            transform="rotate(-90 12 12)"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="1.5s"
              values="47.124;11.781;47.124"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </div>
  );
}

