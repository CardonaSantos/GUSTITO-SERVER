-- CreateEnum
CREATE TYPE "EstadoGarantia" AS ENUM ('RECIBIDO', 'ENVIADO_A_PROVEEDOR', 'EN_REPARACION', 'REPARADO', 'ENTREGADO_CLIENTE', 'CERRADO');

-- CreateTable
CREATE TABLE "Garantia" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "usuarioIdRecibe" INTEGER,
    "comentario" TEXT,
    "descripcionProblema" TEXT NOT NULL,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoGarantia" NOT NULL DEFAULT 'RECIBIDO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroGarantia" (
    "id" SERIAL NOT NULL,
    "garantiaId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "proveedorId" INTEGER,
    "estado" "EstadoGarantia" NOT NULL,
    "comentario" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroGarantia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_usuarioIdRecibe_fkey" FOREIGN KEY ("usuarioIdRecibe") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_garantiaId_fkey" FOREIGN KEY ("garantiaId") REFERENCES "Garantia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
