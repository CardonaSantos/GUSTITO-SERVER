-- CreateTable
CREATE TABLE "EliminacionStock" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "sucursalId" INTEGER,
    "motivo" TEXT,

    CONSTRAINT "EliminacionStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
