/*
  Warnings:

  - You are about to drop the column `pxb` on the `Sucursal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sucursal" DROP COLUMN "pxb",
ADD COLUMN     "pbx" TEXT;
