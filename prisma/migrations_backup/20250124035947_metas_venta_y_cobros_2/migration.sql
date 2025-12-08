/*
  Warnings:

  - Added the required column `metaCobroId` to the `DepositoCobro` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DepositoCobro" ADD COLUMN     "metaCobroId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "DepositoCobro" ADD CONSTRAINT "DepositoCobro_metaCobroId_fkey" FOREIGN KEY ("metaCobroId") REFERENCES "MetaCobros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
