-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTO', 'CERRADO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "iPInternet" TEXT;

-- CreateTable
CREATE TABLE "SucursalSaldo" (
    "id" SERIAL NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "saldoAcumulado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIngresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEgresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SucursalSaldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroCaja" (
    "id" SERIAL NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "saldoInicial" DOUBLE PRECISION NOT NULL,
    "totalVentas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDepositos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEgresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoFinal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "estado" "EstadoCaja" NOT NULL DEFAULT 'ABIERTO',

    CONSTRAINT "RegistroCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SucursalSaldoGlobal" (
    "id" SERIAL NOT NULL,
    "saldoGlobal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIngresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEgresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SucursalSaldoGlobal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Egreso" (
    "id" SERIAL NOT NULL,
    "registroCajaId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaEgreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Egreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposito" (
    "id" SERIAL NOT NULL,
    "registroCajaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "numeroBoleta" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "fechaDeposito" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usadoParaCierre" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Deposito_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SucursalSaldo" ADD CONSTRAINT "SucursalSaldo_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCaja" ADD CONSTRAINT "RegistroCaja_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCaja" ADD CONSTRAINT "RegistroCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;
