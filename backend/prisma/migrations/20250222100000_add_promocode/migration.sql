-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);
