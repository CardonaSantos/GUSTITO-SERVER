/*
  Warnings:

  - Added the required column `numeroVentas` to the `MetaUsuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MetaUsuario" ADD COLUMN     "numeroVentas" DOUBLE PRECISION NOT NULL;
