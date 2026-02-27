-- AlterTable: replace imageUrl/linkUrl/alt with html
ALTER TABLE "Banner" DROP COLUMN "imageUrl";
ALTER TABLE "Banner" DROP COLUMN "linkUrl";
ALTER TABLE "Banner" DROP COLUMN "alt";
ALTER TABLE "Banner" ADD COLUMN "html" TEXT NOT NULL DEFAULT '';
