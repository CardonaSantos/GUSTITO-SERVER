/*
  Warnings:

  - You are about to drop the column `detallesVenta` on the `VentaEliminada` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `VentaEliminada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalVenta` to the `VentaEliminada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VentaEliminada" DROP COLUMN "detallesVenta",
ADD COLUMN     "clienteId" INTEGER NOT NULL,
ADD COLUMN     "totalVenta" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
