/*
  Warnings:

  - Added the required column `estado` to the `TicketSorteo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('ACTIVO', 'INACTIVO');

-- AlterTable
ALTER TABLE "TicketSorteo" ADD COLUMN     "estado" "EstadoTicket" NOT NULL;
