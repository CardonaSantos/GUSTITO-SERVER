-- AlterTable
ALTER TABLE "Deposito" ADD COLUMN     "usuarioId" INTEGER;

-- AlterTable
ALTER TABLE "Egreso" ADD COLUMN     "usuarioId" INTEGER;

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
