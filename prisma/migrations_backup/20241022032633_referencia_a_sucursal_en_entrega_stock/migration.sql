-- AlterTable
ALTER TABLE "EntregaStock" ADD COLUMN     "sucursalId" INTEGER;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
