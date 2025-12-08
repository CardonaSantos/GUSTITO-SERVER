/*
  Warnings:

  - You are about to drop the column `categoria` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `fechaVencimiento` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `cantidad` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `productoId` on the `Venta` table. All the data in the column will be lost.
  - Added the required column `precioVenta` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioCosto` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VENDEDOR');

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_productoId_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "categoria",
DROP COLUMN "fechaVencimiento",
DROP COLUMN "precio",
ADD COLUMN     "precioVenta" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "entregaStockId" INTEGER,
ADD COLUMN     "fechaVencimiento" TIMESTAMP(3),
ADD COLUMN     "precioCosto" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Venta" DROP COLUMN "cantidad",
DROP COLUMN "productoId";

-- CreateTable
CREATE TABLE "EntregaStock" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "fechaEntrega" TIMESTAMP(3) NOT NULL,
    "recibidoPorId" INTEGER NOT NULL,
    "creadoPorId" INTEGER NOT NULL,

    CONSTRAINT "EntregaStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaProducto" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "VentaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "contrasena" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriaToProducto" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriaToProducto_AB_unique" ON "_CategoriaToProducto"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriaToProducto_B_index" ON "_CategoriaToProducto"("B");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_entregaStockId_fkey" FOREIGN KEY ("entregaStockId") REFERENCES "EntregaStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_recibidoPorId_fkey" FOREIGN KEY ("recibidoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
