/*
  Warnings:

  - Added the required column `tipo` to the `PrecioProducto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPrecio" AS ENUM ('CREADO_POR_SOLICITUD', 'ESTANDAR');

-- AlterTable
ALTER TABLE "PrecioProducto" ADD COLUMN     "tipo" "TipoPrecio" NOT NULL,
ADD COLUMN     "usado" BOOLEAN NOT NULL DEFAULT false;
