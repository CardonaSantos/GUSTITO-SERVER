-- AlterTable
ALTER TABLE "VentaCuota" ADD COLUMN     "ventaId" INTEGER;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
