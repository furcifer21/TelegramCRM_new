# Telegram CRM - Система управления клиентами

CRM система, интегрированная с Telegram через Mini App. Система позволяет управлять клиентами, создавать заметки и устанавливать напоминания с автоматическими уведомлениями. Специально для локальных специалистов и малого бизнеса, которым неудобны или слишком сложны классические CRM типа Битрикса и прочего.

## 📋 Описание

Этот проект представляет собой полнофункциональную CRM систему, разработанную на базе Telegram Mini App. Она включает в себя:

- **Next.js 14** - современный React фреймворк с SSR и оптимизацией
- **SCSS** - препроцессор CSS для удобной стилизации
- **Telegram WebApp API** - полная интеграция с Telegram
- **Supabase** - облачная база данных PostgreSQL для хранения всех данных
- **API Routes** - серверные API endpoints для работы с базой данных
- **Keep-alive механизм** - предотвращает сон Supabase на бесплатном тарифе
- **Автоматические напоминания** - система уведомлений через Telegram

## 🚀 Основные возможности

### 1. Управление клиентами
- ✅ Добавление новых клиентов
- ✅ Редактирование информации о клиентах
- ✅ Удаление клиентов
- ✅ Просмотр списка всех клиентов
- ✅ Поиск и фильтрация клиентов

### 2. Заметки
- ✅ Создание заметок о клиентах
- ✅ Просмотр всех заметок в карточке клиента
- ✅ Удаление заметок

### 3. Напоминания
- ✅ Создание напоминаний с датой и временем
- ✅ Привязка напоминаний к клиентам (опционально)
- ✅ Автоматические уведомления в Telegram через бота
- ✅ Отправка напоминаний владельцу и клиенту (если клиент привязан к боту)
- ✅ Просмотр активных напоминаний

### 4. Фильтрация и поиск
- ✅ Поиск клиентов по имени, телефону, email, компании
- ✅ Отображение статистики

### 5. Авторизация через Telegram
- ✅ Автоматическая авторизация через Telegram Mini App
- ✅ Использование данных пользователя Telegram

## 🚀 Быстрый старт

### 1. Настройка Supabase

#### Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com) и создайте аккаунт (если еще нет)
2. Создайте новый проект
3. Дождитесь завершения инициализации проекта (обычно 1-2 минуты)

#### Получение ключей доступа

1. В проекте Supabase перейдите в **Settings** → **API**
2. Скопируйте следующие значения:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** ключ (начинается с `eyJ...`)

#### Создание таблиц в базе данных

1. В проекте Supabase перейдите в **SQL Editor**
2. Выполните следующий SQL скрипт для создания всех необходимых таблиц:

```sql
-- Таблица клиентов
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  notes TEXT,
  -- Связка с Telegram-ботом (клиент)
  telegram_username TEXT,
  telegram_chat_id BIGINT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица заметок
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица напоминаний
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL DEFAULT '09:00',
  notified BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица настроек
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY,
  notifications BOOLEAN DEFAULT TRUE,
  sound BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'ru',
  theme TEXT DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON notes(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_client_id ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_archived ON reminders(archived);
```

3. Нажмите **Run** для выполнения скрипта

#### Миграция существующих данных (если таблицы уже созданы)

Если вы уже создали таблицы без `user_id`, выполните этот скрипт для добавления колонки:

```sql
-- Добавляем user_id в существующие таблицы
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Добавляем поля для Telegram-связки клиентов (если их ещё нет)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS telegram_first_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS telegram_last_name TEXT;

-- Обновляем существующие записи (если есть)
-- ВНИМАНИЕ: Это установит user_id = 'default' для всех существующих записей
-- После этого каждый пользователь должен будет создать свои данные заново
UPDATE clients SET user_id = 'default' WHERE user_id IS NULL;
UPDATE notes SET user_id = 'default' WHERE user_id IS NULL;
UPDATE reminders SET user_id = 'default' WHERE user_id IS NULL;

-- Делаем user_id обязательным
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reminders ALTER COLUMN user_id SET NOT NULL;

-- Добавляем индексы
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
```

#### Настройка Row Level Security (RLS)

Для безопасности данных рекомендуется включить RLS. В SQL Editor выполните:

```sql
-- Включаем RLS для всех таблиц
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Политики для клиентов: пользователи видят только своих клиентов
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Политики для заметок: пользователи видят только свои заметки
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Политики для напоминаний: пользователи видят только свои напоминания
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Политики для настроек: пользователи видят только свои настройки
CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can insert own settings" ON settings
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update own settings" ON settings
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Упрощенная версия: разрешаем все операции для анонимных пользователей
-- (так как мы используем anon ключ и проверяем user_id в API)
-- ВНИМАНИЕ: Это работает только если вы проверяете user_id в API endpoints!
-- Для большей безопасности используйте политики выше с проверкой через JWT
DROP POLICY IF EXISTS "Allow all for clients" ON clients;
DROP POLICY IF EXISTS "Allow all for notes" ON notes;
DROP POLICY IF EXISTS "Allow all for reminders" ON reminders;
DROP POLICY IF EXISTS "Allow all for settings" ON settings;

-- Временная политика для работы через API (пока не настроен JWT)
-- В production рекомендуется использовать JWT и политики выше
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for reminders" ON reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for settings" ON settings FOR ALL USING (true) WITH CHECK (true);
```

### 2. Настройка переменных окружения

1. Создайте файл `.env.local` в корне проекта (можно скопировать из `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Токен Telegram-бота (из BotFather), используется для отправки сообщений
BOT_SECRET=123456:ABC-DEF...
```

2. Замените значения на ваши данные из Supabase и BotFather:
- **NEXT_PUBLIC_SUPABASE_URL** - найдите в Supabase: Settings → API → Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - найдите в Supabase: Settings → API → anon public
- **BOT_SECRET** - токен бота из BotFather

2. Замените значения на ваши данные из Supabase:
   - **NEXT_PUBLIC_SUPABASE_URL** - найдите в Supabase: Settings → API → Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY** - найдите в Supabase: Settings → API → anon public

**Важно:** После изменения `.env.local` необходимо перезапустить сервер разработки (`npm run dev`)

### 3. Установка зависимостей

```bash
npm install
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### 5. Сборка для production

```bash
npm run build
npm start
```

## 📁 Структура проекта

```
telegram-crm/
├── components/          # React компоненты
│   ├── Layout.js        # Основной layout приложения
│   ├── Navigation.js    # Навигация между страницами
│   ├── Card.js          # Компонент карточки
│   ├── Button.js        # Компонент кнопки
│   ├── Input.js         # Компонент поля ввода
│   ├── Textarea.js      # Компонент многострочного ввода
│   └── Modal.js         # Компонент модального окна
├── lib/                 # Утилиты и библиотеки
│   ├── telegram.js        # Работа с Telegram WebApp API (Mini App)
│   ├── telegram-server.js # Парсинг initData и user_id на сервере
│   ├── telegram-bot.js    # Отправка сообщений в Telegram Bot API
│   ├── api.js             # Функции для API запросов
│   ├── supabase.js        # Утилита для работы с Supabase
│   └── crm.js             # Утилиты для работы с данными CRM
├── pages/               # Страницы Next.js
│   ├── _app.js          # Точка входа приложения (с keep-alive)
│   ├── index.js         # Главная страница
│   ├── clients.js         # Список клиентов
│   ├── api/               # API endpoints
│   │   ├── clients.js     # API для клиентов (общий)
│   │   ├── clients/[id].js# API для одного клиента
│   │   ├── notes.js       # API для заметок
│   │   ├── notes/[id].js  # API для одной заметки
│   │   ├── reminders.js   # API для напоминаний (создание/список)
│   │   ├── reminders/[id].js # API для одного напоминания
│   │   ├── settings.js    # API для настроек
│   │   ├── telegram-webhook.js # Webhook для Telegram-бота (/start link_...)
│   │   ├── cron.js        # Крон-эндпоинт для отправки напоминаний через бота
│   │   └── keep-alive.js  # Keep-alive для Supabase
│   ├── client/          # Страницы работы с клиентами
│   │   ├── new.js       # Создание нового клиента
│   │   ├── [id].js      # Карточка клиента
│   │   └── edit/        # Редактирование клиента
│   │       └── [id].js
│   └── reminder/        # Страницы работы с напоминаниями
│       └── new.js       # Создание напоминания
├── styles/              # Стили
│   ├── globals.scss     # Глобальные стили
│   ├── variables.scss   # SCSS переменные
│   ├── mixins.scss      # SCSS миксины
│   ├── components/      # Стили компонентов
│   └── pages/           # Стили страниц
├── next.config.js       # Конфигурация Next.js
└── package.json         # Зависимости проекта
```

## 📱 Использование

### Управление клиентами

#### Добавление клиента
1. На главной странице нажмите "Добавить клиента"
2. Или перейдите в "Все клиенты" и нажмите "➕ Добавить"
3. Заполните форму (обязательно только имя)
4. Нажмите "Сохранить"

#### Просмотр клиентов
1. Нажмите "Все клиенты" на главной странице или в навигации
2. Используйте поиск для фильтрации клиентов
3. Нажмите на карточку клиента для просмотра детальной информации

#### Редактирование клиента
1. Откройте карточку клиента
2. Нажмите "✏️ Редактировать"
3. Измените нужные поля
4. Нажмите "Сохранить"

#### Удаление клиента
1. Откройте карточку клиента
2. Нажмите "🗑️ Удалить"
3. Подтвердите удаление

### Создание напоминаний

#### Быстрое создание
1. На главной странице нажмите "⏰ Создать напоминание"
2. Заполните форму (текст, дата, время)
3. Опционально привяжите к клиенту
4. Нажмите "Сохранить"

#### Создание для клиента
1. Откройте карточку клиента
2. В разделе "Напоминания" нажмите "➕ Добавить"
3. Заполните форму
4. Нажмите "Сохранить"

#### Автоматические уведомления через бота
- Отдельный крон-скрипт (или внешний планировщик) периодически вызывает `/api/cron`
- Эндпоинт `/api/cron` находит все напоминания с наступившим временем (`notified = false`, `archived = false`)
- Если напоминание не привязано к клиенту — бот шлёт сообщение **владельцу**
- Если напоминание привязано к клиенту и у него есть `telegram_chat_id` — бот шлёт сообщение **и владельцу, и клиенту**
- После успешной отправки напоминание помечается как `notified = true` и `archived = true`

### Заметки

#### Добавление заметки
1. Откройте карточку клиента
2. В разделе "Заметки" нажмите "➕ Добавить"
3. Введите текст заметки
4. Нажмите "Сохранить"

#### Просмотр заметок
- Все заметки отображаются в карточке клиента
- Заметки отсортированы по дате создания (новые сверху)

#### Удаление заметки
1. В карточке клиента найдите нужную заметку
2. Нажмите кнопку "🗑️" рядом с заметкой
3. Подтвердите удаление

## 🔧 Настройка

### Keep-alive механизм

Приложение автоматически отправляет keep-alive запросы к Supabase каждые 5 минут, чтобы предотвратить переход базы данных в режим сна на бесплатном тарифе. Это реализовано в `pages/_app.js` и использует endpoint `/api/keep-alive`.

### Настройка бота в Telegram

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота и сохраните его в `BOT_SECRET`
3. Установите Web App URL через команду `/newapp` или `/setmenubutton`
4. Укажите URL вашего приложения (должен быть HTTPS в production)
5. Настройте webhook для привязки клиентов к боту:
   ```text
   https://api.telegram.org/bot<ВАШ_BOT_TOKEN>/setWebhook?url=https://ВАШ_ДОМЕН/api/telegram-webhook
   ```
6. Проверьте текущее состояние webhook:
   ```text
   https://api.telegram.org/bot<ВАШ_BOT_TOKEN>/getWebhookInfo
   ```

**Важно:** Telegram требует HTTPS для работы Mini App и webhook'ов в production!

### Связка клиента CRM с его Telegram

1. Откройте карточку нужного клиента в CRM
2. В блоке `Telegram`:
   - если клиент ещё не подключён — будет доступна кнопка **«Скопировать ссылку для подключения»**
   - если клиент уже подключён — будет указан статус «Подключен (@username)»
3. Отправьте скопированную ссылку клиенту в любом мессенджере
4. Клиент нажимает ссылку → открывается ваш бот с командой `/start link_<ownerId>_<clientId>`
5. Telegram отправляет апдейт на `/api/telegram-webhook`, а сервер:
   - находит нужного клиента в таблице `clients`
   - записывает `telegram_chat_id`, `telegram_username`, `telegram_first_name`, `telegram_last_name`
6. После этого все напоминания, привязанные к этому клиенту, могут отправляться боту не только владельцу, но и самому клиенту

### Хранение данных

Все данные хранятся в **Supabase** (PostgreSQL база данных):
- Клиенты
- Заметки
- Напоминания
- Настройки пользователя

**Важно:** Каждый пользователь Telegram имеет свои собственные данные. Данные изолированы по `user_id` - пользователи не видят данные друг друга. Данные синхронизируются между всеми устройствами одного пользователя автоматически.

## 🚀 Запуск в Telegram

### Шаг 1: Деплой приложения

#### Вариант A: Деплой на Vercel (рекомендуется)

1. **Подготовка репозитория:**
   - Убедитесь, что ваш код загружен в GitHub, GitLab или Bitbucket

2. **Создание проекта на Vercel:**
   - Перейдите на [vercel.com](https://vercel.com) и войдите через GitHub
   - Нажмите "Add New Project"
   - Выберите ваш репозиторий
   - Vercel автоматически определит Next.js проект

3. **Деплой:**
   - Нажмите "Deploy"
   - Дождитесь завершения деплоя
   - Скопируйте URL вашего приложения (например: `https://your-app.vercel.app`)

#### Вариант B: Деплой на другой платформе

Приложение можно задеплоить на любую платформу, поддерживающую Next.js:
- **Netlify** - аналогично Vercel
- **AWS Amplify** - для AWS инфраструктуры
- **DigitalOcean App Platform** - простой деплой
- **Свой сервер** - с поддержкой Node.js и HTTPS

**Важно:** Telegram требует HTTPS для работы Mini App!

### Шаг 2: Настройка бота в BotFather

1. **Откройте [@BotFather](https://t.me/BotFather) в Telegram**

2. **Создайте нового бота (если еще не создан):**
   ```
   /newbot
   ```
   - Введите имя бота
   - Введите username бота (должен заканчиваться на `bot`)
   - Сохраните токен бота

3. **Настройте Web App:**
   
   **Способ 1: Через команду `/newapp` (рекомендуется)**
   ```
   /newapp
   ```
   - Выберите вашего бота из списка
   - Введите название приложения
   - Введите описание (опционально)
   - Загрузите фото (опционально) - отправьте `/empty` чтобы пропустить
   - Загрузите GIF (опционально) - отправьте `/empty` чтобы пропустить
   - Загрузите короткое видео (опционально) - отправьте `/empty` чтобы пропустить
   - Введите URL вашего приложения: `https://your-app.vercel.app`
   - Введите короткое имя (опционально)

   **Способ 2: Через команду `/setmenubutton`**
   ```
   /setmenubutton
   ```
   - Выберите вашего бота
   - Введите текст кнопки (например: "Открыть CRM")
   - Введите URL: `https://your-app.vercel.app`

4. **Проверка:**
   - Откройте вашего бота в Telegram
   - Нажмите на кнопку меню или кнопку Web App
   - Приложение должно открыться в Telegram

### Шаг 3: Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню или кнопку Web App
3. Приложение должно загрузиться
4. Проверьте работу всех функций:
   - Добавление клиента
   - Просмотр списка клиентов
   - Создание заметок
   - Создание напоминаний
   - Поиск клиентов

## 📱 Использование Telegram WebApp API

### Инициализация

Приложение автоматически инициализируется при загрузке через компонент `Layout`. Все функции доступны через утилиты в `lib/telegram.js`.

### Основные функции

#### Получение данных пользователя

```javascript
import { getTelegramUser } from '../lib/telegram';

const user = getTelegramUser();
if (user) {
  console.log('User ID:', user.id);
  console.log('User name:', user.first_name);
}
```

#### Показ alert/confirm

```javascript
import { getTelegramWebApp } from '../lib/telegram';

const webApp = getTelegramWebApp();
if (webApp) {
  webApp.showAlert('Привет!');
  webApp.showConfirm('Вы уверены?', (confirmed) => {
    if (confirmed) {
      // Пользователь подтвердил
    }
  });
}
```

#### Тактильная обратная связь

```javascript
const webApp = getTelegramWebApp();
if (webApp?.HapticFeedback) {
  webApp.HapticFeedback.impactOccurred('medium');
  webApp.HapticFeedback.notificationOccurred('success');
}
```

#### Облачное хранилище

```javascript
const webApp = getTelegramWebApp();
if (webApp?.CloudStorage) {
  // Сохранение
  webApp.CloudStorage.setItem('key', 'value');
  
  // Получение
  webApp.CloudStorage.getItem('key', (error, value) => {
    if (!error) {
      console.log('Value:', value);
    }
  });
}
```

## 🎨 Стилизация

### Использование SCSS переменных

```scss
@import '../styles/variables.scss';

.my-component {
  color: $primary-color;
  padding: $spacing-md;
  border-radius: $radius-md;
}
```

### Использование миксинов

```scss
@import '../styles/mixins.scss';

.my-container {
  @include flex-center;
  @include card;
}
```

### Использование CSS переменных Telegram

Приложение автоматически применяет цвета темы Telegram к CSS переменным:

- `--tg-theme-bg-color` - цвет фона
- `--tg-theme-text-color` - цвет текста
- `--tg-theme-hint-color` - цвет подсказок
- `--tg-theme-link-color` - цвет ссылок
- `--tg-theme-button-color` - цвет кнопок
- `--tg-theme-button-text-color` - цвет текста кнопок
- `--tg-theme-secondary-bg-color` - вторичный цвет фона

## 🔒 Безопасность

### Важные моменты:

1. **Все данные хранятся в Supabase** - облачная база данных PostgreSQL
2. **Используйте HTTPS в production** (Telegram требует HTTPS)
3. **Не храните секретные ключи в клиентском коде** - используйте переменные окружения
4. **Валидируйте все данные** перед сохранением (валидация происходит на сервере)
5. **Настройте Row Level Security (RLS)** в Supabase для дополнительной безопасности
6. **anon ключ безопасен для клиентского кода** - он используется только для чтения/записи данных через RLS политики

## 🚢 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения (если используете бэкенд)
3. Деплой произойдет автоматически

### Другие платформы

Приложение можно задеплоить на любую платформу, поддерживающую Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- И другие

**Важно:** Убедитесь, что приложение доступно по HTTPS!

## 📚 Дополнительные ресурсы

- [Документация Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Документация Next.js](https://nextjs.org/docs)

## 🤝 Вклад

Этот проект является открытым. Вы можете свободно использовать и модифицировать его под свои нужды.

## 📝 Лицензия

MIT

## 💡 Советы по разработке

1. **Тестирование вне Telegram**: Приложение работает и вне Telegram, но с ограниченным функционалом (нет уведомлений)
2. **Использование Dev Tools**: Откройте DevTools в браузере для отладки
3. **Логирование**: Используйте `console.log` для отладки (в production уберите)
4. **Обработка ошибок**: Всегда обрабатывайте ошибки при работе с данными
5. **Оптимизация**: Используйте Next.js Image компонент для изображений
6. **Адаптивность**: Приложение автоматически адаптируется под размер экрана Telegram

## 🐛 Известные ограничения и проблемы

### Локальная разработка

- **Ошибки Telegram WebApp** - это нормально! При локальной разработке (localhost) некоторые методы Telegram WebApp API недоступны. Ошибки вида `Method showPopup is not supported` можно игнорировать - в production (в реальном Telegram приложении) все будет работать корректно.

- **Ошибка 500 при работе с API** - проверьте:
  1. Создан ли файл `.env.local` с правильными переменными окружения
  2. Выполнены ли SQL скрипты для создания таблиц в Supabase
  3. Настроены ли политики RLS (Row Level Security) в Supabase
  4. Перезапущен ли сервер разработки после изменения `.env.local`

### Production

- Напоминания отправляются через эндпоинт `/api/cron`, поэтому Mini App может быть закрыта
- Необходимо настроить внешний планировщик (cron, GitHub Actions, UptimeRobot и т.п.), который будет регулярно вызывать `/api/cron`
- На бесплатном тарифе Supabase база данных может уходить в сон после 1 недели неактивности (keep-alive механизм предотвращает это)
- Keep-alive запросы выполняются только когда приложение открыто в браузере

## 📞 Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории проекта.
