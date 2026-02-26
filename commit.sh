#!/bin/bash
set -e

#git add backend/prisma/schema.prisma backend/prisma/migrations/20250226000000_add_certificate/migration.sql
#git commit -m "feat(backend): Certificate entity and migration"

git add frontend/src/components/BannerSide.tsx
git commit -m "fix(frontend): side banner centered with HTML dimensions"

git add backend/prisma/schema.prisma backend/prisma/migrations/20250226120000_add_banner/ backend/prisma/migrations/20250226130000_banner_html/ backend/src/app/api/banners/
git commit -m "feat(backend): Banner model, migrations, API"

git add frontend/src/components/BannerTop.tsx frontend/src/components/BannerSide.tsx frontend/src/app/admin/banners/ frontend/src/app/admin/layout.tsx
git commit -m "feat(frontend): banner blocks and admin page"

git add frontend/src/components/SidebarPromos.tsx frontend/src/components/SidebarStores.tsx
git commit -m "feat(frontend): SidebarPromos, SidebarStores"

git add backend/scripts/sync-admitad-coupons.ts
git commit -m "feat(backend): sync-admitad-coupons script"

git add docker-compose.yml README.md backend/Dockerfile backend/package.json backend/package-lock.json
git commit -m "chore: docker-compose, README, backend deps"

git add commit.sh
git commit -m "chore: commit.sh"