/*
  Warnings:

  - A unique constraint covering the columns `[sucursalId]` on the table `SucursalSaldo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SucursalSaldo_sucursalId_key" ON "SucursalSaldo"("sucursalId");
