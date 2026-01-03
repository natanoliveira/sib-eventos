-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "installments" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "PaymentInstallment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInstallment_stripePaymentIntentId_key" ON "PaymentInstallment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInstallment_paymentId_installmentNumber_key" ON "PaymentInstallment"("paymentId", "installmentNumber");

-- AddForeignKey
ALTER TABLE "PaymentInstallment" ADD CONSTRAINT "PaymentInstallment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
