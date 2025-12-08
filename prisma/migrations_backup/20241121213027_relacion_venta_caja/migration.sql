-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "registroCajaId" INTEGER;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;
