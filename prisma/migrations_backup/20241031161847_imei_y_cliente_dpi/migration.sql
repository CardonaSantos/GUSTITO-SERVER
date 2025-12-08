/*
  Warnings:

  - You are about to drop the column `correo` on the `Cliente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dpi]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imei]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Cliente_correo_key";

-- DropIndex
DROP INDEX "Proveedor_correo_key";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "correo",
ADD COLUMN     "dpi" TEXT;

-- AlterTable
ALTER TABLE "Proveedor" ALTER COLUMN "correo" DROP NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "imei" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dpi_key" ON "Cliente"("dpi");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_imei_key" ON "Venta"("imei");
