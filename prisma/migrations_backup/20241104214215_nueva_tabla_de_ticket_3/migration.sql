/*
  Warnings:

  - You are about to drop the column `fechaFinal` on the `TicketSorteo` table. All the data in the column will be lost.
  - You are about to drop the column `fechaInicio` on the `TicketSorteo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TicketSorteo" DROP COLUMN "fechaFinal",
DROP COLUMN "fechaInicio";
