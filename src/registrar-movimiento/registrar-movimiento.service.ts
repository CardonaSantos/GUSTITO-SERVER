import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TipoMovimientoStock } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegistrarMovimientoDto } from './interfaces';

type DbClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class MovimientoStockService {
  private readonly logger = new Logger(MovimientoStockService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: Prisma.TransactionClient): DbClient {
    return tx ?? this.prisma;
  }

  async registrar(
    dto: RegistrarMovimientoDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = this.getClient(tx);
    const delta = Number(dto.cantidadNueva) - Number(dto.cantidadAnterior);

    this.logger.debug(
      `[MovimientoStock][payload] ${JSON.stringify(dto, null, 2)}`,
    );

    try {
      const created = await client.movimientoStock.create({
        data: {
          stockId: dto.stockId ?? null,
          productoId: dto.productoId ?? null,
          empaqueId: dto.empaqueId ?? null,
          tipoMovimiento: dto.tipoMovimiento,
          cantidadAnterior: dto.cantidadAnterior,
          cantidadNueva: dto.cantidadNueva,
          delta,
          usuarioId: dto.usuarioId ?? null,
          sucursalId: dto.sucursalId ?? null,
          ventaId: dto.ventaId ?? null,
          entregaStockId: dto.entregaStockId ?? null,
          ajusteStockId: dto.ajusteStockId ?? null,
          transferenciaId: dto.transferenciaId ?? null,
          descripcion: dto.descripcion ?? null,
          origenModulo: dto.origenModulo ?? null,
        },
      });

      this.logger.debug(
        `[MovimientoStock][ok] id=${created.id} tipo=${dto.tipoMovimiento} delta=${delta}`,
      );
    } catch (error) {
      this.logger.error(
        `[MovimientoStock][error] ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async registrarMuchos(
    dtos: RegistrarMovimientoDto[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    this.logger.debug(
      `[MovimientoStock][registrarMuchos] cantidad=${dtos.length}`,
    );

    for (const dto of dtos) {
      await this.registrar(dto, tx);
    }
  }

  async findByProducto(productoId: number) {
    return this.prisma.movimientoStock.findMany({
      where: { productoId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, rol: true } },
        sucursal: { select: { id: true, nombre: true } },
        stock: { select: { id: true, cantidad: true } },
      },
    });
  }

  async findBySucursal(sucursalId: number) {
    return this.prisma.movimientoStock.findMany({
      where: { sucursalId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, rol: true } },
        producto: { select: { id: true, nombre: true, codigoProducto: true } },
        empaque: { select: { id: true, nombre: true } },
      },
    });
  }

  async findByStock(stockId: number) {
    return this.prisma.movimientoStock.findMany({
      where: { stockId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, rol: true } },
      },
    });
  }

  async findByUsuario(usuarioId: number) {
    return this.prisma.movimientoStock.findMany({
      where: { usuarioId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        producto: { select: { id: true, nombre: true, codigoProducto: true } },
        sucursal: { select: { id: true, nombre: true } },
      },
    });
  }
}
