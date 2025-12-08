/*
  Warnings:

  - You are about to drop the column `comentario` on the `RegistroGarantia` table. All the data in the column will be lost.
  - You are about to drop the column `proveedorId` on the `RegistroGarantia` table. All the data in the column will be lost.
  - Added the required column `productoId` to the `RegistroGarantia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RegistroGarantia" DROP CONSTRAINT "RegistroGarantia_proveedorId_fkey";

-- AlterTable
ALTER TABLE "RegistroGarantia" DROP COLUMN "comentario",
DROP COLUMN "proveedorId",
ADD COLUMN     "accionesRealizadas" TEXT,
ADD COLUMN     "conclusion" TEXT,
ADD COLUMN     "productoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
