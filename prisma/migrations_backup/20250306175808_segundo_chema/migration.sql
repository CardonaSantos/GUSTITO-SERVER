/*
  Warnings:

  - You are about to drop the column `EmpresaId` on the `ClienteInternet` table. All the data in the column will be lost.
  - You are about to drop the column `iPInternet` on the `ClienteInternet` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `saldo` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `EmpresaId` on the `FacturaInternet` table. All the data in the column will be lost.
  - You are about to drop the column `estadoNuevo` on the `SeguimientoTicket` table. All the data in the column will be lost.
  - Added the required column `contrasenaWifi` to the `ClienteInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `ClienteInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoCliente` to the `ClienteInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicioId` to the `ClienteInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizadoEn` to the `FacturaInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteId` to the `FacturaInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `FacturaInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodoPago` to the `FacturaInternet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoCliente" AS ENUM ('ACTIVO', 'MOROSO', 'SUSPENDIDO', 'DESINSTALADO');

-- CreateEnum
CREATE TYPE "EstadoServicio" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoFacturaInternet" AS ENUM ('PENDIENTE', 'PAGADA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoFactura" AS ENUM ('INTERNET', 'SERVICIO_ADICIONAL');

-- CreateEnum
CREATE TYPE "EstadoClienteServicio" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PAYPAL');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE', 'PAGADA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "MetodoPagoFacturaInternet" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PAYPAL');

-- DropForeignKey
ALTER TABLE "ClienteInternet" DROP CONSTRAINT "ClienteInternet_EmpresaId_fkey";

-- DropForeignKey
ALTER TABLE "FacturaInternet" DROP CONSTRAINT "FacturaInternet_EmpresaId_fkey";

-- AlterTable
ALTER TABLE "ClienteInternet" DROP COLUMN "EmpresaId",
DROP COLUMN "iPInternet",
ADD COLUMN     "asesorId" INTEGER,
ADD COLUMN     "contactoReferenciaNombre" TEXT,
ADD COLUMN     "contactoReferenciaTelefono" TEXT,
ADD COLUMN     "contrasenaWifi" TEXT NOT NULL,
ADD COLUMN     "empresaId" INTEGER NOT NULL,
ADD COLUMN     "estadoCliente" "EstadoCliente" NOT NULL,
ADD COLUMN     "fechaInstalacion" TIMESTAMP(3),
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "servicioId" INTEGER NOT NULL,
ADD COLUMN     "ssidRouter" TEXT;

-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "logo",
DROP COLUMN "saldo",
ADD COLUMN     "logo1" TEXT,
ADD COLUMN     "logo2" TEXT,
ADD COLUMN     "logo3" TEXT,
ALTER COLUMN "direccion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FacturaInternet" DROP COLUMN "EmpresaId",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "clienteId" INTEGER NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "empresaId" INTEGER NOT NULL,
ADD COLUMN     "estadoFacturaInternet" "EstadoFacturaInternet" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "metodoPago" "MetodoPagoFacturaInternet" NOT NULL,
ADD COLUMN     "saldoPendiente" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "montoPago" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SeguimientoTicket" DROP COLUMN "estadoNuevo";

-- AlterTable
ALTER TABLE "Ubicacion" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "EstadoClienteInternet";

-- CreateTable
CREATE TABLE "TipoServicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoServicio" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoServicio" NOT NULL DEFAULT 'ACTIVO',
    "tipoServicioId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "empresaId" INTEGER NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioInternet" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "velocidad" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoServicio" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "empresaId" INTEGER NOT NULL,

    CONSTRAINT "ServicioInternet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaldoEmpresa" (
    "id" SERIAL NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "egresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIngresos" DOUBLE PRECISION NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaldoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaldoCaja" (
    "id" SERIAL NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "egreso" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIngresos" DOUBLE PRECISION NOT NULL,
    "totalEgresos" DOUBLE PRECISION NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaldoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroCaja" (
    "id" SERIAL NOT NULL,
    "saldoInicial" DOUBLE PRECISION NOT NULL,
    "saldoFinal" DOUBLE PRECISION NOT NULL,
    "usuarioId" INTEGER,
    "cajaId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteServicio" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoClienteServicio" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tipoFactura" "TipoFactura" NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "saldoPendiente" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoFactura" (
    "id" SERIAL NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagoFactura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoFacturaInternet" (
    "id" SERIAL NOT NULL,
    "facturaInternetId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPagoFacturaInternet" NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagoFacturaInternet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaServicio" (
    "id" SERIAL NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacturaServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fotos" (
    "id" SERIAL NOT NULL,
    "nombreFoto" TEXT NOT NULL,
    "url" TEXT,
    "clienteId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldoCliente" (
    "id" SERIAL NOT NULL,
    "saldoPendiente" DOUBLE PRECISION,
    "saldoFavor" DOUBLE PRECISION,
    "totalPagos" DOUBLE PRECISION,
    "clienteId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saldoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoServicio_nombre_key" ON "TipoServicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "SaldoEmpresa_empresaId_key" ON "SaldoEmpresa"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "SaldoCaja_empresaId_key" ON "SaldoCaja"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "saldoCliente_clienteId_key" ON "saldoCliente"("clienteId");

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "TipoServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioInternet" ADD CONSTRAINT "ServicioInternet_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaldoEmpresa" ADD CONSTRAINT "SaldoEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaldoCaja" ADD CONSTRAINT "SaldoCaja_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCaja" ADD CONSTRAINT "RegistroCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCaja" ADD CONSTRAINT "RegistroCaja_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "SaldoCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteServicio" ADD CONSTRAINT "ClienteServicio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteServicio" ADD CONSTRAINT "ClienteServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoFactura" ADD CONSTRAINT "PagoFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoFactura" ADD CONSTRAINT "PagoFactura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaInternet" ADD CONSTRAINT "FacturaInternet_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaInternet" ADD CONSTRAINT "FacturaInternet_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoFacturaInternet" ADD CONSTRAINT "PagoFacturaInternet_facturaInternetId_fkey" FOREIGN KEY ("facturaInternetId") REFERENCES "FacturaInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoFacturaInternet" ADD CONSTRAINT "PagoFacturaInternet_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaServicio" ADD CONSTRAINT "FacturaServicio_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaServicio" ADD CONSTRAINT "FacturaServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fotos" ADD CONSTRAINT "Fotos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteInternet" ADD CONSTRAINT "ClienteInternet_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteInternet" ADD CONSTRAINT "ClienteInternet_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "ServicioInternet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteInternet" ADD CONSTRAINT "ClienteInternet_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldoCliente" ADD CONSTRAINT "saldoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ubicacion" ADD CONSTRAINT "Ubicacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
