# Платформа купонов

Монорепо: frontend (Next.js), backend (Next.js), PostgreSQL, nginx.

## Запуск через Docker

1. В корне проекта создай `.env`:

```env
POSTGRES_USER=app
POSTGRES_PASSWORD=Str0ng_Pg_P@ss_Prod
POSTGRES_DB=coupon

JWT_SECRET=

ALLOWED_ORIGINS=http://localhost,http://localhost:3000,https://localhost,https://localhost:3000

FEED_URL=

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

5. Синхронизация промокодов из фида ***** (загрузка по `FEED_URL` из .env):

```bash
docker compose exec backend npx tsx scripts/sync-admitad-coupons.ts
```

Остановка: `docker compose down`

## Учётные записи (после seed)

Пароль: **demonstration**.

- Админ: `super@admin.ru`
- Мерчанты: `admin@admin.ru`, `merchant2@demo.ru`, `merchant3@demo.ru`
- Пользователь: `user@mail.ru`
