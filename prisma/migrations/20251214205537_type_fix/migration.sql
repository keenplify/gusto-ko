/*
  Warnings:

  - The `giver_amount` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "giver_amount",
ADD COLUMN     "giver_amount" INTEGER;
