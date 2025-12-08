/*
  Warnings:

  - You are about to drop the column `TipoSucursal` on the `Sucursal` table. All the data in the column will be lost.
  - Added the required column `tipoSucursal` to the `Sucursal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sucursal" DROP COLUMN "TipoSucursal",
ADD COLUMN     "tipoSucursal" "TipoSucursal" NOT NULL;
