/*
  Warnings:

  - You are about to drop the column `creadoPorId` on the `EntregaStock` table. All the data in the column will be lost.
  - You are about to drop the column `proveedorId` on the `Producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigoProducto]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[correo]` on the table `Proveedor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actualizadoEn` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigoProducto` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizadoEn` to the `Proveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `Proveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `Proveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costoTotal` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EntregaStock" DROP CONSTRAINT "EntregaStock_creadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_proveedorId_fkey";

-- AlterTable
ALTER TABLE "EntregaStock" DROP COLUMN "creadoPorId";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "proveedorId",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "codigoProducto" TEXT NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "emailContacto" TEXT,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "nombreContacto" TEXT,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "razonSocial" TEXT,
ADD COLUMN     "rfc" TEXT,
ADD COLUMN     "telefono" TEXT NOT NULL,
ADD COLUMN     "telefonoContacto" TEXT;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "costoTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "VentaProducto" ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoProducto_key" ON "Producto"("codigoProducto");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_correo_key" ON "Proveedor"("correo");
