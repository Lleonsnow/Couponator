-- CreateTable
CREATE TABLE "MerchantLogo" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mime" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantLogo_merchantId_key" ON "MerchantLogo"("merchantId");

-- AddForeignKey
ALTER TABLE "MerchantLogo" ADD CONSTRAINT "MerchantLogo_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
