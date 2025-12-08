/*
  Warnings:

  - Made the column `ventaId` on table `Pago` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pago" ALTER COLUMN "ventaId" SET NOT NULL;
