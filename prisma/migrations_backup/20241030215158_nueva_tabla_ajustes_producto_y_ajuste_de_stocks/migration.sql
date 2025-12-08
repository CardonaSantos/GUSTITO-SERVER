-- CreateEnum
CREATE TYPE "TipoAjuste" AS ENUM ('INCREMENTO', 'DECREMENTO', 'CORRECCION');

-- CreateTable
CREATE TABLE "AjusteStock" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "stockId" INTEGER,
    "cantidadAjustada" INTEGER NOT NULL,
    "tipoAjuste" "TipoAjuste" NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "AjusteStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EliminacionProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "motivo" TEXT,

    CONSTRAINT "EliminacionProducto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionProducto" ADD CONSTRAINT "EliminacionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionProducto" ADD CONSTRAINT "EliminacionProducto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
