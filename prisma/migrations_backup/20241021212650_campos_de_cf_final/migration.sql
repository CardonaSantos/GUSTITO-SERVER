-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "direccionClienteFinal" TEXT,
ADD COLUMN     "nombreClienteFinal" TEXT,
ADD COLUMN     "telefonoClienteFinal" TEXT;
