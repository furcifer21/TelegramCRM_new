/**
 * Файл _app.js - точка входа в Next.js приложение
 * 
 * Этот файл используется для:
 * - Импорта глобальных стилей
 * - Настройки Layout для всех страниц
 * - Инициализации приложения
 * - Подключения скрипта Telegram WebApp
 */

import Head from 'next/head';
import Layout from '../components/Layout';
import '../styles/globals.scss';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Подключаем скрипт Telegram WebApp для работы Mini App */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

