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
import { MetodoPago, Prisma } from '@prisma/client';
import { FindSucursalSalesDto } from './dto/find-sucursal-sales.dto';

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

@Injectable()
export class VentaService {
  //
  private readonly logger = new Logger(VentaService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly clienteService: ClientService, // Inyección del servicio Cliente
  ) {}

  // ⚠️ Un solo lugar para filtrar "caja abierta válida"
  private async findCajaAbierta(
    tx: Prisma.TransactionClient,
    sucursalId: number,
    usuarioId: number,
  ): Promise<{ id: number } | null> {
    const caja = await tx.registroCaja.findFirst({
      where: {
        sucursalId,
        usuarioId,
        estado: 'ABIERTO',
        // si estás ya forzando fechaCierre = null al abrir, puedes dejar esto;
        // si no, quítalo. Yo lo dejo porque ya lo corregiste arriba.
        fechaCierre: null,
      },
      orderBy: {
        fechaInicio: 'desc',
      },
      select: { id: true },
    });

    return caja ?? null;
  }

  // Versión estricta: se apoya en la anterior y lanza si no hay caja
  private async getCajaAbiertaOrThrow(
    tx: Prisma.TransactionClient,
    sucursalId: number,
    usuarioId: number,
  ): Promise<{ id: number }> {
    const caja = await this.findCajaAbierta(tx, sucursalId, usuarioId);

    if (!caja) {
      this.logger.warn(
        `No se encontró caja abierta para sucursalId=${sucursalId}, usuarioId=${usuarioId} al crear venta`,
      );
      throw new BadRequestException(
        'No hay un registro de caja abierto para este usuario en esta sucursal. No se puede registrar la venta.',
      );
    }

    return caja;
  }

  // Versión opcional: para métodos exentos. NO lanza, solo devuelve null si no hay.
  private async getCajaAbierta(
    tx: Prisma.TransactionClient,
    sucursalId: number,
    usuarioId: number,
  ): Promise<{ id: number } | null> {
    return this.findCajaAbierta(tx, sucursalId, usuarioId);
  }

  // CREAR VENTA

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

    if (clienteId) {
      return { connect: { id: clienteId } };
    }

    if (nombre && telefono) {
      const nuevoCliente = await tx.cliente.create({
        data: {
          nombre,
          dpi,
          telefono,
          direccion,
          iPInternet,
        },
      });

      this.logger.log(
        `Cliente creado para venta. clienteId=${nuevoCliente.id}`,
      );

      return { connect: { id: nuevoCliente.id } };
    }

    // Cliente opcional: si no viene nada, la venta se crea sin cliente
    return undefined;
  }

  private async prepararProductosYStock(
    tx: Prisma.TransactionClient,
    productos: ProductoInput[],
    empaques: EmpaqueInput[] | undefined,
    sucursalId: number,
  ): Promise<{
    productosFinal: ProductoPreparado[];
    stockUpdates: { id: number; cantidad: number }[];
  }> {
    // 1) Traer precio y validar que no esté usado
    const productosConPrecio: ProductoPreparado[] = [];

    for (const prod of productos) {
      const precioProducto = await tx.precioProducto.findUnique({
        where: {
          id: prod.selectedPriceId,
        },
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

    // 2) Consolidar productos repetidos por productoId
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

    const stockUpdates: { id: number; cantidad: number }[] = [];

    // 3) Preparar descuento de stock para productos
    for (const prod of productosFinal) {
      let restante = prod.cantidad;

      const stocks = await tx.stock.findMany({
        where: {
          productoId: prod.productoId,
          sucursalId,
        },
        orderBy: {
          fechaIngreso: 'asc',
        },
      });

      for (const stock of stocks) {
        if (restante <= 0) break;

        if (stock.cantidad >= restante) {
          stockUpdates.push({
            id: stock.id,
            cantidad: stock.cantidad - restante,
          });
          restante = 0;
        } else {
          stockUpdates.push({ id: stock.id, cantidad: 0 });
          restante -= stock.cantidad;
        }
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

    // 4) Preparar descuento de stock para empaques (si aplica)
    const empaquesValidos = (empaques ?? []).filter((e) => e.quantity > 0);

    for (const pack of empaquesValidos) {
      let restante = pack.quantity;

      const stocks = await tx.stock.findMany({
        where: {
          empaqueId: pack.id,
          sucursalId,
        },
        orderBy: {
          fechaIngreso: 'asc',
        },
      });

      for (const stock of stocks) {
        if (restante <= 0) break;

        if (stock.cantidad >= restante) {
          stockUpdates.push({
            id: stock.id,
            cantidad: stock.cantidad - restante,
          });
          restante = 0;
        } else {
          stockUpdates.push({ id: stock.id, cantidad: 0 });
          restante -= stock.cantidad;
        }
      }

      if (restante > 0) {
        this.logger.warn(
          `Stock insuficiente para el empaqueId=${pack.id} en sucursalId=${sucursalId}`,
        );
        throw new BadRequestException(
          `Stock insuficiente para el empaque con ID ${pack.id}`,
        );
      }
    }

    return { productosFinal, stockUpdates };
  }

  private async aplicarStock(
    tx: Prisma.TransactionClient,
    stockUpdates: { id: number; cantidad: number }[],
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
        tx.precioProducto.delete({
          where: { id: prod.selectedPriceId },
        }),
      ),
    );

    this.logger.log(
      `Precios especiales eliminados: ${especiales
        .map((e) => e.selectedPriceId)
        .join(', ')}`,
    );
  }

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
      `Intentando crear venta. sucursalId=${sucursalId}, usuarioId=${usuarioId}, metodoPago=${metodoPago}, productos=${productos.length}`,
    );

    try {
      const venta = await this.prisma.$transaction(async (tx) => {
        // 0) Regla: solo TARJETA y TRANSFERENCIA pueden vivir sin caja
        const esPagoExentoDeCaja =
          metodoPago === MetodoPago.TARJETA ||
          metodoPago === MetodoPago.TRANSFERENCIA;

        this.logger.log(
          `Evaluando caja. metodoPago=${metodoPago}, esPagoExentoDeCaja=${esPagoExentoDeCaja}`,
        );

        let cajaAbierta: { id: number } | null = null;

        if (esPagoExentoDeCaja) {
          // Venta vía banco (no cash): caja NO es obligatoria,
          // pero si hay una abierta, la ligamos igual.
          cajaAbierta = await this.getCajaAbierta(tx, sucursalId, usuarioId);
          if (!cajaAbierta) {
            this.logger.log(
              `Venta con metodoPago=${metodoPago} SIN caja abierta (permitido). sucursalId=${sucursalId}, usuarioId=${usuarioId}`,
            );
          } else {
            this.logger.log(
              `Venta con metodoPago=${metodoPago} ligada opcionalmente a cajaId=${cajaAbierta.id}`,
            );
          }
        } else {
          // CUALQUIER otra forma de pago (CONTADO, EFECTIVO, etc.) REQUIERE caja
          cajaAbierta = await this.getCajaAbiertaOrThrow(
            tx,
            sucursalId,
            usuarioId,
          );
        }

        this.logger.log('Caja utilizada para la venta: ', cajaAbierta);

        // 1) Cliente (existente o nuevo)
        const clienteConnect = await this.getClienteConnect(tx, {
          clienteId,
          nombre,
          dpi,
          telefono,
          direccion,
          iPInternet,
        });

        // 2) Preparar productos + stock (incluye empaques)
        const { productosFinal, stockUpdates } =
          await this.prepararProductosYStock(
            tx,
            productos,
            empaques,
            sucursalId,
          );

        // 3) Aplicar actualizaciones de stock
        await this.aplicarStock(tx, stockUpdates);

        // 4) Calcular total de la venta
        const totalVenta = this.calcularTotalVenta(productosFinal);

        if (monto && monto !== totalVenta) {
          this.logger.warn(
            `Monto enviado (${monto}) difiere del totalVenta calculado (${totalVenta}). Se usará el calculado.`,
          );
        }

        // 5) Crear venta ligada a usuario, sucursal y, si aplica, caja
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

        // 6) Actualizar saldo de la sucursal
        await tx.sucursalSaldo.update({
          where: { sucursalId },
          data: {
            saldoAcumulado: { increment: totalVenta },
            totalIngresos: { increment: totalVenta },
          },
        });

        // 7) Marcar precios especiales como usados / eliminar
        await this.marcarPreciosEspeciales(tx, productosFinal);

        // 8) Registrar pago
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

      this.logger.log(`Venta creada correctamente. ventaId=${venta.id}`);

      return venta;
    } catch (error) {
      this.logger.error(
        `Error al crear la venta: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear la venta');
    }
  }

  // CREAR VENTA

  async findAll() {
    try {
      const ventas = await this.prisma.venta.findMany({
        include: {
          cliente: true,
          metodoPago: true,
          productos: {
            include: {
              producto: true,
            },
          },
        },
        orderBy: {
          fechaVenta: 'desc',
        },
      });
      return ventas;
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

    const where: Prisma.VentaWhereInput = {
      sucursalId: id,
    };

    // 🔹 Rango de fechas (fechaVenta)
    if (from || to) {
      where.fechaVenta = {};
      if (from) {
        (where.fechaVenta as Prisma.DateTimeFilter).gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        // Final del día
        toDate.setHours(23, 59, 59, 999);
        (where.fechaVenta as Prisma.DateTimeFilter).lte = toDate;
      }
    }

    // 🔹 Búsqueda por texto (cliente, venta, nombre final, etc.)
    if (search && search.trim().length > 0) {
      const term = search.trim();
      const numericSearch = Number(term);
      const or: Prisma.VentaWhereInput['OR'] = [
        // Cliente asociado
        {
          cliente: {
            nombre: {
              contains: term,
              mode: 'insensitive',
            },
          },
        },
        {
          cliente: {
            telefono: {
              contains: term,
              mode: 'insensitive',
            },
          },
        },
        {
          cliente: {
            dpi: {
              contains: term,
              mode: 'insensitive',
            },
          },
        },
        {
          cliente: {
            direccion: {
              contains: term,
              mode: 'insensitive',
            },
          },
        },
        // Datos de cliente final
        {
          nombreClienteFinal: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          telefonoClienteFinal: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          direccionClienteFinal: {
            contains: term,
            mode: 'insensitive',
          },
        },
      ];

      if (!isNaN(numericSearch)) {
        or.push(
          { id: numericSearch },
          {
            cliente: {
              id: numericSearch,
            },
          },
        );
      }

      where.OR = or;
    }

    try {
      // 1) Items paginados
      // 2) Conteo total y suma totalVenta para el filtro (para summary)
      const [items, aggregate] = await this.prisma.$transaction([
        this.prisma.venta.findMany({
          where,
          include: {
            cliente: true,
            metodoPago: true,
            productos: {
              include: { producto: true },
            },
          },
          orderBy: {
            fechaVenta: 'desc',
          },
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

      const totalInRange = aggregate._sum.totalVenta ?? 0;

      return {
        items,
        page: safePage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
        summary: {
          totalInRange,
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
      const ventas = await this.prisma.venta.findUnique({
        where: {
          id: id,
        },

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
            include: {
              producto: true,
            },
            orderBy: {
              precioVenta: 'desc',
            },
          },
        },
      });
      return ventas;
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

      if (!venta) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }
      return venta;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al actualizar la venta');
    }
  }

  async getSalesToCashRegist(sucursalId: number, usuarioId: number) {
    try {
      const salesWithoutCashRegist = await this.prisma.venta.findMany({
        orderBy: {
          fechaVenta: 'desc',
        },
        where: {
          sucursalId: sucursalId,
          registroCajaId: null,
          usuarioId: usuarioId,
        },
        include: {
          productos: {
            select: {
              cantidad: true,
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  codigoProducto: true,
                },
              },
            },
          },
        },
      });

      if (!salesWithoutCashRegist) {
        throw new BadRequestException('Error al conseguir registros');
      }

      return salesWithoutCashRegist;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al conseguir registros de ventas',
      );
    }
  }

  async removeAll() {
    try {
      const ventas = await this.prisma.venta.deleteMany({});
      return ventas;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar las ventas');
    }
  }

  async remove(id: number) {
    try {
      const venta = await this.prisma.venta.delete({
        where: { id },
      });
      if (!venta) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }
      return venta;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar la venta');
    }
  }

  //ENCONTRAR SOLO VENTAS DE UN SOLO CLIENTE
  async findAllSaleCustomer(customerId: number) {
    try {
      const ventas = await this.prisma.venta.findMany({
        where: {
          clienteId: customerId,
        },
        include: {
          cliente: true,
          metodoPago: true,
          productos: {
            include: {
              producto: true,
            },
          },
        },
        orderBy: {
          fechaVenta: 'desc',
        },
      });
      return ventas;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }
}
