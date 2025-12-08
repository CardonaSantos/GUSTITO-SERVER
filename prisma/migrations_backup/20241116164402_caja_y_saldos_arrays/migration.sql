/*
  Warnings:

  - You are about to drop the column `totalDepositos` on the `RegistroCaja` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Deposito" DROP CONSTRAINT "Deposito_registroCajaId_fkey";

-- DropForeignKey
ALTER TABLE "Egreso" DROP CONSTRAINT "Egreso_registroCajaId_fkey";

-- AlterTable
ALTER TABLE "RegistroCaja" DROP COLUMN "totalDepositos";

-- CreateTable
CREATE TABLE "_EgresoToRegistroCaja" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DepositoToRegistroCaja" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EgresoToRegistroCaja_AB_unique" ON "_EgresoToRegistroCaja"("A", "B");

-- CreateIndex
CREATE INDEX "_EgresoToRegistroCaja_B_index" ON "_EgresoToRegistroCaja"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DepositoToRegistroCaja_AB_unique" ON "_DepositoToRegistroCaja"("A", "B");

-- CreateIndex
CREATE INDEX "_DepositoToRegistroCaja_B_index" ON "_DepositoToRegistroCaja"("B");

-- AddForeignKey
ALTER TABLE "_EgresoToRegistroCaja" ADD CONSTRAINT "_EgresoToRegistroCaja_A_fkey" FOREIGN KEY ("A") REFERENCES "Egreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EgresoToRegistroCaja" ADD CONSTRAINT "_EgresoToRegistroCaja_B_fkey" FOREIGN KEY ("B") REFERENCES "RegistroCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepositoToRegistroCaja" ADD CONSTRAINT "_DepositoToRegistroCaja_A_fkey" FOREIGN KEY ("A") REFERENCES "Deposito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepositoToRegistroCaja" ADD CONSTRAINT "_DepositoToRegistroCaja_B_fkey" FOREIGN KEY ("B") REFERENCES "RegistroCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;
