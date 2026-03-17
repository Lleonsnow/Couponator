# PostgreSQL dump/restore (читает переменные из .env: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
# Контейнер postgres должен быть запущен (docker compose up -d postgres).

POSTGRES_CONTAINER := $(shell docker compose ps -q postgres 2>/dev/null || true)
DUMP_FILE ?= dump_$(shell date +%Y%m%d_%H%M%S).sql

.PHONY: db-dump db-restore db-restore-clean

# Создать дамп БД (результат: dump_YYYYMMDD_HHMMSS.sql или DUMP_FILE=имя.sql make db-dump)
db-dump:
ifneq (,$(POSTGRES_CONTAINER))
	docker compose exec -T postgres sh -c 'pg_dump -U "$$POSTGRES_USER" "$$POSTGRES_DB"' > "$(DUMP_FILE)"
	@echo "Dump saved: $(DUMP_FILE)"
else
	@echo "Postgres container not running. Start with: docker compose up -d postgres"
	@exit 1
endif

# Восстановить в пустую БД (если БД уже с данными — будут ошибки «already exists»).
# Используй db-restore-clean для восстановления с предварительной очисткой схемы.
# make db-restore DUMP_FILE=dump_20250101_120000.sql
db-restore:
ifneq (,$(POSTGRES_CONTAINER))
	@test -f "$(DUMP_FILE)" || (echo "File not found: $(DUMP_FILE)"; exit 1)
	docker compose exec -T -i postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' < "$(DUMP_FILE)"
	@echo "Restored from $(DUMP_FILE)"
else
	@echo "Postgres container not running. Start with: docker compose up -d postgres"
	@exit 1
endif

# Очистить схему public и восстановить из дампа (для непустой БД).
# make db-restore-clean DUMP_FILE=dump_20260317_142252.sql
db-restore-clean:
ifneq (,$(POSTGRES_CONTAINER))
	@test -f "$(DUMP_FILE)" || (echo "File not found: $(DUMP_FILE)"; exit 1)
	@echo "Dropping schema public and restoring from $(DUMP_FILE)..."
	docker compose exec -T postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO \"$$POSTGRES_USER\"; GRANT ALL ON SCHEMA public TO public;"'
	docker compose exec -T -i postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"' < "$(DUMP_FILE)"
	@echo "Restored from $(DUMP_FILE)"
else
	@echo "Postgres container not running. Start with: docker compose up -d postgres"
	@exit 1
endif
