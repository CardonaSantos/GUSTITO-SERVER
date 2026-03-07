import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStockDto, StockEntryDTO } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AjusteStockService } from 'src/ajuste-stock/ajuste-stock.service';
import { DeleteStockDto } from './dto/delete-stock.dto';
import { CreateEmpaqueStockDto } from './dto/create-empaque-stock.dto';
import { DeleteEmpaqueStockDto } from './dto/delete-stockEmpaque.dto';
import { TipoMovimientoStock } from '@prisma/client';
import { MovimientoStockService } from 'src/registrar-movimiento/registrar-movimiento.service';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ajusteStock: AjusteStockService,
    private readonly movimientoStock: MovimientoStockService, // ← inyectado
  ) {}

  // ==========================
  // HELPERS PRIVADOS
  // ==========================
  private ensureBasePayload(
    proveedorId?: number,
    sucursalId?: number,
    recibidoPorId?: number,
    stockEntries?: { cantidad: number; precioCosto: number }[],
  ) {
    if (!proveedorId || !sucursalId || !recibidoPorId) {
      throw new BadRequestException(
        'Proveedor, sucursal y usuario receptor son obligatorios',
      );
    }
    if (!stockEntries || stockEntries.length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos una entrada de stock',
      );
    }
    const hasInvalidEntry = stockEntries.some(
      (entry) =>
        !entry ||
        typeof entry.cantidad !== 'number' ||
        typeof entry.precioCosto !== 'number' ||
        entry.cantidad <= 0 ||
        entry.precioCosto <= 0,
    );
    if (hasInvalidEntry) {
      throw new BadRequestException(
        'Todas las entradas de stock deben tener cantidad y precio de costo válidos (> 0)',
      );
    }
  }

  private calculateTotal(entries: { cantidad: number; precioCosto: number }[]) {
    return entries.reduce(
      (total, entry) => total + entry.cantidad * entry.precioCosto,
      0,
    );
  }

  private normalizeDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // ==========================
  // CREATE — PRODUCTOS
  // ==========================
  async create(createStockDto: StockEntryDTO) {
    const { proveedorId, stockEntries, sucursalId, recibidoPorId } =
      createStockDto;

    this.ensureBasePayload(
      proveedorId,
      sucursalId,
      recibidoPorId,
      stockEntries,
    );

    try {
      const costoStockEntrega = this.calculateTotal(stockEntries);

      // ── Transacción: crea entrega + stocks ──────────────────────────────
      const result = await this.prisma.$transaction(async (tx) => {
        const entrega = await tx.entregaStock.create({
          data: {
            proveedorId,
            montoTotal: costoStockEntrega,
            recibidoPorId,
            sucursalId,
          },
        });

        await tx.stock.createMany({
          data: stockEntries.map((entry) => ({
            productoId: entry.productoId,
            cantidad: entry.cantidad,
            cantidadInicial: entry.cantidad,
            costoTotal: entry.cantidad * entry.precioCosto,
            fechaIngreso: this.normalizeDate(entry.fechaIngreso),
            fechaVencimiento: this.normalizeDate(entry.fechaVencimiento),
            precioCosto: entry.precioCosto,
            entregaStockId: entrega.id,
            sucursalId,
          })),
        });

        return entrega;
      });
      // ── Fin transacción ─────────────────────────────────────────────────

      // AUDITORÍA — fuera de la transacción para no afectar el flujo principal
      // createMany no devuelve IDs, así que los recuperamos por entregaStockId
      const stocksCreados = await this.prisma.stock.findMany({
        where: { entregaStockId: result.id },
      });

      await this.movimientoStock.registrarMuchos(
        stocksCreados.map((s) => ({
          stockId: s.id,
          productoId: s.productoId ?? undefined,
          tipoMovimiento: TipoMovimientoStock.INGRESO,
          cantidadAnterior: 0,
          cantidadNueva: s.cantidad,
          usuarioId: recibidoPorId,
          sucursalId: sucursalId,
          entregaStockId: result.id,
          origenModulo: 'StockService.create',
        })),
      );

      return result;
    } catch (error) {
      console.error('Error al crear la entrega de stock:', error);
      throw new InternalServerErrorException(
        'Error al crear la entrega de stock',
      );
    }
  }

  // ==========================
  // CREATE — EMPAQUES
  // ==========================
  async createEmpaqueStock(createStockDto: CreateEmpaqueStockDto) {
    const { proveedorId, stockEntries, sucursalId, recibidoPorId } =
      createStockDto;

    this.ensureBasePayload(
      proveedorId,
      sucursalId,
      recibidoPorId,
      stockEntries,
    );

    try {
      const costoTotalEntrega = this.calculateTotal(stockEntries);

      // ── Transacción ─────────────────────────────────────────────────────
      const result = await this.prisma.$transaction(async (tx) => {
        const entrega = await tx.entregaStock.create({
          data: {
            proveedorId,
            montoTotal: costoTotalEntrega,
            recibidoPorId,
            sucursalId,
          },
        });

        await tx.stock.createMany({
          data: stockEntries.map((entry) => ({
            empaqueId: entry.empaqueId,
            cantidad: entry.cantidad,
            cantidadInicial: entry.cantidad,
            costoTotal: entry.cantidad * entry.precioCosto,
            fechaIngreso: this.normalizeDate(entry.fechaIngreso) ?? new Date(),
            fechaVencimiento: this.normalizeDate(entry.fechaVencimiento),
            precioCosto: entry.precioCosto,
            entregaStockId: entrega.id,
            sucursalId,
          })),
        });

        return entrega;
      });
      // ── Fin transacción ─────────────────────────────────────────────────

      // AUDITORÍA — fuera de la transacción
      const stocksCreados = await this.prisma.stock.findMany({
        where: { entregaStockId: result.id },
      });

      await this.movimientoStock.registrarMuchos(
        stocksCreados.map((s) => ({
          stockId: s.id,
          empaqueId: s.empaqueId ?? undefined,
          tipoMovimiento: TipoMovimientoStock.INGRESO,
          cantidadAnterior: 0,
          cantidadNueva: s.cantidad,
          usuarioId: recibidoPorId,
          sucursalId: sucursalId,
          entregaStockId: result.id,
          origenModulo: 'StockService.createEmpaqueStock',
        })),
      );

      return result;
    } catch (error) {
      console.error('Error al registrar stock de empaques:', error);
      throw new InternalServerErrorException(
        'Error al registrar stock de empaques',
      );
    }
  }

  // ==========================
  // UPDATE — PATCH directo
  // ==========================
  async update(id: number, updateStockDto: UpdateStockDto) {
    try {
      // Guardamos el estado ANTES para calcular el delta
      const stockAntes = await this.prisma.stock.findUnique({ where: { id } });
      if (!stockAntes) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }

      const stock = await this.prisma.stock.update({
        where: { id },
        data: updateStockDto,
      });

      // AUDITORÍA — solo si la cantidad cambió
      if (
        updateStockDto.cantidad !== undefined &&
        updateStockDto.cantidad !== stockAntes.cantidad
      ) {
        await this.movimientoStock.registrar({
          stockId: stock.id,
          productoId: stock.productoId ?? undefined,
          empaqueId: stock.empaqueId ?? undefined,
          tipoMovimiento: TipoMovimientoStock.CORRECCION,
          cantidadAnterior: stockAntes.cantidad,
          cantidadNueva: stock.cantidad,
          sucursalId: stock.sucursalId,
          descripcion: 'Actualización directa vía PATCH /stock/:id',
          origenModulo: 'StockService.update',
        });
      }

      return stock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al actualizar el stock');
    }
  }

  // ==========================
  // DELETE — producto con motivo
  // ==========================
  async deleteOneStock(dto: DeleteStockDto) {
    try {
      const stockToDelete = await this.prisma.stock.findUnique({
        where: { id: dto.stockId },
      });

      if (!stockToDelete) {
        throw new BadRequestException('Stock no encontrado');
      }

      const registroEliminacionStock =
        await this.prisma.eliminacionStock.create({
          data: {
            productoId: dto.productoId,
            sucursalId: dto.sucursalId,
            usuarioId: dto.usuarioId,
            fechaHora: new Date(),
            motivo: dto.motivo || 'Sin motivo especificado',
          },
        });

      await this.prisma.stock.delete({ where: { id: dto.stockId } });

      // AUDITORÍA — después del delete, con los datos que guardamos antes
      await this.movimientoStock.registrar({
        // stockId omitido: el registro ya no existe en DB, FK sería null de todas formas
        productoId: dto.productoId,
        tipoMovimiento: TipoMovimientoStock.ELIMINACION,
        cantidadAnterior: stockToDelete.cantidad,
        cantidadNueva: 0,
        usuarioId: dto.usuarioId,
        sucursalId: dto.sucursalId,
        descripcion: dto.motivo || 'Sin motivo especificado',
        origenModulo: 'StockService.deleteOneStock',
      });

      return registroEliminacionStock;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al eliminar el stock y registrar la eliminación',
      );
    }
  }

  // ==========================
  // DELETE — empaque con motivo
  // ==========================
  async deleteOneEmpaqueStock(dto: DeleteEmpaqueStockDto) {
    try {
      const stockToDelete = await this.prisma.stock.findUnique({
        where: { id: dto.stockId },
      });

      if (!stockToDelete) {
        throw new BadRequestException('Stock no encontrado');
      }

      const registroEliminacionStock =
        await this.prisma.eliminacionStock.create({
          data: {
            empaqueId: dto.empaqueId ?? undefined,
            sucursalId: dto.sucursalId ?? undefined,
            usuarioId: dto.usuarioId ?? undefined,
            fechaHora: new Date(),
            motivo: dto.motivo || 'Sin motivo especificado',
          },
        });

      await this.prisma.stock.delete({ where: { id: dto.stockId } });

      // AUDITORÍA
      await this.movimientoStock.registrar({
        empaqueId: dto.empaqueId ?? undefined,
        tipoMovimiento: TipoMovimientoStock.ELIMINACION,
        cantidadAnterior: stockToDelete.cantidad,
        cantidadNueva: 0,
        usuarioId: dto.usuarioId ?? undefined,
        sucursalId: dto.sucursalId ?? undefined,
        descripcion: dto.motivo || 'Sin motivo especificado',
        origenModulo: 'StockService.deleteOneEmpaqueStock',
      });

      return registroEliminacionStock;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al eliminar el stock y registrar la eliminación',
      );
    }
  }

  // ==========================
  // DELETE — eliminación simple por ID + usuarioId
  // ==========================
  async deleteStock(idStock: number, userID: number) {
    try {
      const stockToDelete = await this.prisma.stock.findUnique({
        where: { id: idStock },
      });

      if (!stockToDelete) {
        throw new BadRequestException('Error al encontrar stock para eliminar');
      }

      await this.prisma.stock.delete({ where: { id: stockToDelete.id } });

      // AUDITORÍA
      await this.movimientoStock.registrar({
        productoId: stockToDelete.productoId ?? undefined,
        empaqueId: stockToDelete.empaqueId ?? undefined,
        tipoMovimiento: TipoMovimientoStock.ELIMINACION,
        cantidadAnterior: stockToDelete.cantidad,
        cantidadNueva: 0,
        usuarioId: userID,
        sucursalId: stockToDelete.sucursalId,
        origenModulo: 'StockService.deleteStock',
      });

      return stockToDelete;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar stock');
    }
  }

  // ==========================
  // DELETE — por ID sin contexto (genérico)
  // ==========================
  async remove(id: number) {
    try {
      // Guardamos antes de eliminar
      const stockAntes = await this.prisma.stock.findUnique({ where: { id } });

      const stock = await this.prisma.stock.delete({ where: { id } });

      if (!stock) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }

      // AUDITORÍA — sin usuarioId disponible en este endpoint
      await this.movimientoStock.registrar({
        productoId: stock.productoId ?? undefined,
        empaqueId: stock.empaqueId ?? undefined,
        tipoMovimiento: TipoMovimientoStock.ELIMINACION,
        cantidadAnterior: stockAntes?.cantidad ?? 0,
        cantidadNueva: 0,
        sucursalId: stock.sucursalId,
        descripcion: 'Eliminación vía DELETE /stock/:id (sin usuario)',
        origenModulo: 'StockService.remove',
      });

      return stock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar el stock');
    }
  }

  // ==========================
  // removeAll — sin auditoría individual
  // (operación masiva, solo para desarrollo/reset)
  // ==========================
  async removeAll() {
    try {
      this.logger.warn(
        'removeAll() ejecutado — eliminación masiva de stock SIN auditoría individual',
      );
      const stocks = await this.prisma.stock.deleteMany({});
      return stocks;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar los stocks');
    }
  }

  // ==========================
  // READS — sin cambios
  // ==========================
  async findAll() {
    try {
      return await this.prisma.stock.findMany({});
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener los stocks');
    }
  }

  async findOne(id: number) {
    try {
      const stock = await this.prisma.stock.findUnique({ where: { id } });
      if (!stock)
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      return stock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al encontrar el stock');
    }
  }

  async findOneStock(id: number) {
    try {
      const stock = await this.prisma.stock.findUnique({
        where: { id },
        include: { producto: { select: { nombre: true, id: true } } },
      });
      if (!stock)
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      return stock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al encontrar el stock');
    }
  }

  async findOneStockEmpaqueEdti(id: number) {
    try {
      const stock = await this.prisma.stock.findUnique({
        where: { id },
        include: { empaque: { select: { nombre: true, id: true } } },
      });
      if (!stock)
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);

      return {
        id: stock.id,
        empaqueId: stock.empaqueId,
        cantidad: stock.cantidad,
        costoTotal: stock.costoTotal,
        creadoEn: stock.creadoEn,
        fechaIngreso: stock.fechaIngreso,
        fechaVencimiento: stock.fechaVencimiento || null,
        precioCosto: stock.precioCosto,
        entregaStockId: stock.entregaStockId,
        sucursalId: stock.sucursalId,
        empaque: {
          id: stock.empaque.id,
          nombre: stock.empaque.nombre,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al encontrar el stock');
    }
  }
}
