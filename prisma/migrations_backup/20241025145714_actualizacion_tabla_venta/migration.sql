/*
  Warnings:

  - Added the required column `precioVenta` to the `VentaProducto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VentaProducto" ADD COLUMN     "precioVenta" DOUBLE PRECISION NOT NULL;
