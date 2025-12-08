/*
  Warnings:

  - You are about to drop the `ComprobanteVentaCuota` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `testigos` to the `VentaCuota` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ComprobanteVentaCuota" DROP CONSTRAINT "ComprobanteVentaCuota_ventaCuotaId_fkey";

-- AlterTable
ALTER TABLE "VentaCuota" ADD COLUMN     "testigos" JSONB NOT NULL;

-- DropTable
DROP TABLE "ComprobanteVentaCuota";

-- CreateTable
CREATE TABLE "PlantillaComprobante" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "sucursalId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantillaComprobante_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlantillaComprobante" ADD CONSTRAINT "PlantillaComprobante_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
