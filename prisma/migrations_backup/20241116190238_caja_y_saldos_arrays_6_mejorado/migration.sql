-- AlterTable
ALTER TABLE "RegistroCaja" ADD COLUMN     "comentario" TEXT,
ALTER COLUMN "fechaCierre" SET DEFAULT CURRENT_TIMESTAMP;
