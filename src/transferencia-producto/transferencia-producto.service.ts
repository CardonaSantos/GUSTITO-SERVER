import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTransferenciaProductoDto } from './dto/create-transferencia-producto.dto';
import { UpdateTransferenciaProductoDto } from './dto/update-transferencia-producto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { TipoMovimientoStock } from '@prisma/client';
import { MovimientoStockService } from 'src/registrar-movimiento/registrar-movimiento.service';

// Tipo interno para capturar los datos necesarios para auditoría
// fuera de la transacción
type MovimientoParaAuditoria = {
  stockId: number;
  productoId?: number;
  cantidadAnterior: number;
  cantidadNueva: number;
  sucursalId: number;
  esOrigen: boolean; // true = descuento, false = ingreso en destino
};

@Injectable()
export class TransferenciaProductoService {
  private readonly logger = new Logger(TransferenciaProductoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly movimientoStock: MovimientoStockService, // ← inyectado
  ) {}

  create(createTransferenciaProductoDto: CreateTransferenciaProductoDto) {
    return 'This action adds a new transferenciaProducto';
  }

  async transferirProducto(dto: CreateTransferenciaProductoDto) {
    const {
      productoId,
      cantidad,
      sucursalOrigenId,
      sucursalDestinoId,
      usuarioEncargadoId,
    } = dto;

    // Capturamos los movimientos para auditarlos fuera de la tx
    let movimientosParaAuditoria: MovimientoParaAuditoria[] = [];
    let transferenciaId: number;

    try {
      // ── Transacción: todo o nada ────────────────────────────────────────
      // 🔴 FIX: antes no había transacción — si fallaba a mitad del FIFO
      // el stock origen quedaba decrementado sin que el destino recibiera nada
      const resultado = await this.prisma.$transaction(async (tx) => {
        // 1) Verificar stock suficiente en origen
        const stockOrigenes = await tx.stock.findMany({
          where: { productoId, sucursalId: sucursalOrigenId },
          orderBy: { fechaIngreso: 'asc' }, // FIFO
        });

        const cantidadTotalOrigen = stockOrigenes.reduce(
          (total, s) => total + s.cantidad,
          0,
        );

        if (cantidadTotalOrigen < cantidad) {
          throw new BadRequestException(
            'Stock insuficiente en la sucursal de origen',
          );
        }

        // 2) FIFO — decrementar stock origen
        let cantidadRestante = cantidad;
        const movimientosOrigen: MovimientoParaAuditoria[] = [];

        for (const stock of stockOrigenes) {
          if (cantidadRestante === 0) break;

          const cantidadAnterior = stock.cantidad;
          let cantidadNueva: number;

          if (stock.cantidad <= cantidadRestante) {
            cantidadNueva = 0;
            cantidadRestante -= stock.cantidad;
          } else {
            cantidadNueva = stock.cantidad - cantidadRestante;
            cantidadRestante = 0;
          }

          await tx.stock.update({
            where: { id: stock.id },
            data: { cantidad: cantidadNueva },
          });

          // Capturamos para auditar después
          movimientosOrigen.push({
            stockId: stock.id,
            productoId: productoId,
            cantidadAnterior,
            cantidadNueva,
            sucursalId: sucursalOrigenId,
            esOrigen: true,
          });
        }

        // 3) Incrementar o crear stock en destino
        const stockDestino = await tx.stock.findFirst({
          where: { productoId, sucursalId: sucursalDestinoId },
        });

        let movimientoDestino: MovimientoParaAuditoria;

        if (stockDestino) {
          const cantidadAnterior = stockDestino.cantidad;
          const cantidadNueva = stockDestino.cantidad + cantidad;

          await tx.stock.update({
            where: { id: stockDestino.id },
            data: { cantidad: cantidadNueva },
          });

          movimientoDestino = {
            stockId: stockDestino.id,
            productoId,
            cantidadAnterior,
            cantidadNueva,
            sucursalId: sucursalDestinoId,
            esOrigen: false,
          };
        } else {
          const nuevoStock = await tx.stock.create({
            data: {
              productoId,
              sucursalId: sucursalDestinoId,
              cantidad,
              precioCosto: stockOrigenes[0].precioCosto,
              costoTotal: stockOrigenes[0].precioCosto * cantidad,
              fechaIngreso: new Date(),
            },
          });

          movimientoDestino = {
            stockId: nuevoStock.id,
            productoId,
            cantidadAnterior: 0,
            cantidadNueva: cantidad,
            sucursalId: sucursalDestinoId,
            esOrigen: false,
          };
        }

        // 4) Registrar la transferencia
        const transferencia = await tx.transferenciaProducto.create({
          data: {
            productoId,
            cantidad,
            sucursalOrigenId,
            sucursalDestinoId,
            usuarioEncargadoId,
            fechaTransferencia: new Date(),
          },
        });

        return {
          transferencia,
          movimientosOrigen,
          movimientoDestino,
        };
      });
      // ── Fin transacción ─────────────────────────────────────────────────

      transferenciaId = resultado.transferencia.id;
      movimientosParaAuditoria = [
        ...resultado.movimientosOrigen,
        resultado.movimientoDestino,
      ];

      this.logger.log(
        `Transferencia #${transferenciaId} realizada. ` +
          `productoId=${productoId} cantidad=${cantidad} ` +
          `origen=${sucursalOrigenId} destino=${sucursalDestinoId}`,
      );

      // AUDITORÍA — fuera de la tx
      await this.movimientoStock.registrarMuchos(
        movimientosParaAuditoria.map((m) => ({
          stockId: m.stockId,
          productoId: m.productoId,
          tipoMovimiento: TipoMovimientoStock.TRANSFERENCIA,
          cantidadAnterior: m.cantidadAnterior,
          cantidadNueva: m.cantidadNueva,
          usuarioId: usuarioEncargadoId,
          sucursalId: m.sucursalId,
          transferenciaId: transferenciaId,
          descripcion: m.esOrigen
            ? `Salida por transferencia a sucursal ${sucursalDestinoId}`
            : `Entrada por transferencia desde sucursal ${sucursalOrigenId}`,
          origenModulo: 'TransferenciaProductoService.transferirProducto',
        })),
      );

      return { message: 'Transferencia realizada con éxito' };
    } catch (error) {
      this.logger.error(
        `Error en transferencia: ${error?.message ?? error}`,
        error?.stack,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al realizar la transferencia',
      );
    }
  }

  // ─── READS / OTROS — sin cambios ─────────────────────────────────────────

  findAll() {
    return `This action returns all transferenciaProducto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transferenciaProducto`;
  }

  async findAllMytranslates(id: number) {
    try {
      return await this.prisma.transferenciaProducto.findMany({
        where: { sucursalOrigenId: id },
        include: {
          producto: true,
          usuarioEncargado: true,
          sucursalDestino: true,
          sucursalOrigen: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al conseguir registros');
    }
  }

  update(
    id: number,
    updateTransferenciaProductoDto: UpdateTransferenciaProductoDto,
  ) {
    return `This action updates a #${id} transferenciaProducto`;
  }

  remove(id: number) {
    return `This action removes a #${id} transferenciaProducto`;
  }

  async removeAll() {
    try {
      return await this.prisma.transferenciaProducto.deleteMany({});
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al eliminar transferencias',
      );
    }
  }
}
