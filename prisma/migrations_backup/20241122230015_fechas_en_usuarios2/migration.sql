/*
  Warnings:

  - You are about to drop the column `fecha_actualizacion` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "fecha_actualizacion",
DROP COLUMN "fecha_creacion";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
