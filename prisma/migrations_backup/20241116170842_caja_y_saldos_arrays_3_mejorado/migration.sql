/*
  Warnings:

  - You are about to drop the `_DepositoToRegistroCaja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EgresoToRegistroCaja` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DepositoToRegistroCaja" DROP CONSTRAINT "_DepositoToRegistroCaja_A_fkey";

-- DropForeignKey
ALTER TABLE "_DepositoToRegistroCaja" DROP CONSTRAINT "_DepositoToRegistroCaja_B_fkey";

-- DropForeignKey
ALTER TABLE "_EgresoToRegistroCaja" DROP CONSTRAINT "_EgresoToRegistroCaja_A_fkey";

-- DropForeignKey
ALTER TABLE "_EgresoToRegistroCaja" DROP CONSTRAINT "_EgresoToRegistroCaja_B_fkey";

-- AlterTable
ALTER TABLE "Deposito" ALTER COLUMN "registroCajaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Egreso" ALTER COLUMN "registroCajaId" DROP NOT NULL;

-- DropTable
DROP TABLE "_DepositoToRegistroCaja";

-- DropTable
DROP TABLE "_EgresoToRegistroCaja";

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;
