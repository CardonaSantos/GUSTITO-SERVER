-- CreateEnum
CREATE TYPE "EstadoReparacion" AS ENUM ('RECIBIDO', 'PENDIENTE', 'EN_PROCESO', 'ESPERANDO_PIEZAS', 'REPARADO', 'ENTREGADO', 'CANCELADO', 'NO_REPARABLE', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADA', 'ATRASADA');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('ACTIVA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoVencimiento" AS ENUM ('PENDIENTE', 'NOTIFICADO', 'RESUELTO');

-- CreateEnum
CREATE TYPE "TipoAjuste" AS ENUM ('INCREMENTO', 'DECREMENTO', 'CORRECCION');

-- CreateEnum
CREATE TYPE "EstadoMetaCobro" AS ENUM ('CANCELADO', 'ABIERTO', 'FINALIZADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoMetaTienda" AS ENUM ('CANCELADO', 'ABIERTO', 'FINALIZADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoGarantia" AS ENUM ('RECIBIDO', 'ENVIADO_A_PROVEEDOR', 'EN_REPARACION', 'REPARADO', 'REEMPLAZADO', 'ENTREGADO_CLIENTE', 'CERRADO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MANAGER', 'VENDEDOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TipoSucursal" AS ENUM ('TIENDA', 'ALMACEN', 'CENTRO_DISTRIBUCION', 'TALLER', 'OFICINA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('CONTADO', 'TARJETA', 'TRANSFERENCIA', 'PAYPAL', 'OTRO', 'CUTOAS', 'CREDITO');

-- CreateEnum
CREATE TYPE "TipoPrecio" AS ENUM ('CREADO_POR_SOLICITUD', 'ESTANDAR');

-- CreateEnum
CREATE TYPE "EstadoPrecio" AS ENUM ('APROBADO', 'PENDIENTE', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('SOLICITUD_PRECIO', 'TRANSFERENCIA', 'VENCIMIENTO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('NO_LEIDO', 'LEIDO');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoSolicitudTransferencia" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Reparacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "productoExterno" TEXT,
    "problemas" TEXT NOT NULL,
    "observaciones" TEXT,
    "fechaRecibido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntregado" TIMESTAMP(3),
    "estado" "EstadoReparacion" NOT NULL DEFAULT 'PENDIENTE',
    "hojaSolucion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroReparacion" (
    "id" SERIAL NOT NULL,
    "reparacionId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estado" "EstadoReparacion" NOT NULL,
    "accionesRealizadas" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentarioFinal" TEXT,
    "montoPagado" INTEGER,

    CONSTRAINT "RegistroReparacion_pkey" PRIMARY KEY ("id")
);

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
    "testigos" JSONB NOT NULL,
    "fechaContrato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoVenta" DOUBLE PRECISION NOT NULL,
    "garantiaMeses" INTEGER NOT NULL,
    "totalPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diasEntrePagos" INTEGER NOT NULL DEFAULT 0,
    "interes" INTEGER NOT NULL DEFAULT 0,
    "comentario" TEXT,
    "ventaId" INTEGER,
    "montoTotalConInteres" INTEGER,

    CONSTRAINT "VentaCuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuota" (
    "id" SERIAL NOT NULL,
    "ventaCuotaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "fechaPago" TIMESTAMP(3),
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "comentario" TEXT,
    "montoEsperado" DOUBLE PRECISION,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaComprobante" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "sucursalId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantillaComprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaEliminada" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "totalVenta" DOUBLE PRECISION NOT NULL,
    "clienteId" INTEGER,
    "fechaEliminacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucursalId" INTEGER NOT NULL,

    CONSTRAINT "VentaEliminada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaEliminadaProducto" (
    "id" SERIAL NOT NULL,
    "ventaEliminadaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaEliminadaProducto_pkey" PRIMARY KEY ("id")
);

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
    "sucursalId" INTEGER,
    "usuarioId" INTEGER,
    "saldoInicial" DOUBLE PRECISION,
    "saldoFinal" DOUBLE PRECISION DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoCaja" DEFAULT 'ABIERTO',
    "comentario" TEXT,

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
CREATE TABLE "Deposito" (
    "id" SERIAL NOT NULL,
    "registroCajaId" INTEGER,
    "monto" DOUBLE PRECISION NOT NULL,
    "numeroBoleta" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "fechaDeposito" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usadoParaCierre" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "sucursalId" INTEGER,
    "usuarioId" INTEGER,

    CONSTRAINT "Deposito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Egreso" (
    "id" SERIAL NOT NULL,
    "registroCajaId" INTEGER,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaEgreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucursalId" INTEGER,
    "usuarioId" INTEGER,

    CONSTRAINT "Egreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSorteo" (
    "id" SERIAL NOT NULL,
    "descripcionSorteo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoTicket" NOT NULL,

    CONSTRAINT "TicketSorteo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vencimiento" (
    "id" SERIAL NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoVencimiento" NOT NULL DEFAULT 'PENDIENTE',
    "descripcion" TEXT,
    "stockId" INTEGER,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vencimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "remitenteId" INTEGER,
    "tipoNotificacion" "TipoNotificacion" NOT NULL,
    "referenciaId" INTEGER,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "SolicitudPrecio" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "precioSolicitado" DOUBLE PRECISION NOT NULL,
    "solicitadoPorId" INTEGER NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "aprobadoPorId" INTEGER,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" TIMESTAMP(3),

    CONSTRAINT "SolicitudPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigoProducto" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "precioCostoActual" DOUBLE PRECISION,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empaque" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "codigoProducto" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "precioCosto" DOUBLE PRECISION,
    "precioVenta" DOUBLE PRECISION,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Empaque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecioCosto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "precioCostoAnterior" DOUBLE PRECISION NOT NULL,
    "precioCostoNuevo" DOUBLE PRECISION NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoPorId" INTEGER,

    CONSTRAINT "HistorialPrecioCosto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecioProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER,
    "precio" DOUBLE PRECISION NOT NULL,
    "creadoPorId" INTEGER,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPrecio" NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "tipo" "TipoPrecio" NOT NULL,

    CONSTRAINT "PrecioProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecio" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "precioAnterior" DOUBLE PRECISION NOT NULL,
    "precioNuevo" DOUBLE PRECISION NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjusteStock" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER,
    "empaqueId" INTEGER,
    "stockId" INTEGER,
    "cantidadAjustada" INTEGER NOT NULL,
    "tipoAjuste" "TipoAjuste" NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "descripcion" TEXT,

    CONSTRAINT "AjusteStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EliminacionStock" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER,
    "empaqueId" INTEGER,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "sucursalId" INTEGER,
    "motivo" TEXT,

    CONSTRAINT "EliminacionStock_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "EliminacionCliente" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "motivo" TEXT,

    CONSTRAINT "EliminacionCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER,
    "empaqueId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "costoTotal" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "precioCosto" DOUBLE PRECISION NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "entregaStockId" INTEGER,
    "cantidadInicial" INTEGER,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "pbx" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "tipoSucursal" "TipoSucursal" NOT NULL,
    "estadoOperacion" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntregaStock" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "fechaEntrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recibidoPorId" INTEGER,
    "sucursalId" INTEGER,

    CONSTRAINT "EntregaStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "contrasena" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "correo" TEXT NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "montoMeta" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cumplida" BOOLEAN NOT NULL DEFAULT false,
    "fechaCumplida" TIMESTAMP(3),
    "numeroVentas" DOUBLE PRECISION NOT NULL,
    "tituloMeta" TEXT,
    "estado" "EstadoMetaTienda" NOT NULL,

    CONSTRAINT "MetaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaCobros" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "fechaCreado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "montoMeta" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cumplida" BOOLEAN NOT NULL DEFAULT false,
    "fechaCumplida" TIMESTAMP(3),
    "numeroDepositos" INTEGER NOT NULL DEFAULT 0,
    "tituloMeta" TEXT,
    "estado" "EstadoMetaCobro" NOT NULL,

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
    "metaCobroId" INTEGER NOT NULL,

    CONSTRAINT "DepositoCobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "municipioId" INTEGER,
    "departamentoId" INTEGER,
    "dpi" TEXT,
    "iPInternet" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

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
    "proveedorId" INTEGER,

    CONSTRAINT "Garantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroGarantia" (
    "id" SERIAL NOT NULL,
    "garantiaId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "productoId" INTEGER NOT NULL,
    "estado" "EstadoGarantia" NOT NULL,
    "conclusion" TEXT,
    "accionesRealizadas" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedorId" INTEGER,

    CONSTRAINT "RegistroGarantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialStock" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER,
    "empaqueId" INTEGER,
    "cantidadAnterior" INTEGER NOT NULL,
    "cantidadNueva" INTEGER NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER,
    "fechaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVenta" DOUBLE PRECISION NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "nombreClienteFinal" TEXT,
    "telefonoClienteFinal" TEXT,
    "direccionClienteFinal" TEXT,
    "imei" TEXT,
    "registroCajaId" INTEGER,
    "usuarioId" INTEGER,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferenciaProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "sucursalOrigenId" INTEGER NOT NULL,
    "sucursalDestinoId" INTEGER NOT NULL,
    "fechaTransferencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioEncargadoId" INTEGER,

    CONSTRAINT "TransferenciaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudTransferenciaProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "sucursalOrigenId" INTEGER NOT NULL,
    "sucursalDestinoId" INTEGER NOT NULL,
    "usuarioSolicitanteId" INTEGER,
    "estado" "EstadoSolicitudTransferencia" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAprobacion" TIMESTAMP(3),
    "administradorId" INTEGER,

    CONSTRAINT "SolicitudTransferenciaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaProducto" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precioVenta" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VentaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "razonSocial" TEXT,
    "rfc" TEXT,
    "nombreContacto" TEXT,
    "telefonoContacto" TEXT,
    "emailContacto" TEXT,
    "pais" TEXT,
    "ciudad" TEXT,
    "codigoPostal" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoId" INTEGER NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Destinatario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CategoriaToProducto" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VentaCuota_ventaId_key" ON "VentaCuota"("ventaId");

-- CreateIndex
CREATE UNIQUE INDEX "SucursalSaldo_sucursalId_key" ON "SucursalSaldo"("sucursalId");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoProducto_key" ON "Producto"("codigoProducto");

-- CreateIndex
CREATE UNIQUE INDEX "Empaque_codigoProducto_key" ON "Empaque"("codigoProducto");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dpi_id_key" ON "Cliente"("dpi", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_ventaId_key" ON "Pago"("ventaId");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_imei_id_key" ON "Venta"("imei", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "Departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_nombre_key" ON "Municipio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_Destinatario_AB_unique" ON "_Destinatario"("A", "B");

-- CreateIndex
CREATE INDEX "_Destinatario_B_index" ON "_Destinatario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriaToProducto_AB_unique" ON "_CategoriaToProducto"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriaToProducto_B_index" ON "_CategoriaToProducto"("B");

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroReparacion" ADD CONSTRAINT "RegistroReparacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroReparacion" ADD CONSTRAINT "RegistroReparacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaCuota" ADD CONSTRAINT "VentaCuota_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_ventaCuotaId_fkey" FOREIGN KEY ("ventaCuotaId") REFERENCES "VentaCuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaComprobante" ADD CONSTRAINT "PlantillaComprobante_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminada" ADD CONSTRAINT "VentaEliminada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminadaProducto" ADD CONSTRAINT "VentaEliminadaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaEliminadaProducto" ADD CONSTRAINT "VentaEliminadaProducto_ventaEliminadaId_fkey" FOREIGN KEY ("ventaEliminadaId") REFERENCES "VentaEliminada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SucursalSaldo" ADD CONSTRAINT "SucursalSaldo_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCaja" ADD CONSTRAINT "RegistroCaja_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCaja" ADD CONSTRAINT "RegistroCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vencimiento" ADD CONSTRAINT "Vencimiento_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionesUsuarios" ADD CONSTRAINT "NotificacionesUsuarios_notificacionId_fkey" FOREIGN KEY ("notificacionId") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionesUsuarios" ADD CONSTRAINT "NotificacionesUsuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPrecio" ADD CONSTRAINT "SolicitudPrecio_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPrecio" ADD CONSTRAINT "SolicitudPrecio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPrecio" ADD CONSTRAINT "SolicitudPrecio_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecioCosto" ADD CONSTRAINT "HistorialPrecioCosto_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecioCosto" ADD CONSTRAINT "HistorialPrecioCosto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecioProducto" ADD CONSTRAINT "PrecioProducto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecioProducto" ADD CONSTRAINT "PrecioProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecio" ADD CONSTRAINT "HistorialPrecio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_empaqueId_fkey" FOREIGN KEY ("empaqueId") REFERENCES "Empaque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteStock" ADD CONSTRAINT "AjusteStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_empaqueId_fkey" FOREIGN KEY ("empaqueId") REFERENCES "Empaque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionStock" ADD CONSTRAINT "EliminacionStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionProducto" ADD CONSTRAINT "EliminacionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionProducto" ADD CONSTRAINT "EliminacionProducto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionCliente" ADD CONSTRAINT "EliminacionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminacionCliente" ADD CONSTRAINT "EliminacionCliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_empaqueId_fkey" FOREIGN KEY ("empaqueId") REFERENCES "Empaque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_entregaStockId_fkey" FOREIGN KEY ("entregaStockId") REFERENCES "EntregaStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_recibidoPorId_fkey" FOREIGN KEY ("recibidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaUsuario" ADD CONSTRAINT "MetaUsuario_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaUsuario" ADD CONSTRAINT "MetaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaCobros" ADD CONSTRAINT "MetaCobros_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaCobros" ADD CONSTRAINT "MetaCobros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositoCobro" ADD CONSTRAINT "DepositoCobro_metaCobroId_fkey" FOREIGN KEY ("metaCobroId") REFERENCES "MetaCobros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositoCobro" ADD CONSTRAINT "DepositoCobro_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositoCobro" ADD CONSTRAINT "DepositoCobro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_usuarioIdRecibe_fkey" FOREIGN KEY ("usuarioIdRecibe") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_garantiaId_fkey" FOREIGN KEY ("garantiaId") REFERENCES "Garantia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroGarantia" ADD CONSTRAINT "RegistroGarantia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialStock" ADD CONSTRAINT "HistorialStock_empaqueId_fkey" FOREIGN KEY ("empaqueId") REFERENCES "Empaque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialStock" ADD CONSTRAINT "HistorialStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_registroCajaId_fkey" FOREIGN KEY ("registroCajaId") REFERENCES "RegistroCaja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_sucursalDestinoId_fkey" FOREIGN KEY ("sucursalDestinoId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_sucursalOrigenId_fkey" FOREIGN KEY ("sucursalOrigenId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_usuarioEncargadoId_fkey" FOREIGN KEY ("usuarioEncargadoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" ADD CONSTRAINT "SolicitudTransferenciaProducto_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" ADD CONSTRAINT "SolicitudTransferenciaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" ADD CONSTRAINT "SolicitudTransferenciaProducto_sucursalDestinoId_fkey" FOREIGN KEY ("sucursalDestinoId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" ADD CONSTRAINT "SolicitudTransferenciaProducto_sucursalOrigenId_fkey" FOREIGN KEY ("sucursalOrigenId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTransferenciaProducto" ADD CONSTRAINT "SolicitudTransferenciaProducto_usuarioSolicitanteId_fkey" FOREIGN KEY ("usuarioSolicitanteId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Destinatario" ADD CONSTRAINT "_Destinatario_A_fkey" FOREIGN KEY ("A") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Destinatario" ADD CONSTRAINT "_Destinatario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

