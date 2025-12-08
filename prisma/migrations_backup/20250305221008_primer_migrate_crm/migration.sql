/*
  Warnings:

  - You are about to drop the column `contrasena` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_actualizacion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `AjusteStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Categoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cuota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deposito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DepositoCobro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Egreso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EliminacionCliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EliminacionProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EliminacionStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntregaStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Garantia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistorialPrecio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistorialPrecioCosto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistorialStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetaCobros` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetaUsuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notificacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificacionesUsuarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlantillaComprobante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrecioProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Producto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proveedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistroCaja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistroGarantia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistroReparacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reparacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SolicitudPrecio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SolicitudTransferenciaProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sucursal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SucursalSaldo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SucursalSaldoGlobal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketSorteo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransferenciaProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vencimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Venta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VentaCuota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VentaEliminada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VentaEliminadaProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VentaProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoriaToProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Destinatario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actualizadoEn` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rol` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoRuta" AS ENUM ('ACTIVO', 'CERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoClienteInternet" AS ENUM ('REGISTRADO', 'MOROSO', 'SUSPENDIDO', 'DESINSTALADO');

-- CreateEnum
CREATE TYPE "EstadoTicketSoporte" AS ENUM ('ABIERTA', 'EN_PROCESO', 'PENDIENTE_CLIENTE', 'PENDIENTE_TECNICO', 'RESUELTA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PrioridadTicketSoporte" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('TECNICO', 'OFICINA', 'ADMIN', 'SUPER_ADMIN');

-- DropForeignKey
ALTER TABLE "AjusteStock" DROP CONSTRAINT "AjusteStock_productoId_fkey";

-- DropForeignKey
ALTER TABLE "AjusteStock" DROP CONSTRAINT "AjusteStock_stockId_fkey";

-- DropForeignKey
ALTER TABLE "AjusteStock" DROP CONSTRAINT "AjusteStock_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_departamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_municipioId_fkey";

-- DropForeignKey
ALTER TABLE "Cuota" DROP CONSTRAINT "Cuota_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Cuota" DROP CONSTRAINT "Cuota_ventaCuotaId_fkey";

-- DropForeignKey
ALTER TABLE "Deposito" DROP CONSTRAINT "Deposito_registroCajaId_fkey";

-- DropForeignKey
ALTER TABLE "Deposito" DROP CONSTRAINT "Deposito_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "Deposito" DROP CONSTRAINT "Deposito_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "DepositoCobro" DROP CONSTRAINT "DepositoCobro_metaCobroId_fkey";

-- DropForeignKey
ALTER TABLE "DepositoCobro" DROP CONSTRAINT "DepositoCobro_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "DepositoCobro" DROP CONSTRAINT "DepositoCobro_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Egreso" DROP CONSTRAINT "Egreso_registroCajaId_fkey";

-- DropForeignKey
ALTER TABLE "Egreso" DROP CONSTRAINT "Egreso_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "Egreso" DROP CONSTRAINT "Egreso_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionCliente" DROP CONSTRAINT "EliminacionCliente_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionCliente" DROP CONSTRAINT "EliminacionCliente_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionProducto" DROP CONSTRAINT "EliminacionProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionProducto" DROP CONSTRAINT "EliminacionProducto_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionStock" DROP CONSTRAINT "EliminacionStock_productoId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionStock" DROP CONSTRAINT "EliminacionStock_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "EliminacionStock" DROP CONSTRAINT "EliminacionStock_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "EntregaStock" DROP CONSTRAINT "EntregaStock_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "EntregaStock" DROP CONSTRAINT "EntregaStock_recibidoPorId_fkey";

-- DropForeignKey
ALTER TABLE "EntregaStock" DROP CONSTRAINT "EntregaStock_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "Garantia" DROP CONSTRAINT "Garantia_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Garantia" DROP CONSTRAINT "Garantia_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Garantia" DROP CONSTRAINT "Garantia_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "Garantia" DROP CONSTRAINT "Garantia_usuarioIdRecibe_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPrecio" DROP CONSTRAINT "HistorialPrecio_productoId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPrecioCosto" DROP CONSTRAINT "HistorialPrecioCosto_modificadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPrecioCosto" DROP CONSTRAINT "HistorialPrecioCosto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialStock" DROP CONSTRAINT "HistorialStock_productoId_fkey";

-- DropForeignKey
ALTER TABLE "MetaCobros" DROP CONSTRAINT "MetaCobros_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "MetaCobros" DROP CONSTRAINT "MetaCobros_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "MetaUsuario" DROP CONSTRAINT "MetaUsuario_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "MetaUsuario" DROP CONSTRAINT "MetaUsuario_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_remitenteId_fkey";

-- DropForeignKey
ALTER TABLE "NotificacionesUsuarios" DROP CONSTRAINT "NotificacionesUsuarios_notificacionId_fkey";

-- DropForeignKey
ALTER TABLE "NotificacionesUsuarios" DROP CONSTRAINT "NotificacionesUsuarios_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Pago" DROP CONSTRAINT "Pago_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "PlantillaComprobante" DROP CONSTRAINT "PlantillaComprobante_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "PrecioProducto" DROP CONSTRAINT "PrecioProducto_creadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "PrecioProducto" DROP CONSTRAINT "PrecioProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroCaja" DROP CONSTRAINT "RegistroCaja_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroCaja" DROP CONSTRAINT "RegistroCaja_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroGarantia" DROP CONSTRAINT "RegistroGarantia_garantiaId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroGarantia" DROP CONSTRAINT "RegistroGarantia_productoId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroGarantia" DROP CONSTRAINT "RegistroGarantia_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroGarantia" DROP CONSTRAINT "RegistroGarantia_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroReparacion" DROP CONSTRAINT "RegistroReparacion_reparacionId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroReparacion" DROP CONSTRAINT "RegistroReparacion_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudPrecio" DROP CONSTRAINT "SolicitudPrecio_aprobadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudPrecio" DROP CONSTRAINT "SolicitudPrecio_productoId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudPrecio" DROP CONSTRAINT "SolicitudPrecio_solicitadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" DROP CONSTRAINT "SolicitudTransferenciaProducto_administradorId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" DROP CONSTRAINT "SolicitudTransferenciaProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" DROP CONSTRAINT "SolicitudTransferenciaProducto_sucursalDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" DROP CONSTRAINT "SolicitudTransferenciaProducto_sucursalOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" DROP CONSTRAINT "SolicitudTransferenciaProducto_usuarioSolicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_entregaStockId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "SucursalSaldo" DROP CONSTRAINT "SucursalSaldo_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaProducto" DROP CONSTRAINT "TransferenciaProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaProducto" DROP CONSTRAINT "TransferenciaProducto_sucursalDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaProducto" DROP CONSTRAINT "TransferenciaProducto_sucursalOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaProducto" DROP CONSTRAINT "TransferenciaProducto_usuarioEncargadoId_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "Vencimiento" DROP CONSTRAINT "Vencimiento_stockId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_registroCajaId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "VentaCuota" DROP CONSTRAINT "VentaCuota_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "VentaCuota" DROP CONSTRAINT "VentaCuota_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "VentaCuota" DROP CONSTRAINT "VentaCuota_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "VentaCuota" DROP CONSTRAINT "VentaCuota_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "VentaEliminada" DROP CONSTRAINT "VentaEliminada_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "VentaEliminada" DROP CONSTRAINT "VentaEliminada_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "VentaEliminada" DROP CONSTRAINT "VentaEliminada_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "VentaEliminadaProducto" DROP CONSTRAINT "VentaEliminadaProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "VentaEliminadaProducto" DROP CONSTRAINT "VentaEliminadaProducto_ventaEliminadaId_fkey";

-- DropForeignKey
ALTER TABLE "VentaProducto" DROP CONSTRAINT "VentaProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "VentaProducto" DROP CONSTRAINT "VentaProducto_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriaToProducto" DROP CONSTRAINT "_CategoriaToProducto_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriaToProducto" DROP CONSTRAINT "_CategoriaToProducto_B_fkey";

-- DropForeignKey
ALTER TABLE "_Destinatario" DROP CONSTRAINT "_Destinatario_A_fkey";

-- DropForeignKey
ALTER TABLE "_Destinatario" DROP CONSTRAINT "_Destinatario_B_fkey";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "contrasena",
DROP COLUMN "fecha_actualizacion",
DROP COLUMN "fecha_creacion",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "empresaId" INTEGER NOT NULL,
ADD COLUMN     "telefono" TEXT,
DROP COLUMN "rol",
ADD COLUMN     "rol" "RolUsuario" NOT NULL,
ALTER COLUMN "sucursalId" DROP NOT NULL;

-- DropTable
DROP TABLE "AjusteStock";

-- DropTable
DROP TABLE "Categoria";

-- DropTable
DROP TABLE "Cliente";

-- DropTable
DROP TABLE "Cuota";

-- DropTable
DROP TABLE "Deposito";

-- DropTable
DROP TABLE "DepositoCobro";

-- DropTable
DROP TABLE "Egreso";

-- DropTable
DROP TABLE "EliminacionCliente";

-- DropTable
DROP TABLE "EliminacionProducto";

-- DropTable
DROP TABLE "EliminacionStock";

-- DropTable
DROP TABLE "EntregaStock";

-- DropTable
DROP TABLE "Garantia";

-- DropTable
DROP TABLE "HistorialPrecio";

-- DropTable
DROP TABLE "HistorialPrecioCosto";

-- DropTable
DROP TABLE "HistorialStock";

-- DropTable
DROP TABLE "MetaCobros";

-- DropTable
DROP TABLE "MetaUsuario";

-- DropTable
DROP TABLE "Notificacion";

-- DropTable
DROP TABLE "NotificacionesUsuarios";

-- DropTable
DROP TABLE "Pago";

-- DropTable
DROP TABLE "PlantillaComprobante";

-- DropTable
DROP TABLE "PrecioProducto";

-- DropTable
DROP TABLE "Producto";

-- DropTable
DROP TABLE "Proveedor";

-- DropTable
DROP TABLE "RegistroCaja";

-- DropTable
DROP TABLE "RegistroGarantia";

-- DropTable
DROP TABLE "RegistroReparacion";

-- DropTable
DROP TABLE "Reparacion";

-- DropTable
DROP TABLE "SolicitudPrecio";

-- DropTable
DROP TABLE "SolicitudTransferenciaProducto";

-- DropTable
DROP TABLE "Stock";

-- DropTable
DROP TABLE "Sucursal";

-- DropTable
DROP TABLE "SucursalSaldo";

-- DropTable
DROP TABLE "SucursalSaldoGlobal";

-- DropTable
DROP TABLE "TicketSorteo";

-- DropTable
DROP TABLE "TransferenciaProducto";

-- DropTable
DROP TABLE "Vencimiento";

-- DropTable
DROP TABLE "Venta";

-- DropTable
DROP TABLE "VentaCuota";

-- DropTable
DROP TABLE "VentaEliminada";

-- DropTable
DROP TABLE "VentaEliminadaProducto";

-- DropTable
DROP TABLE "VentaProducto";

-- DropTable
DROP TABLE "_CategoriaToProducto";

-- DropTable
DROP TABLE "_Destinatario";

-- DropEnum
DROP TYPE "EstadoCaja";

-- DropEnum
DROP TYPE "EstadoCuota";

-- DropEnum
DROP TYPE "EstadoGarantia";

-- DropEnum
DROP TYPE "EstadoMetaCobro";

-- DropEnum
DROP TYPE "EstadoMetaTienda";

-- DropEnum
DROP TYPE "EstadoNotificacion";

-- DropEnum
DROP TYPE "EstadoPago";

-- DropEnum
DROP TYPE "EstadoPrecio";

-- DropEnum
DROP TYPE "EstadoReparacion";

-- DropEnum
DROP TYPE "EstadoSolicitud";

-- DropEnum
DROP TYPE "EstadoSolicitudTransferencia";

-- DropEnum
DROP TYPE "EstadoTicket";

-- DropEnum
DROP TYPE "EstadoVencimiento";

-- DropEnum
DROP TYPE "MetodoPago";

-- DropEnum
DROP TYPE "Rol";

-- DropEnum
DROP TYPE "TipoAjuste";

-- DropEnum
DROP TYPE "TipoNotificacion";

-- DropEnum
DROP TYPE "TipoPrecio";

-- DropEnum
DROP TYPE "TipoSucursal";

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT,
    "pbx" TEXT,
    "correo" TEXT,
    "sitioWeb" TEXT,
    "nit" TEXT,
    "logo" TEXT,
    "saldo" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaInternet" (
    "id" SERIAL NOT NULL,
    "fechaPagoEsperada" TIMESTAMP(3),
    "fechaPagada" TIMESTAMP(3),
    "montoPago" INTEGER,
    "EmpresaId" INTEGER NOT NULL,

    CONSTRAINT "FacturaInternet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IP" (
    "id" SERIAL NOT NULL,
    "direccionIp" TEXT,
    "clienteId" INTEGER,

    CONSTRAINT "IP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteInternet" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "iPInternet" TEXT,
    "dpi" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "municipioId" INTEGER,
    "departamentoId" INTEGER,
    "EmpresaId" INTEGER NOT NULL,

    CONSTRAINT "ClienteInternet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,
    "nombreRuta" TEXT NOT NULL,
    "cobradorId" INTEGER NOT NULL,
    "cobrados" INTEGER NOT NULL,
    "montoCobrado" INTEGER NOT NULL,
    "estadoRuta" "EstadoRuta" NOT NULL,
    "EmpresaId" INTEGER NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSoporte" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "tecnicoId" INTEGER,
    "creadoPorId" INTEGER,
    "estado" "EstadoTicketSoporte" NOT NULL DEFAULT 'ABIERTA',
    "prioridad" "PrioridadTicketSoporte" NOT NULL DEFAULT 'MEDIA',
    "descripcion" TEXT NOT NULL,
    "comentarios" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),

    CONSTRAINT "TicketSoporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeguimientoTicket" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoNuevo" "EstadoTicketSoporte" NOT NULL,

    CONSTRAINT "SeguimientoTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClienteInternetToRuta" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nombre_key" ON "Empresa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "IP_clienteId_key" ON "IP"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_clienteId_key" ON "Ubicacion"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "_ClienteInternetToRuta_AB_unique" ON "_ClienteInternetToRuta"("A", "B");

-- CreateIndex
CREATE INDEX "_ClienteInternetToRuta_B_index" ON "_ClienteInternetToRuta"("B");

-- AddForeignKey
ALTER TABLE "FacturaInternet" ADD CONSTRAINT "FacturaInternet_EmpresaId_fkey" FOREIGN KEY ("EmpresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IP" ADD CONSTRAINT "IP_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteInternet" ADD CONSTRAINT "ClienteInternet_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteInternet" ADD CONSTRAINT "ClienteInternet_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteInternet" ADD CONSTRAINT "ClienteInternet_EmpresaId_fkey" FOREIGN KEY ("EmpresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ubicacion" ADD CONSTRAINT "Ubicacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_cobradorId_fkey" FOREIGN KEY ("cobradorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_EmpresaId_fkey" FOREIGN KEY ("EmpresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSoporte" ADD CONSTRAINT "TicketSoporte_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSoporte" ADD CONSTRAINT "TicketSoporte_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSoporte" ADD CONSTRAINT "TicketSoporte_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSoporte" ADD CONSTRAINT "TicketSoporte_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguimientoTicket" ADD CONSTRAINT "SeguimientoTicket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TicketSoporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguimientoTicket" ADD CONSTRAINT "SeguimientoTicket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClienteInternetToRuta" ADD CONSTRAINT "_ClienteInternetToRuta_A_fkey" FOREIGN KEY ("A") REFERENCES "ClienteInternet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClienteInternetToRuta" ADD CONSTRAINT "_ClienteInternetToRuta_B_fkey" FOREIGN KEY ("B") REFERENCES "Ruta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
