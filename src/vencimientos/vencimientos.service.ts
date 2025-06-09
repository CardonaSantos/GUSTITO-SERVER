import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateVencimientoDto } from './dto/create-vencimiento.dto';
import { UpdateVencimientoDto } from './dto/update-vencimiento.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';

import * as dayjs from 'dayjs';
import 'dayjs/locale/es';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('es');

@Injectable()
export class VencimientosService {
  private readonly logger = new Logger(VencimientosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron('0 23 * * *', { timeZone: 'America/Guatemala' })
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCronVencimientos() {
    this.logger.log('Iniciando verificación de vencimientos de stock');

    const today = dayjs().tz('America/Guatemala').startOf('day');
    const deadline = today.add(10, 'day').endOf('day');

    const upcomingStocks = await this.getUpcomingStocks(today, deadline);
    if (upcomingStocks.length === 0) {
      this.logger.log('No hay stocks próximos a vencer');
      return;
    }

    const admins = await this.getAdminUsers();

    for (const stock of upcomingStocks) {
      await this.processStockVencimiento(stock, admins);
    }

    this.logger.log('Verificación de vencimientos completada');
  }

  /** Obtiene todos los stocks que vencen entre today y deadline, con cantidad > 0 */
  private async getUpcomingStocks(today: dayjs.Dayjs, deadline: dayjs.Dayjs) {
    return this.prisma.stock.findMany({
      where: {
        fechaVencimiento: {
          gte: today.toDate(),
          lte: deadline.toDate(),
        },
        cantidad: { gt: 0 },
      },
    });
  }

  /** Todos los usuarios de rol ADMIN activos */
  private async getAdminUsers() {
    return this.prisma.usuario.findMany({
      where: { rol: 'ADMIN', activo: true },
    });
  }

  /**
   * Para cada stock:
   *  1) Si ya existe un vencimiento, ignora.
   *  2) Si no, crea el registro en `vencimiento`.
   *  3) Envía notificación a cada admin (si no existe ya).
   */
  private async processStockVencimiento(
    stock: { id: number; productoId: number; fechaVencimiento: Date },
    admins: Array<{ id: number; nombre: string }>,
  ) {
    const existing = await this.prisma.vencimiento.findFirst({
      where: { stockId: stock.id },
    });
    if (existing) {
      this.logger.debug(`Vencimiento ya creado para stock ${stock.id}`);
      return;
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id: stock.productoId },
    });
    if (!producto) {
      this.logger.warn(
        `Producto ${stock.productoId} no encontrado, saltando stock ${stock.id}`,
      );
      return;
    }

    let fechasinFormato = dayjs(stock.fechaVencimiento);
    console.log('La fecha sin formato es: ', fechasinFormato);

    // const fechaFmt = dayjs(stock.fechaVencimiento).format();
    const fechaFmt = dayjs.utc(stock.fechaVencimiento).format('DD/MM/YYYY');

    const venc = await this.prisma.vencimiento.create({
      data: {
        stockId: stock.id,
        fechaVencimiento: stock.fechaVencimiento,
        descripcion: `El producto ${producto.nombre} vence el ${fechaFmt}.`,
        estado: 'PENDIENTE',
      },
    });
    this.logger.log(`Vencimiento #${venc.id} creado para stock ${stock.id}`);

    const mensaje = `El producto ${producto.nombre} tiene stock que vencerá el ${fechaFmt}.`;
    for (const admin of admins) {
      const alreadyNotified = await this.prisma.notificacion.findFirst({
        where: {
          referenciaId: stock.id,
          notificacionesUsuarios: { some: { usuarioId: admin.id } },
        },
      });
      if (alreadyNotified) {
        this.logger.debug(
          `Admin ${admin.id} ya notificado para stock ${stock.id}`,
        );
        continue;
      }
      await this.notificationService.createOneNotification(
        mensaje,
        null,
        admin.id,
        'VENCIMIENTO',
        stock.id,
      );
      this.logger.log(
        `Notificación enviada a admin ${admin.id} para stock ${stock.id}`,
      );
    }
  }

  @Cron('0 4 * * *', { timeZone: 'America/Guatemala' })
  // @Cron(CronExpression.EVERY_10_SECONDS) // o el cron que necesites
  async handleVencimientoHoy() {
    const guateNow = dayjs().tz('America/Guatemala');
    const startOfDayUtc = guateNow.startOf('day');
    const endOfDayUtc = guateNow.endOf('day');

    this.logger.log(
      `Buscando stocks con fechaVencimiento entre ${startOfDayUtc.toISOString()} y ${endOfDayUtc.toISOString()}`,
    );

    const recientesEntradas = await this.prisma.stock.findMany({
      select: {
        id: true,
        fechaIngreso: true,
        fechaVencimiento: true,
      },
    });

    console.log('Recientes entradas de stock:', recientesEntradas);

    const vencimientosHoy = await this.prisma.stock.findMany({
      where: {
        cantidad: { gt: 0 },
        fechaVencimiento: {
          gte: startOfDayUtc.toDate(),
          lte: endOfDayUtc.toDate(),
        },
      },
    });

    if (vencimientosHoy.length === 0) {
      this.logger.log('No hay stocks que vencen hoy');
      return;
    }

    this.logger.log(
      `Encontrados ${vencimientosHoy.length} stocks que vencen hoy`,
    );
    const admins = await this.getAdminUsers();

    for (const stock of vencimientosHoy) {
      const product = await this.prisma.producto.findUnique({
        where: { id: stock.productoId },
        select: { nombre: true },
      });

      const mensaje = `El producto ${product.nombre} tiene stock que vence hoy.`;

      for (const admin of admins) {
        await this.notificationService.createOneNotification(
          mensaje,
          null,
          admin.id,
          'VENCIMIENTO',
          stock.id,
        );
      }
    }

    this.logger.log('Verificación de vencimientos para hoy completada');
  }

  async findAll() {
    try {
      const registrosVencimiento = await this.prisma.vencimiento.findMany({
        orderBy: {
          fechaCreacion: 'desc',
        },
        include: {
          stock: {
            select: {
              sucursal: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
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
      return registrosVencimiento;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al conseguir registros');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} vencimiento`;
  }

  async update(id: number, updateVencimientoDto: UpdateVencimientoDto) {
    try {
      const vencimientoActualizado = await this.prisma.vencimiento.update({
        where: {
          id: id,
        },
        data: {
          estado: 'RESUELTO',
        },
      });
      return vencimientoActualizado;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al actualizar registro');
    }
  }

  async removeAll() {
    try {
      const regists = await this.prisma.vencimiento.deleteMany({});
      return regists;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar registros');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} vencimiento`;
  }
}
