/*
  Warnings:

  - Added the required column `estado` to the `MetaCobros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `MetaUsuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoMetaCobro" AS ENUM ('CANCELADO', 'ABIERTO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "EstadoMetaTienda" AS ENUM ('CANCELADO', 'ABIERTO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "MetaCobros" ADD COLUMN     "estado" "EstadoMetaCobro" NOT NULL,
ALTER COLUMN "fechaInicio" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MetaUsuario" ADD COLUMN     "estado" "EstadoMetaTienda" NOT NULL,
ALTER COLUMN "fechaInicio" SET DEFAULT CURRENT_TIMESTAMP;
