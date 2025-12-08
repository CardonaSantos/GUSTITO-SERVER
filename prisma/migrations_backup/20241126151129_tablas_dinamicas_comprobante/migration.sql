-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADA', 'ATRASADA');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('ACTIVA', 'COMPLETADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "VentaCuota" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "totalVenta" DOUBLE PRECISION NOT NULL,
    "cuotaInicial" DOUBLE PRECISION NOT NULL,
    "cuotasTotales" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoCuota" NOT NULL DEFAULT 'ACTIVA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "dpi" TEXT NOT NULL,

    CONSTRAINT "VentaCuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuota" (
    "id" SERIAL NOT NULL,
    "ventaCuotaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComprobanteVentaCuota" (
    "id" SERIAL NOT NULL,
    "ventaCuotaId" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "textoContrato" TEXT NOT NULL,
    "testigos" JSONB NOT NULL,
    "numeroRecibo" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ComprobanteVentaCuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VentaCuotaToVentaProducto" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VentaCuotaToVentaProducto_AB_unique" ON "_VentaCuotaToVentaProducto"("A", "B");

-- CreateIndex
CREATE INDEX "_VentaCuotaToVentaProducto_B_index" ON "_VentaCuotaToVentaProducto"("B");

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_ventaCuotaId_fkey" FOREIGN KEY ("ventaCuotaId") REFERENCES "VentaCuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteVentaCuota" ADD CONSTRAINT "ComprobanteVentaCuota_ventaCuotaId_fkey" FOREIGN KEY ("ventaCuotaId") REFERENCES "VentaCuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VentaCuotaToVentaProducto" ADD CONSTRAINT "_VentaCuotaToVentaProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "VentaCuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VentaCuotaToVentaProducto" ADD CONSTRAINT "_VentaCuotaToVentaProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "VentaProducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
