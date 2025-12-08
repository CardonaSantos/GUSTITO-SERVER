/*
  Warnings:

  - A unique constraint covering the columns `[ventaId]` on the table `VentaCuota` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VentaCuota_ventaId_key" ON "VentaCuota"("ventaId");
