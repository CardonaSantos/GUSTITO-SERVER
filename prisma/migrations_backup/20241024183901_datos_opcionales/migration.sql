-- DropForeignKey
ALTER TABLE "PrecioProducto" DROP CONSTRAINT "PrecioProducto_creadoPorId_fkey";

-- AlterTable
ALTER TABLE "PrecioProducto" ALTER COLUMN "productoId" DROP NOT NULL,
ALTER COLUMN "creadoPorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PrecioProducto" ADD CONSTRAINT "PrecioProducto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
