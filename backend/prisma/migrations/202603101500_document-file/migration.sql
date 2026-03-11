-- CreateTable
CREATE TABLE "DocumentFile" (
  "slug"      TEXT        NOT NULL,
  "ext"       TEXT        NOT NULL,
  "mime"      TEXT        NOT NULL,
  "data"      BYTEA       NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "DocumentFile_pkey" PRIMARY KEY ("slug")
);

