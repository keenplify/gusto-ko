-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "giver_amount" TEXT,
ALTER COLUMN "itemId" DROP NOT NULL;
