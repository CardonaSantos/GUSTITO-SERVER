/*
  Warnings:

  - You are about to drop the column `stockId` on the `EliminacionStock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EliminacionStock" DROP CONSTRAINT "EliminacionStock_stockId_fkey";

-- AlterTable
ALTER TABLE "EliminacionStock" DROP COLUMN "stockId";
