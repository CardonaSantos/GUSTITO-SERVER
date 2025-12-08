-- DropForeignKey
ALTER TABLE "VentaEliminada" DROP CONSTRAINT "VentaEliminada_clienteId_fkey";

-- AlterTable
ALTER TABLE "VentaEliminada" ALTER COLUMN "clienteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
