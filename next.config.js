/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем поддержку SCSS
  sassOptions: {
    // Автоматически импортируем переменные и миксины во все SCSS файлы
    // includePaths: ['./styles'],
  },
  // Настройки заголовков
  async headers() {
    return [
      {
        // Применяем ко всем маршрутам
        source: '/:path*',
        headers: [
          // ВАЖНО: Мы убрали X-Frame-Options: SAMEORIGIN
          // Теперь добавляем заголовки, разрешающие доступ (CORS)
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;