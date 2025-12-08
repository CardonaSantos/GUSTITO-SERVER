/*
  Warnings:

  - You are about to drop the column `estado` on the `Notificacion` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Notificacion` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoNotificacion" ADD VALUE 'VENCIMIENTO';
ALTER TYPE "TipoNotificacion" ADD VALUE 'OTRO';

-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Notificacion" DROP COLUMN "estado",
DROP COLUMN "usuarioId";

-- CreateTable
CREATE TABLE "NotificacionesUsuarios" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "notificacionId" INTEGER NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "leidoEn" TIMESTAMP(3),
    "recibidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificacionesUsuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Destinatario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Destinatario_AB_unique" ON "_Destinatario"("A", "B");

-- CreateIndex
CREATE INDEX "_Destinatario_B_index" ON "_Destinatario"("B");

-- AddForeignKey
ALTER TABLE "NotificacionesUsuarios" ADD CONSTRAINT "NotificacionesUsuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionesUsuarios" ADD CONSTRAINT "NotificacionesUsuarios_notificacionId_fkey" FOREIGN KEY ("notificacionId") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Destinatario" ADD CONSTRAINT "_Destinatario_A_fkey" FOREIGN KEY ("A") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Destinatario" ADD CONSTRAINT "_Destinatario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
