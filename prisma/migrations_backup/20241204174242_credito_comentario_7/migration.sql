/*
  Warnings:

  - You are about to drop the `_VentaCuotaToVentaProducto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_VentaCuotaToVentaProducto" DROP CONSTRAINT "_VentaCuotaToVentaProducto_A_fkey";

-- DropForeignKey
ALTER TABLE "_VentaCuotaToVentaProducto" DROP CONSTRAINT "_VentaCuotaToVentaProducto_B_fkey";

-- DropTable
DROP TABLE "_VentaCuotaToVentaProducto";
