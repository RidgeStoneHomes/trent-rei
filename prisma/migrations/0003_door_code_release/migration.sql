-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "codeReleasedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PropertyArrival" ADD COLUMN     "codeRevealHours" INTEGER DEFAULT 24;

