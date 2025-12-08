/*
  Warnings:

  - Added the required column `sucursalId` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sucursalId` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sucursalId` to the `Venta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoSucursal" AS ENUM ('TIENDA', 'ALMACEN', 'CENTRO_DISTRIBUCION', 'TALLER', 'OFICINA');

-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'MANAGER';

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "sucursalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "sucursalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "sucursalId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "TipoSucursal" "TipoSucursal" NOT NULL,
    "estadoOperacion" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferenciaProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "sucursalOrigenId" INTEGER NOT NULL,
    "sucursalDestinoId" INTEGER NOT NULL,
    "fechaTransferencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioEncargadoId" INTEGER,

    CONSTRAINT "TransferenciaProducto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_sucursalOrigenId_fkey" FOREIGN KEY ("sucursalOrigenId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_usuarioEncargadoId_fkey" FOREIGN KEY ("usuarioEncargadoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
