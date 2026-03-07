import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientService } from 'src/client/client.service';
import { MetodoPago, Prisma, TipoMovimientoStock } from '@prisma/client';
import { FindSucursalSalesDto } from './dto/find-sucursal-sales.dto';
import { MovimientoStockService } from 'src/registrar-movimiento/registrar-movimiento.service';

type ProductoInput = {
  productoId: number;
  cantidad: number;
  selectedPriceId: number;
};

type EmpaqueInput = {
  id: number;
  quantity: number;
};

type ProductoPreparado = ProductoInput & {
  precioVenta: number;
  tipoPrecio: string;
};

// ← enriquecido con cantidadAnterior para la auditoría
type StockUpdate = {
  id: number;
  cantidad: number; // cantidad NUEVA (lo que quedará en DB)
  cantidadAnterior: number; // cantidad ANTES del descuento
  productoId?: number;
  empaqueId?: number;
  sucursalId: number;
};

@Injectable()
export class VentaService {
  private readonly logger = new Logger(VentaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clienteService: ClientService,
    private readonly movimientoStock: MovimientoStockService, // ← inyectado
  ) {}

  // ─── HELPERS DE CAJA ──────────────────────────────────────────────────────

  private async findCajaAbierta(
    tx: Prisma.TransactionClient,
    sucursalId: number,
    usuarioId: number,
  ): Promise<{ id: number } | null> {
    const caja = await tx.registroCaja.findFirst({
      where: { sucursalId, usuarioId, estado: 'ABIERTO', fechaCierre: null },
      orderBy: { fechaInicio: 'desc' },
      select: { id: true },
    });
    return caja ?? null;
  }

  private async getCajaAbiertaOrThrow(
    tx: Prisma.TransactionClient,
    sucursalId: number,
    usuarioId: number,
  ): Promise<{ id: number }> {
    const caja = await this.findCajaAbierta(tx, sucursalId, usuarioId);
    if (!caja) {
      this.logger.warn(
        `No se encontró caja abierta para sucursalId=${sucursalId}, usuarioId=${usuarioId}`,
      );
      throw new BadRequestException(
        'No hay un registro de caja abierto para este usuario en esta sucursal.',
      );
    }
    return caja;
  }

  private async getCajaAbierta(
    tx: Prisma.TransactionClient,
    sucursalId: number,
    usuarioId: number,
  ): Promise<{ id: number } | null> {
    return this.findCajaAbierta(tx, sucursalId, usuarioId);
  }

  // ─── CLIENTE ──────────────────────────────────────────────────────────────

  private async getClienteConnect(
    tx: Prisma.TransactionClient,
    params: {
      clienteId?: number;
      nombre?: string;
      dpi?: string;
      telefono?: string;
      direccion?: string;
      iPInternet?: string;
    },
  ): Promise<{ connect: { id: number } } | undefined> {
    const { clienteId, nombre, dpi, telefono, direccion, iPInternet } = params;

    if (clienteId) return { connect: { id: clienteId } };

    if (nombre && telefono) {
      const nuevoCliente = await tx.cliente.create({
        data: { nombre, dpi, telefono, direccion, iPInternet },
      });
      this.logger.log(
        `Cliente creado para venta. clienteId=${nuevoCliente.id}`,
      );
      return { connect: { id: nuevoCliente.id } };
    }

    return undefined;
  }

  // ─── PREPARAR PRODUCTOS + STOCK ───────────────────────────────────────────
  // Ahora devuelve StockUpdate[] con cantidadAnterior incluida.
  // Esto no cambia NADA de la lógica de negocio — solo enriquecemos el tipo
  // con datos que ya teníamos disponibles en el findMany.

  private async prepararProductosYStock(
    tx: Prisma.TransactionClient,
    productos: ProductoInput[],
    empaques: EmpaqueInput[] | undefined,
    sucursalId: number,
  ): Promise<{
    productosFinal: ProductoPreparado[];
    stockUpdates: StockUpdate[];
  }> {
    // 1) Validar precios
    const productosConPrecio: ProductoPreparado[] = [];
    for (const prod of productos) {
      const precioProducto = await tx.precioProducto.findUnique({
        where: { id: prod.selectedPriceId },
      });

      if (!precioProducto || precioProducto.usado) {
        this.logger.warn(
          `Precio inválido o ya usado para productoId=${prod.productoId}, precioId=${prod.selectedPriceId}`,
        );
        throw new BadRequestException(
          `Precio inválido para el producto ${prod.productoId}`,
        );
      }

      productosConPrecio.push({
        ...prod,
        precioVenta: precioProducto.precio,
        tipoPrecio: precioProducto.tipo,
      });
    }

    // 2) Consolidar productos repetidos
    const productosFinal: ProductoPreparado[] = [];
    for (const prod of productosConPrecio) {
      const existente = productosFinal.find(
        (p) => p.productoId === prod.productoId,
      );
      if (existente) {
        existente.cantidad += prod.cantidad;
      } else {
        productosFinal.push({ ...prod });
      }
    }

    const stockUpdates: StockUpdate[] = [];

    // 3) Descuento de stock — productos
    for (const prod of productosFinal) {
      let restante = prod.cantidad;

      const stocks = await tx.stock.findMany({
        where: { productoId: prod.productoId, sucursalId },
        orderBy: { fechaIngreso: 'asc' },
      });

      for (const stock of stocks) {
        if (restante <= 0) break;

        if (restante <= 0) break;
        if (stock.cantidad === 0) continue; // ← AGREGAR ESTO

        const cantidadNueva =
          stock.cantidad >= restante ? stock.cantidad - restante : 0;

        // ← guardamos cantidadAnterior aquí, cuando aún tenemos el dato
        stockUpdates.push({
          id: stock.id,
          cantidad: cantidadNueva,
          cantidadAnterior: stock.cantidad,
          productoId: stock.productoId ?? undefined,
          sucursalId: stock.sucursalId,
        });

        restante -= stock.cantidad >= restante ? restante : stock.cantidad;
      }

      if (restante > 0) {
        this.logger.warn(
          `Stock insuficiente para productoId=${prod.productoId} en sucursalId=${sucursalId}`,
        );
        throw new BadRequestException(
          `Stock insuficiente para el producto ${prod.productoId}`,
        );
      }
    }

    // 4) Descuento de stock — empaques
    const empaquesValidos = (empaques ?? []).filter((e) => e.quantity > 0);

    for (const pack of empaquesValidos) {
      let restante = pack.quantity;

      const stocks = await tx.stock.findMany({
        where: { empaqueId: pack.id, sucursalId },
        orderBy: { fechaIngreso: 'asc' },
      });

      for (const stock of stocks) {
        if (restante <= 0) break;

        const cantidadNueva =
          stock.cantidad >= restante ? stock.cantidad - restante : 0;

        stockUpdates.push({
          id: stock.id,
          cantidad: cantidadNueva,
          cantidadAnterior: stock.cantidad,
          empaqueId: stock.empaqueId ?? undefined,
          sucursalId: stock.sucursalId,
        });

        restante -= stock.cantidad >= restante ? restante : stock.cantidad;
      }

      if (restante > 0) {
        this.logger.warn(
          `Stock insuficiente para empaqueId=${pack.id} en sucursalId=${sucursalId}`,
        );
        throw new BadRequestException(
          `Stock insuficiente para el empaque con ID ${pack.id}`,
        );
      }
    }

    return { productosFinal, stockUpdates };
  }

  // ─── APLICAR STOCK ────────────────────────────────────────────────────────
  // Sin cambios — sigue recibiendo StockUpdate[] y solo usa id + cantidad

  private async aplicarStock(
    tx: Prisma.TransactionClient,
    stockUpdates: StockUpdate[],
  ) {
    if (stockUpdates.length === 0) return;

    await Promise.all(
      stockUpdates.map((s) =>
        tx.stock.update({
          where: { id: s.id },
          data: { cantidad: s.cantidad },
        }),
      ),
    );
  }

  private calcularTotalVenta(productosFinal: ProductoPreparado[]): number {
    return productosFinal.reduce(
      (acc, p) => acc + p.precioVenta * p.cantidad,
      0,
    );
  }

  private async marcarPreciosEspeciales(
    tx: Prisma.TransactionClient,
    productosFinal: ProductoPreparado[],
  ) {
    const especiales = productosFinal.filter(
      (p) => p.tipoPrecio === 'CREADO_POR_SOLICITUD',
    );
    if (especiales.length === 0) return;

    await Promise.all(
      especiales.map((prod) =>
        tx.precioProducto.delete({ where: { id: prod.selectedPriceId } }),
      ),
    );

    this.logger.log(
      `Precios especiales eliminados: ${especiales.map((e) => e.selectedPriceId).join(', ')}`,
    );
  }

  // ─── CREATE VENTA ─────────────────────────────────────────────────────────

  async create(createVentaDto: CreateVentaDto) {
    const {
      sucursalId,
      usuarioId,
      clienteId,
      productos,
      metodoPago,
      nombre,
      dpi,
      telefono,
      direccion,
      imei,
      iPInternet,
      empaques,
      monto,
    } = createVentaDto;

    if (!sucursalId || !usuarioId) {
      throw new BadRequestException(
        'sucursalId y usuarioId son requeridos para crear una venta',
      );
    }
    if (!productos || productos.length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un producto para crear una venta',
      );
    }

    this.logger.log(
      `Intentando crear venta. sucursalId=${sucursalId}, usuarioId=${usuarioId}, metodoPago=${metodoPago}`,
    );

    try {
      // stockUpdates se saca de la transacción para usarlo en la auditoría
      let stockUpdatesParaAuditoria: StockUpdate[] = [];

      const venta = await this.prisma.$transaction(async (tx) => {
        // 0) Caja
        const esPagoExentoDeCaja =
          metodoPago === MetodoPago.TARJETA ||
          metodoPago === MetodoPago.TRANSFERENCIA;

        let cajaAbierta: { id: number } | null = null;

        if (esPagoExentoDeCaja) {
          cajaAbierta = await this.getCajaAbierta(tx, sucursalId, usuarioId);
        } else {
          cajaAbierta = await this.getCajaAbiertaOrThrow(
            tx,
            sucursalId,
            usuarioId,
          );
        }

        // 1) Cliente
        const clienteConnect = await this.getClienteConnect(tx, {
          clienteId,
          nombre,
          dpi,
          telefono,
          direccion,
          iPInternet,
        });

        // 2) Preparar productos + stock (cantidadAnterior ya viene aquí)
        const { productosFinal, stockUpdates } =
          await this.prepararProductosYStock(
            tx,
            productos,
            empaques,
            sucursalId,
          );

        // Guardamos referencia para usarla FUERA de la tx en la auditoría
        stockUpdatesParaAuditoria = stockUpdates;

        // 3) Aplicar descuento de stock
        await this.aplicarStock(tx, stockUpdates);

        // 4) Total
        const totalVenta = this.calcularTotalVenta(productosFinal);
        if (monto && monto !== totalVenta) {
          this.logger.warn(
            `Monto enviado (${monto}) difiere del calculado (${totalVenta}). Se usará el calculado.`,
          );
        }

        // 5) Crear venta
        const ventaCreada = await tx.venta.create({
          data: {
            usuario: { connect: { id: usuarioId } },
            sucursal: { connect: { id: sucursalId } },
            ...(cajaAbierta && {
              registroCaja: { connect: { id: cajaAbierta.id } },
            }),
            cliente: clienteConnect,
            horaVenta: new Date(),
            totalVenta,
            imei,
            productos: {
              create: productosFinal.map((prod) => ({
                producto: { connect: { id: prod.productoId } },
                cantidad: prod.cantidad,
                precioVenta: prod.precioVenta,
              })),
            },
          },
        });

        // 6) Saldo sucursal
        await tx.sucursalSaldo.update({
          where: { sucursalId },
          data: {
            saldoAcumulado: { increment: totalVenta },
            totalIngresos: { increment: totalVenta },
          },
        });

        // 7) Precios especiales
        await this.marcarPreciosEspeciales(tx, productosFinal);

        // 8) Pago
        const pago = await tx.pago.create({
          data: {
            metodoPago,
            monto: ventaCreada.totalVenta,
            venta: { connect: { id: ventaCreada.id } },
          },
        });

        await tx.venta.update({
          where: { id: ventaCreada.id },
          data: { metodoPago: { connect: { id: pago.id } } },
        });

        return ventaCreada;
      });
      // ── Fin transacción ───────────────────────────────────────────────────

      this.logger.log(`Venta creada correctamente. ventaId=${venta.id}`);

      // AUDITORÍA — fuera de la tx, con los datos capturados durante prepararProductosYStock
      await this.movimientoStock.registrarMuchos(
        stockUpdatesParaAuditoria
          .filter((s) => s.cantidadAnterior !== s.cantidad) // ← solo delta ≠ 0
          .map((s) => ({
            stockId: s.id,
            productoId: s.productoId,
            empaqueId: s.empaqueId,
            tipoMovimiento: TipoMovimientoStock.VENTA,
            cantidadAnterior: s.cantidadAnterior,
            cantidadNueva: s.cantidad,
            usuarioId,
            sucursalId: s.sucursalId,
            ventaId: venta.id,
            origenModulo: 'VentaService.create',
          })),
      );

      return venta;
    } catch (error) {
      this.logger.error(
        `Error al crear la venta: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al crear la venta');
    }
  }

  // ─── READS — sin cambios ──────────────────────────────────────────────────

  async findAll() {
    try {
      return await this.prisma.venta.findMany({
        include: {
          cliente: true,
          metodoPago: true,
          productos: { include: { producto: true } },
        },
        orderBy: { fechaVenta: 'desc' },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }

  async findAllSaleSucursal(id: number, query: FindSucursalSalesDto) {
    const { page = 1, pageSize = 25, search, from, to } = query;

    const safePage = page < 1 ? 1 : page;
    const safePageSize = pageSize < 1 ? 25 : Math.min(pageSize, 200);
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const where: Prisma.VentaWhereInput = { sucursalId: id };

    if (from || to) {
      where.fechaVenta = {};
      if (from)
        (where.fechaVenta as Prisma.DateTimeFilter).gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        (where.fechaVenta as Prisma.DateTimeFilter).lte = toDate;
      }
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      const numericSearch = Number(term);
      const or: Prisma.VentaWhereInput['OR'] = [
        { cliente: { nombre: { contains: term, mode: 'insensitive' } } },
        { cliente: { telefono: { contains: term, mode: 'insensitive' } } },
        { cliente: { dpi: { contains: term, mode: 'insensitive' } } },
        { cliente: { direccion: { contains: term, mode: 'insensitive' } } },
        { nombreClienteFinal: { contains: term, mode: 'insensitive' } },
        { telefonoClienteFinal: { contains: term, mode: 'insensitive' } },
        { direccionClienteFinal: { contains: term, mode: 'insensitive' } },
      ];
      if (!isNaN(numericSearch)) {
        or.push({ id: numericSearch }, { cliente: { id: numericSearch } });
      }
      where.OR = or;
    }

    try {
      const [items, aggregate] = await this.prisma.$transaction([
        this.prisma.venta.findMany({
          where,
          include: {
            cliente: true,
            metodoPago: true,
            productos: { include: { producto: true } },
          },
          orderBy: { fechaVenta: 'desc' },
          skip,
          take,
        }),
        this.prisma.venta.aggregate({
          where,
          _count: { _all: true },
          _sum: { totalVenta: true },
        }),
      ]);

      const totalItems = aggregate._count._all;
      const totalPages =
        totalItems === 0 ? 1 : Math.ceil(totalItems / safePageSize);

      return {
        items,
        page: safePage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
        summary: {
          totalInRange: aggregate._sum.totalVenta ?? 0,
          countInRange: totalItems,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }

  async findOneSale(id: number) {
    try {
      return await this.prisma.venta.findUnique({
        where: { id },
        include: {
          cliente: true,
          metodoPago: true,
          sucursal: {
            select: {
              direccion: true,
              nombre: true,
              id: true,
              telefono: true,
              pbx: true,
            },
          },
          productos: {
            include: { producto: true },
            orderBy: { precioVenta: 'desc' },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }

  async update(id: number, updateVentaDto: UpdateVentaDto) {
    try {
      const venta = await this.prisma.venta.update({
        where: { id },
        data: {
          productos: {
            connect: updateVentaDto.productos.map((prod) => ({
              id: prod.productoId,
            })),
          },
        },
      });
      if (!venta)
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      return venta;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al actualizar la venta');
    }
  }

  async getSalesToCashRegist(sucursalId: number, usuarioId: number) {
    try {
      const sales = await this.prisma.venta.findMany({
        orderBy: { fechaVenta: 'desc' },
        where: { sucursalId, registroCajaId: null, usuarioId },
        include: {
          productos: {
            select: {
              cantidad: true,
              producto: {
                select: { id: true, nombre: true, codigoProducto: true },
              },
            },
          },
        },
      });
      if (!sales) throw new BadRequestException('Error al conseguir registros');
      return sales;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al conseguir registros de ventas',
      );
    }
  }

  async removeAll() {
    try {
      return await this.prisma.venta.deleteMany({});
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar las ventas');
    }
  }

  async remove(id: number) {
    try {
      const venta = await this.prisma.venta.delete({ where: { id } });
      if (!venta)
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      return venta;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar la venta');
    }
  }

  async findAllSaleCustomer(customerId: number) {
    try {
      return await this.prisma.venta.findMany({
        where: { clienteId: customerId },
        include: {
          cliente: true,
          metodoPago: true,
          productos: { include: { producto: true } },
        },
        orderBy: { fechaVenta: 'desc' },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }
}
