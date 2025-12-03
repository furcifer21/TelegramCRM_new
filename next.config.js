/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем поддержку SCSS
  sassOptions: {
    // Автоматически импортируем переменные и миксины во все SCSS файлы
    // includePaths: ['./styles'],
  },
  // Настройки для Telegram Mini App
  // Telegram требует, чтобы приложение было доступно по HTTPS
  // В production убедитесь, что используете HTTPS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

