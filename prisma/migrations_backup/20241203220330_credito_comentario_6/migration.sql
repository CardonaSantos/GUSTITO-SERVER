/*
  Warnings:

  - You are about to drop the column `montoTotalConInteres` on the `Venta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Venta" DROP COLUMN "montoTotalConInteres";

-- AlterTable
ALTER TABLE "VentaCuota" ADD COLUMN     "montoTotalConInteres" INTEGER;
