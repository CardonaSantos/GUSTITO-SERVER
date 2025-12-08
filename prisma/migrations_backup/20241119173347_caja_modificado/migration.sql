/*
  Warnings:

  - You are about to drop the column `totalEgresos` on the `RegistroCaja` table. All the data in the column will be lost.
  - You are about to drop the column `totalVentas` on the `RegistroCaja` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RegistroCaja" DROP COLUMN "totalEgresos",
DROP COLUMN "totalVentas";
