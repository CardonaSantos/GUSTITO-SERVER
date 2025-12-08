-- AlterTable
ALTER TABLE "Deposito" ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "Egreso" ALTER COLUMN "descripcion" DROP NOT NULL;
