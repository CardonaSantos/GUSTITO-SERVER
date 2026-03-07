import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateSolicitudTransferenciaProductoDto } from './dto/create-solicitud-transferencia-producto.dto';
import { UpdateSolicitudTransferenciaProductoDto } from './dto/update-solicitud-transferencia-producto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferenciaProductoService } from 'src/transferencia-producto/transferencia-producto.service';
import { NotificationService } from 'src/notification/notification.service';
import { WebsocketGateway } from 'src/web-sockets/websocket.gateway';

@Injectable()
export class SolicitudTransferenciaProductoService {
  private readonly logger = new Logger(
    SolicitudTransferenciaProductoService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly transferenciaProductoService: TransferenciaProductoService,
    private readonly notificationService: NotificationService,
    private readonly webSocketGateway: WebsocketGateway,
  ) {}

  // ─── CREAR SOLICITUD ──────────────────────────────────────────────────────
  // Sin cambios de lógica — solo notificaciones, no toca stock

  async create(
    createSolicitudTransferenciaProductoDto: CreateSolicitudTransferenciaProductoDto,
  ) {
    try {
      const nuevaSolicitud =
        await this.prisma.solicitudTransferenciaProducto.create({
          data: {
            cantidad: createSolicitudTransferenciaProductoDto.cantidad,
            estado: 'PENDIENTE',
            productoId: createSolicitudTransferenciaProductoDto.productoId,
            sucursalOrigenId:
              createSolicitudTransferenciaProductoDto.sucursalOrigenId,
            sucursalDestinoId:
              createSolicitudTransferenciaProductoDto.sucursalDestinoId,
            usuarioSolicitanteId:
              createSolicitudTransferenciaProductoDto.usuarioSolicitanteId,
          },
        });

      const [admins, user, product, sucursalOrigen, sucursalDestino] =
        await Promise.all([
          this.prisma.usuario.findMany({ where: { rol: 'ADMIN' } }),
          this.prisma.usuario.findUnique({
            where: {
              id: createSolicitudTransferenciaProductoDto.usuarioSolicitanteId,
            },
          }),
          this.prisma.producto.findUnique({
            where: { id: createSolicitudTransferenciaProductoDto.productoId },
          }),
          this.prisma.sucursal.findUnique({
            where: {
              id: createSolicitudTransferenciaProductoDto.sucursalOrigenId,
            },
          }),
          this.prisma.sucursal.findUnique({
            where: {
              id: createSolicitudTransferenciaProductoDto.sucursalDestinoId,
            },
          }),
        ]);

      const mensaje =
        `El usuario ${user.nombre} ha solicitado una transferencia del producto ` +
        `"${product.nombre}" desde "${sucursalOrigen.nombre}" hacia "${sucursalDestino.nombre}" ` +
        `de un total de ${createSolicitudTransferenciaProductoDto.cantidad} unidades.`;

      const solicitudDetalles =
        await this.prisma.solicitudTransferenciaProducto.findUnique({
          where: { id: nuevaSolicitud.id },
          include: {
            producto: { select: { nombre: true } },
            sucursalOrigen: { select: { nombre: true } },
            sucursalDestino: { select: { nombre: true } },
            usuarioSolicitante: { select: { nombre: true, rol: true } },
          },
        });

      await Promise.all(
        admins.map(async (admin) => {
          await this.notificationService.create(
            mensaje,
            createSolicitudTransferenciaProductoDto.usuarioSolicitanteId,
            [admin.id],
            'TRANSFERENCIA',
            solicitudDetalles.id,
          );
          this.webSocketGateway.handleEnviarSolicitudTransferencia(
            solicitudDetalles,
            admin.id,
          );
        }),
      );

      return nuevaSolicitud;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al crear la solicitud de transferencia',
      );
    }
  }

  // ─── APROBAR SOLICITUD ────────────────────────────────────────────────────
  // 🔴 FIX: antes llamaba this.transferirProducto() — su propio método duplicado
  // sin transacción. Ahora delega a this.transferenciaProductoService.transferirProducto()
  // que ya tiene: $transaction + auditoría de MovimientoStock incluida.

  async createTransferencia(idSolicitudTransferencia: number, userID: number) {
    try {
      const solicitud =
        await this.prisma.solicitudTransferenciaProducto.findUnique({
          where: { id: idSolicitudTransferencia },
          include: {
            producto: { select: { nombre: true } },
            sucursalOrigen: { select: { nombre: true } },
            sucursalDestino: { select: { nombre: true } },
            usuarioSolicitante: { select: { id: true, nombre: true } },
          },
        });

      if (!solicitud) {
        throw new BadRequestException(
          'Solicitud de transferencia no encontrada',
        );
      }

      // ✅ Delega al servicio ya corregido — con $transaction y auditoría incluida
      const transferencia =
        await this.transferenciaProductoService.transferirProducto({
          productoId: solicitud.productoId,
          cantidad: solicitud.cantidad,
          sucursalOrigenId: solicitud.sucursalOrigenId,
          sucursalDestinoId: solicitud.sucursalDestinoId,
          usuarioEncargadoId: userID,
        });

      // Notificar al solicitante
      const product = await this.prisma.producto.findUnique({
        where: { id: solicitud.productoId },
      });

      await this.notificationService.createOneNotification(
        `Un administrador aceptó tu solicitud de transferencia para el producto "${product.nombre}".`,
        userID,
        solicitud.usuarioSolicitante.id,
        'TRANSFERENCIA',
        idSolicitudTransferencia,
      );

      // Eliminar la solicitud aprobada
      await this.prisma.solicitudTransferenciaProducto.delete({
        where: { id: idSolicitudTransferencia },
      });

      this.logger.log(
        `Solicitud #${idSolicitudTransferencia} aprobada por usuario ${userID}`,
      );

      return {
        message:
          'Transferencia realizada, solicitud eliminada y notificación enviada con éxito',
        transferencia,
      };
    } catch (error) {
      this.logger.error(
        `Error al aprobar transferencia: ${error?.message ?? error}`,
        error?.stack,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Error al aceptar la transferencia: ${error.message}`,
      );
    }
  }

  // ─── RECHAZAR SOLICITUD ───────────────────────────────────────────────────
  // Sin cambios — no toca stock

  async rechazarTransferencia(
    idSolicitudTransferencia: number,
    userID: number,
  ) {
    try {
      const solicitudEliminada =
        await this.prisma.solicitudTransferenciaProducto.delete({
          where: { id: idSolicitudTransferencia },
        });

      const product = await this.prisma.producto.findUnique({
        where: { id: solicitudEliminada.productoId },
      });

      await this.notificationService.createOneNotification(
        `Un administrador rechazó tu solicitud de transferencia para el producto "${product.nombre}"`,
        userID,
        solicitudEliminada.usuarioSolicitanteId,
        'TRANSFERENCIA',
      );
    } catch (error) {
      this.logger.error(
        `Error al rechazar transferencia: ${error?.message ?? error}`,
        error?.stack,
      );
      throw new InternalServerErrorException(
        `Error al rechazar la transferencia: ${error.message}`,
      );
    }
  }

  // ─── READS ────────────────────────────────────────────────────────────────

  async findAll() {
    try {
      return await this.prisma.solicitudTransferenciaProducto.findMany({
        include: {
          producto: { select: { nombre: true } },
          sucursalOrigen: { select: { nombre: true } },
          sucursalDestino: { select: { nombre: true } },
          usuarioSolicitante: { select: { nombre: true, rol: true } },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al encontrar las solicitudes de transferencia',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudTransferenciaProducto`;
  }

  update(
    id: number,
    updateSolicitudTransferenciaProductoDto: UpdateSolicitudTransferenciaProductoDto,
  ) {
    return `This action updates a #${id} solicitudTransferenciaProducto`;
  }

  async removeAll() {
    return this.prisma.solicitudTransferenciaProducto.deleteMany({});
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudTransferenciaProducto`;
  }
}
