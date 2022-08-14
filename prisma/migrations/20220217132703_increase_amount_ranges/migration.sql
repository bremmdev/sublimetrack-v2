/*
  Warnings:

  - You are about to drop the column `description` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(8,2);

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "description",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(8,2);
