# System Control

Система управления с авторизацией пользователей через JWT и тремя ролями доступа.

## Стек технологий

### Backend
- **NestJS** - фреймворк для Node.js
- **Drizzle ORM** - ORM для работы с PostgreSQL
- **PostgreSQL** - база данных
- **JWT** - аутентификация через JSON Web Tokens
- **Passport** - middleware для аутентификации
- **bcrypt** - хеширование паролей
- **Swagger** - документация API

### Frontend
- **Next.js 15** - React фреймворк с App Router
- **React 19** - библиотека для UI
- **Tailwind CSS 4** - стилизация
- **shadcn/ui** - компоненты UI
- **TypeScript** - типизация

## Функциональность

- ✅ Регистрация пользователей
- ✅ Авторизация по email и паролю
- ✅ JWT токены в httpOnly cookies
- ✅ Три роли пользователей: engineer (по умолчанию), manager, observer
- ✅ Автоматический выход после 15 минут неактивности
- ✅ Защищенная страница dashboard
- ✅ Swagger документация API

## Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 20+ (для локальной разработки)

### Запуск с Docker

#### Вариант 1: Раздельный запуск (рекомендуется)

**Backend (с PostgreSQL):**
```bash
cd backend
docker-compose up --build
```

Backend будет доступен на:
- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/docs

**Frontend:**
```bash
cd frontend
docker-compose up --build
```

Frontend будет доступен на http://localhost:3001

#### Вариант 2: Запуск всего вместе

```bash
# В корне проекта
docker-compose up --build
```

Все сервисы будут доступны по адресам:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger документация**: http://localhost:3000/docs

### Локальная разработка

#### Backend

```bash
cd backend

# Установка зависимостей
npm install

# Создайте .env файл
cp .env.example .env

# Запустите PostgreSQL (через Docker)
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=system_control \
  -p 5432:5432 \
  postgres:16-alpine

# Примените миграции БД
npx drizzle-kit push

# Запустите dev сервер
npm run start:dev
```

Backend будет доступен на http://localhost:3000

#### Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Создайте .env.local файл
cp .env.example .env.local

# Запустите dev сервер
npm run dev
```

Frontend будет доступен на http://localhost:3001

## Структура проекта

```
system-control/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Модуль аутентификации
│   │   ├── users/       # Модуль пользователей
│   │   ├── database/    # Схема БД и конфигурация Drizzle
│   │   └── main.ts      # Точка входа
│   ├── drizzle.config.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # App Router страницы
│   │   ├── components/ # React компоненты
│   │   └── lib/        # Утилиты и API клиент
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Аутентификация

- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `GET /auth/profile` - Получить профиль (требует авторизации)

Полная документация доступна в Swagger UI: http://localhost:3000/docs

## Роли пользователей

- **engineer** - роль по умолчанию при регистрации
- **manager** - расширенные права (можно назначить вручную)
- **observer** - права только на просмотр (можно назначить вручную)

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены хранятся в httpOnly cookies
- CORS настроен для работы только с frontend
- Автоматический выход после 15 минут неактивности
- Время жизни токена: 15 минут

## Управление БД

### Создание миграций

```bash
cd backend
npx drizzle-kit generate
```

### Применение миграций

```bash
npx drizzle-kit push
```

### Drizzle Studio (GUI для БД)

```bash
npx drizzle-kit studio
```

## Разработка

### Backend

```bash
cd backend
npm run start:dev      # Dev server с hot-reload
npm run lint           # Проверка кода
npm run lint:fix       # Исправление ошибок
npm run test           # Запуск тестов
```

### Frontend

```bash
cd frontend
npm run dev            # Dev server
npm run build          # Production build
npm run lint           # Проверка кода
npm run lint:fix       # Исправление ошибок
```

## Production

Для production используйте docker-compose с правильными переменными окружения:

1. Измените `JWT_SECRET` на безопасный секретный ключ
2. Настройте CORS в backend для вашего домена
3. Используйте HTTPS
4. Настройте reverse proxy (nginx/traefik)

## Лицензия

UNLICENSED
