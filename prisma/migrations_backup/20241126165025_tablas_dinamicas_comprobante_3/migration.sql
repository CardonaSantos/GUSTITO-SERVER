/*
  Warnings:

  - Added the required column `garantiaMeses` to the `VentaCuota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoVenta` to the `VentaCuota` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VentaCuota" ADD COLUMN     "fechaContrato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "garantiaMeses" INTEGER NOT NULL,
ADD COLUMN     "montoVenta" DOUBLE PRECISION NOT NULL;
