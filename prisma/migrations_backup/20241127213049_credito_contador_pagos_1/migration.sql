-- AlterEnum
ALTER TYPE "MetodoPago" ADD VALUE 'CUTOAS';

-- AlterTable
ALTER TABLE "VentaCuota" ADD COLUMN     "totalPagado" DOUBLE PRECISION NOT NULL DEFAULT 0;
