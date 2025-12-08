/*
  Warnings:

  - Added the required column `modificadoPorId` to the `HistorialPrecioCosto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HistorialPrecioCosto" ADD COLUMN     "modificadoPorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "HistorialPrecioCosto" ADD CONSTRAINT "HistorialPrecioCosto_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
