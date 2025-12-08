-- AlterTable
ALTER TABLE "Garantia" ADD COLUMN     "proveedorId" INTEGER;

-- AlterTable
ALTER TABLE "RegistroGarantia" ADD COLUMN     "proveedorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
