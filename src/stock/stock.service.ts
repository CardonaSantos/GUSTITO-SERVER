import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStockDto, StockEntryDTO } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEntregaStockDto } from 'src/entrega-stock/dto/create-entrega-stock.dto';
import { AjusteStockService } from 'src/ajuste-stock/ajuste-stock.service';
import { DeleteStockDto } from './dto/delete-stock.dto';
import { CreateEmpaqueStockDto } from './dto/create-empaque-stock.dto';
import { DeleteEmpaqueStockDto } from './dto/delete-stockEmpaque.dto';
@Injectable()
export class StockService {
  //
  constructor(
    private readonly prisma: PrismaService,
    private readonly ajusteStock: AjusteStockService,
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

  // Normaliza fechas que llegan del UI (ISO string) a Date
  private normalizeDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  async create(createStockDto: StockEntryDTO) {
    const { proveedorId, stockEntries, sucursalId, recibidoPorId } =
      createStockDto;

    // Validaciones básicas de payload
    this.ensureBasePayload(
      proveedorId,
      sucursalId,
      recibidoPorId,
      stockEntries,
    );

    try {
      const costoStockEntrega = this.calculateTotal(stockEntries);

      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Crear entrega de stock
        const entrega = await tx.entregaStock.create({
          data: {
            proveedorId,
            montoTotal: costoStockEntrega,
            recibidoPorId,
            sucursalId,
          },
        });

        // 2) Crear stocks asociados (uno por cada entrada)
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

        // Puedes devolver la entrega con info adicional si quieres
        return entrega;
      });

      return result;
    } catch (error) {
      console.error('Error al crear la entrega de stock:', error);
      throw new InternalServerErrorException(
        'Error al crear la entrega de stock',
      );
    }
  }

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

      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Crear entrega de stock
        const entrega = await tx.entregaStock.create({
          data: {
            proveedorId,
            montoTotal: costoTotalEntrega,
            recibidoPorId,
            sucursalId,
          },
        });

        // 2) Crear registros de stock para empaques
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

      return result;
    } catch (error) {
      console.error('Error al registrar stock de empaques:', error);
      throw new InternalServerErrorException(
        'Error al registrar stock de empaques',
      );
    }
  }

  async findAll() {
    try {
      const stocks = await this.prisma.stock.findMany({});
      return stocks;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al obtener los stocks');
    }
  }

  async findOne(id: number) {
    try {
      const stock = await this.prisma.stock.findUnique({
        where: { id },
      });
      if (!stock) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }
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
        include: {
          producto: {
            select: {
              nombre: true,
              id: true,
            },
          },
        },
      });
      if (!stock) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }
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
        include: {
          empaque: {
            select: {
              nombre: true,
              id: true,
            },
          },
        },
      });
      if (!stock) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }

      const formattStock = {
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

      return formattStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al encontrar el stock');
    }
  }

  async deleteOneStock(dto: DeleteStockDto) {
    try {
      // Obtener el stock antes de eliminarlo
      const stockToDelete = await this.prisma.stock.findUnique({
        where: { id: dto.stockId },
      });

      if (!stockToDelete) {
        throw new BadRequestException('Stock no encontrado');
      }

      // Crear el registro en EliminacionStock
      const registroEliminacionStock =
        await this.prisma.eliminacionStock.create({
          data: {
            // stockId: dto.stockId,
            productoId: dto.productoId,
            sucursalId: dto.sucursalId,
            usuarioId: dto.usuarioId,
            fechaHora: new Date(),
            motivo: dto.motivo || 'Sin motivo especificado',
          },
        });

      // Eliminar el stock
      await this.prisma.stock.delete({
        where: { id: dto.stockId },
      });

      return registroEliminacionStock;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al eliminar el stock y registrar la eliminación',
      );
    }
  }

  async deleteOneEmpaqueStock(dto: DeleteEmpaqueStockDto) {
    try {
      // Obtener el stock antes de eliminarlo
      const stockToDelete = await this.prisma.stock.findUnique({
        where: { id: dto.stockId },
      });

      if (!stockToDelete) {
        throw new BadRequestException('Stock no encontrado');
      }

      // Crear el registro en EliminacionStock
      const registroEliminacionStock =
        await this.prisma.eliminacionStock.create({
          data: {
            // productoId: dto.productoId ?? undefined,
            empaqueId: dto.empaqueId ?? undefined,
            sucursalId: dto.sucursalId ?? undefined,
            usuarioId: dto.usuarioId ?? undefined,
            fechaHora: new Date(),
            motivo: dto.motivo || 'Sin motivo especificado',
          },
        });

      // Eliminar el stock
      await this.prisma.stock.delete({
        where: { id: dto.stockId },
      });

      return registroEliminacionStock;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al eliminar el stock y registrar la eliminación',
      );
    }
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    try {
      const stock = await this.prisma.stock.update({
        where: { id },
        data: updateStockDto,
      });
      if (!stock) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }
      return stock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al actualizar el stock');
    }
  }

  async removeAll() {
    try {
      const stocks = await this.prisma.stock.deleteMany({});
      return stocks;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar los stocks');
    }
  }

  async remove(id: number) {
    try {
      const stock = await this.prisma.stock.delete({
        where: { id },
      });
      if (!stock) {
        throw new NotFoundException(`Stock con ID ${id} no encontrado`);
      }
      return stock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al eliminar el stock');
    }
  }

  async deleteStock(idStock: number, userID: number) {
    try {
      const stockToDelete = await this.prisma.stock.findUnique({
        where: {
          id: idStock,
        },
      });

      if (!stockToDelete) {
        throw new BadRequestException('Error al encontrar stock para eliminar');
      }

      await this.prisma.stock.delete({
        where: {
          id: stockToDelete.id,
        },
      });

      return stockToDelete;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar stock ');
    }
  }
}
