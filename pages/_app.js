/**
 * Файл _app.js - точка входа в Next.js приложение
 * 
 * Этот файл используется для:
 * - Импорта глобальных стилей
 * - Настройки Layout для всех страниц
 * - Инициализации приложения
 * - Подключения скрипта Telegram WebApp
 * - Keep-alive механизма для Supabase
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import '../styles/globals.scss';

export default function App({ Component, pageProps }) {
  // Keep-alive механизм для Supabase (предотвращает сон на бесплатном тарифе)
  useEffect(() => {
    // Выполняем keep-alive запрос каждые 5 минут (300000 мс)
    const keepAliveInterval = setInterval(async () => {
      try {
        await fetch('/api/keep-alive');
      } catch (error) {
        // Игнорируем ошибки keep-alive
        console.log('Keep-alive request failed:', error);
      }
    }, 5 * 60 * 1000); // 5 минут

    // Выполняем первый запрос сразу при загрузке
    fetch('/api/keep-alive').catch(() => {});

    // Очистка интервала при размонтировании
    return () => {
      clearInterval(keepAliveInterval);
    };
  }, []);

  return (
    <>
      <Head>
        {/* Подключаем скрипт Telegram WebApp для работы Mini App */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
        {/* Подключаем sprite.svg с иконками */}
        <link rel="preload" href="/sprite.svg" as="image" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

