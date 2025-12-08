-- AlterTable
ALTER TABLE "MetaUsuario" ADD COLUMN     "tituloMeta" TEXT;

-- CreateTable
CREATE TABLE "MetaCobros" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "fechaCreado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "montoMeta" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cumplida" BOOLEAN NOT NULL DEFAULT false,
    "fechaCumplida" TIMESTAMP(3),
    "numeroDepositos" INTEGER NOT NULL DEFAULT 0,
    "tituloMeta" TEXT,

    CONSTRAINT "MetaCobros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositoCobro" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "numeroBoleta" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoDepositado" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "DepositoCobro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MetaCobros" ADD CONSTRAINT "MetaCobros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaCobros" ADD CONSTRAINT "MetaCobros_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositoCobro" ADD CONSTRAINT "DepositoCobro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositoCobro" ADD CONSTRAINT "DepositoCobro_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
