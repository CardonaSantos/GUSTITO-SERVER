/*
  Warnings:

  - Added the required column `sucursalId` to the `VentaEliminada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VentaEliminada" ADD COLUMN     "sucursalId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
