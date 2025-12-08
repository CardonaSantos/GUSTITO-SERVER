/*
  Warnings:

  - A unique constraint covering the columns `[imei,id]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Venta_imei_key";

-- CreateIndex
CREATE UNIQUE INDEX "Venta_imei_id_key" ON "Venta"("imei", "id");
