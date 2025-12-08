-- DropForeignKey
ALTER TABLE "AjusteStock" DROP CONSTRAINT "AjusteStock_usuarioId_fkey";

-- AlterTable
ALTER TABLE "AjusteStock" ALTER COLUMN "usuarioId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EliminacionCliente" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "motivo" TEXT,

    CONSTRAINT "EliminacionCliente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionCliente" ADD CONSTRAINT "EliminacionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionCliente" ADD CONSTRAINT "EliminacionCliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
