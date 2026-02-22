# Платформа купонов

Монорепо: frontend (Next.js), backend (Next.js), PostgreSQL, nginx.

## Запуск через Docker

1. В корне проекта создай `.env`:

```
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=coupon
JWT_SECRET=change-me-in-production
NEXT_PUBLIC_API_URL=http://localhost
```

2. Сборка и запуск:

```bash
pnpm run docker:build
pnpm run docker:up
```

3. Приложение: **http://localhost** (nginx проксирует на frontend и backend). Миграции применяются при старте backend. Чтобы заполнить БД тестовыми данными (категории, мерчанты, купоны, пользователи):

```bash
docker compose exec backend pnpm run db:seed
```

Остановка: `pnpm run docker:down`

## Учётные записи (после seed)

Пароль у всех тестовых пользователей: **demo123**.

- Админ: `super@admin.ru`
- Мерчанты: `admin@admin.ru`, `merchant2@demo.ru`, `merchant3@demo.ru`
- Пользователь: `user@mail.ru`
