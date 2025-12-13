import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreatePriceRequestDto } from './dto/create-price-request.dto';
import { UpdatePriceRequestDto } from './dto/update-price-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PriceRequestService {
  private readonly logger = new Logger(PriceRequestService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}
  //
  async create(createPriceRequestDto: CreatePriceRequestDto) {
    try {
      const nuevaSolicitud = await this.prisma.solicitudPrecio.create({
        data: {
          precioSolicitado: createPriceRequestDto.precioSolicitado,
          aprobadoPorId: createPriceRequestDto.aprobadoPorId,
          productoId: createPriceRequestDto.productoId,
          estado: 'PENDIENTE',
          solicitadoPorId: createPriceRequestDto.solicitadoPorId,
        },
      });

      const admins = await this.prisma.usuario.findMany({
        where: { rol: 'ADMIN' },
      });

      const productoDetalles = await this.prisma.producto.findUnique({
        where: { id: nuevaSolicitud.productoId },
      });

      const user = await this.prisma.usuario.findUnique({
        where: { id: nuevaSolicitud.solicitadoPorId },
      });

      // Extraemos los IDs de los administradores para pasarlos al servicio de notificación
      const adminIds = admins.map((admin) => admin.id);

      await this.notificationService.create(
        `El usuario ${user.nombre} ha solicitado un precio especial de Q${nuevaSolicitud.precioSolicitado} para el producto "${productoDetalles.nombre}".`,
        nuevaSolicitud.solicitadoPorId,
        adminIds, // Pasamos todos los admin IDs aquí
        'SOLICITUD_PRECIO',
      );

      const solicitudDetalles = await this.prisma.solicitudPrecio.findUnique({
        where: {
          id: nuevaSolicitud.id,
        },
        include: {
          producto: true,
          solicitadoPor: {
            select: {
              nombre: true,
              id: true,
              rol: true,
              sucursal: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      });

      await Promise.all(
        admins.map((admin) =>
          this.notificationService.enviarNotificarSolicitud(
            solicitudDetalles,
            admin.id,
          ),
        ),
      );

      console.log('La nueva solicitud de precio es: ', nuevaSolicitud);
      return nuevaSolicitud;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al crear registro y enviar notificaciones',
      );
    }
  }

  async acceptPriceRequest(idSolicitud: number, idUser: number) {
    const logger = new Logger('PriceRequestService');

    try {
      // 1) Transacción DB (igual que tu versión que sí emitía)
      const result = await this.prisma.$transaction(async (tx) => {
        // A) Traer solicitud PENDIENTE
        const solicitud = await tx.solicitudPrecio.findFirst({
          where: {
            id: idSolicitud,
            estado: 'PENDIENTE',
          },
          select: {
            id: true,
            productoId: true,
            precioSolicitado: true,
            solicitadoPorId: true,
          },
        });

        if (!solicitud) {
          throw new BadRequestException(
            'Solicitud no encontrada o ya procesada',
          );
        }

        // B) CALCULAR ORDEN: MAX(orden) + 1  ✅ (nunca negativo)
        //    Si no hay precios o todos tienen orden null -> toma 0 y queda 1
        const maxOrdenAgg = await tx.precioProducto.aggregate({
          where: { productoId: solicitud.productoId },
          _max: { orden: true },
        });

        const maxOrden = maxOrdenAgg._max.orden ?? 0;
        const nextOrden = maxOrden + 1;

        logger.log(
          `[acceptPriceRequest] productoId=${solicitud.productoId} maxOrden=${maxOrden} nextOrden=${nextOrden}`,
        );

        // C) Marcar solicitud como APROBADO
        const solicitudAprobada = await tx.solicitudPrecio.update({
          where: { id: solicitud.id },
          data: {
            estado: 'APROBADO',
            fechaRespuesta: new Date(),
            aprobadoPorId: idUser,
          },
        });

        // D) Crear precio con orden correcto
        const nuevoPrecio = await tx.precioProducto.create({
          data: {
            estado: 'APROBADO',
            precio: solicitudAprobada.precioSolicitado,
            creadoPorId: idUser,
            productoId: solicitudAprobada.productoId,
            tipo: 'CREADO_POR_SOLICITUD',
            orden: nextOrden, // ✅ 1,2,3 -> 4
          },
        });

        // E) Borrar solicitud (igual que tu versión “sí socket”)
        await tx.solicitudPrecio.delete({
          where: { id: solicitudAprobada.id },
        });

        return { solicitudAprobada, nuevoPrecio };
      });

      // 2) Notificación / socket (igual que tu versión “sí socket”)
      //    IMPORTANTE: dejamos logs antes/después para confirmar que se ejecuta.
      try {
        const producto = await this.prisma.producto.findUnique({
          where: { id: result.solicitudAprobada.productoId },
          select: { nombre: true },
        });

        logger.log(
          `[acceptPriceRequest] creando notificación para solicitadoPorId=${result.solicitudAprobada.solicitadoPorId}`,
        );

        const notif = await this.notificationService.createOneNotification(
          `Un administrador ha aceptado tu solicitud de precio para el producto "${producto?.nombre ?? ''}"`,
          idUser, // emisor
          result.solicitudAprobada.solicitadoPorId, // receptor (quien solicitó)
          'SOLICITUD_PRECIO',
        );

        logger.log(
          `[acceptPriceRequest] notificación creada id=${(notif as any)?.id ?? 'N/A'} (socket debería emitirse aquí)`,
        );
      } catch (notifyErr) {
        // Si aquí truena, el socket no va a salir: esto lo deja CLARÍSIMO en logs
        logger.error(
          `[acceptPriceRequest] Error enviando notificación/socket: ${notifyErr?.message ?? notifyErr}`,
          notifyErr?.stack,
        );
      }

      return result;
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar la solicitud de precio',
      );
    }
  }

  async rejectRequesPrice(idSolicitud: number, idUser: number) {
    try {
      // Eliminar la solicitud
      const solicitudEliminada = await this.prisma.solicitudPrecio.delete({
        where: { id: idSolicitud },
      });

      const producto = await this.prisma.producto.findUnique({
        where: {
          id: solicitudEliminada.productoId,
        },
      });

      if (solicitudEliminada) {
        // Crear la notificación de rechazo
        const notificacionRechazo =
          await this.notificationService.createOneNotification(
            `Un administrador ha rechazado tu solicitud de precio para el producto "${producto.nombre}"`,
            idUser,
            solicitudEliminada.solicitadoPorId,
            'SOLICITUD_PRECIO',
          );
        console.log('Notificación de rechazo creada:', notificacionRechazo);
      }

      return solicitudEliminada;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al rechazar la solicitud');
    }
  }

  async findAll() {
    try {
      const solicitudesDePrecio = await this.prisma.solicitudPrecio.findMany({
        include: {
          producto: true,
          solicitadoPor: {
            select: {
              nombre: true,
              id: true,
              rol: true,
              sucursal: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      });
      return solicitudesDePrecio;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Err');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} priceRequest`;
  }

  update(id: number, updatePriceRequestDto: UpdatePriceRequestDto) {
    return `This action updates a #${id} priceRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} priceRequest`;
  }

  async allremove() {
    return await this.prisma.solicitudPrecio.deleteMany({});
  }
}
