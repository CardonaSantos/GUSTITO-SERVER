-- CreateEnum
CREATE TYPE "EstadoVencimiento" AS ENUM ('PENDIENTE', 'NOTIFICADO', 'RESUELTO');

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "precioCostoActual" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Vencimiento" (
    "id" SERIAL NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoVencimiento" NOT NULL DEFAULT 'PENDIENTE',
    "descripcion" TEXT,
    "stockId" INTEGER,

    CONSTRAINT "Vencimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecioCosto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "precioCostoAnterior" DOUBLE PRECISION NOT NULL,
    "precioCostoNuevo" DOUBLE PRECISION NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialPrecioCosto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vencimiento" ADD CONSTRAINT "Vencimiento_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecioCosto" ADD CONSTRAINT "HistorialPrecioCosto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
