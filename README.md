# Платформа купонов

Монорепо: frontend (Next.js), backend (Next.js), PostgreSQL, nginx.

## Запуск через Docker

1. В корне проекта создай `.env`:

```env
POSTGRES_USER=app
POSTGRES_PASSWORD=Str0ng_Pg_P@ss_Prod
POSTGRES_DB=coupon

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0

ALLOWED_ORIGINS=http://localhost,http://localhost:3000,https://localhost,https://localhost:3000

RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW_MS=60000

NEXT_PUBLIC_API_URL=http://localhost
```

2. Перед первой сборкой установи зависимости бэкенда (используется в `backend/docker-entrypoint.sh` при старте):

```bash
cd backend && npm install && cd ..
```

3. Сборка и запуск:

```bash
docker compose up -d --build
```

4. Приложение: **http://localhost**. Миграции применяются при старте backend. Тестовые данные:

```bash
docker compose exec backend pnpm run db:seed
```

Остановка: `docker compose down`

## Учётные записи (после seed)

Пароль: **demo123**.

- Админ: `super@admin.ru`
- Мерчанты: `admin@admin.ru`, `merchant2@demo.ru`, `merchant3@demo.ru`
- Пользователь: `user@mail.ru`
