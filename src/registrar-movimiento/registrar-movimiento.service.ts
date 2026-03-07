import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoMovimientoStock } from '@prisma/client';
import { RegistrarMovimientoDto } from './interfaces';

@Injectable()
export class MovimientoStockService {
  private readonly logger = new Logger(MovimientoStockService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un movimiento de stock en la tabla de auditoría.
   * Este método nunca lanza — si falla, loguea el error silenciosamente
   * para no interrumpir el flujo principal de negocio.
   */
  async registrar(dto: RegistrarMovimientoDto): Promise<void> {
    const delta = dto.cantidadNueva - dto.cantidadAnterior;

    try {
      await this.prisma.movimientoStock.create({
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
        `[${dto.origenModulo ?? 'N/A'}] Movimiento registrado — ` +
          `tipo=${dto.tipoMovimiento} stockId=${dto.stockId} ` +
          `delta=${delta > 0 ? '+' : ''}${delta}`,
      );
    } catch (error) {
      // NUNCA relanzamos: la auditoría no debe romper el flujo principal
      this.logger.error(
        `Error al registrar movimiento de stock: ${error?.message ?? error}`,
        error?.stack,
      );
    }
  }

  /**
   * Variante para registrar múltiples movimientos de una sola vez
   * (ej: al crear stock en lote con createMany).
   * Usa Promise.allSettled para que un fallo individual no cancele los demás.
   */
  async registrarMuchos(dtos: RegistrarMovimientoDto[]): Promise<void> {
    await Promise.allSettled(dtos.map((dto) => this.registrar(dto)));
  }

  // ─── CONSULTAS ────────────────────────────────────────────────────────────

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
