-- DropForeignKey
ALTER TABLE "VentaProducto" DROP CONSTRAINT "VentaProducto_productoId_fkey";

-- AlterTable
ALTER TABLE "VentaProducto" ALTER COLUMN "productoId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VentaEliminada" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "detallesVenta" JSONB NOT NULL,
    "fechaEliminacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaEliminada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaEliminadaProducto" (
    "id" SERIAL NOT NULL,
    "ventaEliminadaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaEliminadaProducto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminadaProducto" ADD CONSTRAINT "VentaEliminadaProducto_ventaEliminadaId_fkey" FOREIGN KEY ("ventaEliminadaId") REFERENCES "VentaEliminada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminadaProducto" ADD CONSTRAINT "VentaEliminadaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
