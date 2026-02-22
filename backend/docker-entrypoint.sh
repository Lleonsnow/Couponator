#!/bin/sh
set -e
cd /app
npx prisma migrate deploy
exec node node_modules/next/dist/bin/next start -p 3002
