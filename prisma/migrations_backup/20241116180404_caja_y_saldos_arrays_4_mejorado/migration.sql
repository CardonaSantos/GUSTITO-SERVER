-- AlterTable
ALTER TABLE "Deposito" ADD COLUMN     "sucursalId" INTEGER;

-- AlterTable
ALTER TABLE "Egreso" ADD COLUMN     "sucursalId" INTEGER;

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
