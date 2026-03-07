import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAjusteStockDto } from './dto/create-ajuste-stock.dto';
import { UpdateAjusteStockDto } from './dto/update-ajuste-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoAjuste, TipoMovimientoStock } from '@prisma/client';
import { UpdateAjusteStockEmpaqueDto } from './dto/update-ajust-stock-empaque.dto';
import { MovimientoStockService } from 'src/registrar-movimiento/registrar-movimiento.service';

@Injectable()
export class AjusteStockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly movimientoStock: MovimientoStockService, // ← inyectado
  ) {}

  create(createAjusteStockDto: CreateAjusteStockDto) {
    return 'This action adds a new ajusteStock';
  }

  findAll() {
    return `This action returns all ajusteStock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ajusteStock`;
  }

  // ==========================
  // AJUSTE — PRODUCTO
  // ==========================
  async update(id: number, updateAjusteStockDto: UpdateAjusteStockDto) {
    try {
      // Leemos ANTES para tener cantidadAnterior
      const stockToUpdate = await this.prisma.stock.findUnique({
        where: { id },
      });

      if (!stockToUpdate) {
        throw new InternalServerErrorException('Stock no encontrado');
      }

      const {
        cantidad,
        costoTotal,
        fechaIngreso,
        fechaVencimiento,
        cantidadAjustada,
        descripcion,
        productoId,
        usuarioId,
      } = updateAjusteStockDto;

      // Determinar tipo de ajuste
      let tipoAjuste: TipoAjuste;
      if (cantidadAjustada > stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.INCREMENTO;
      } else if (cantidadAjustada < stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.DECREMENTO;
      } else {
        tipoAjuste = TipoAjuste.CORRECCION;
      }

      // 1) Actualizar stock
      const stockUpdated = await this.prisma.stock.update({
        where: { id },
        data: {
          cantidad,
          costoTotal,
          fechaIngreso: new Date(fechaIngreso),
          fechaVencimiento: fechaVencimiento
            ? new Date(fechaVencimiento)
            : null,
        },
      });

      // 2) Crear registro de ajuste
      const ajusteCreado = await this.prisma.ajusteStock.create({
        data: {
          productoId,
          stockId: stockUpdated.id,
          cantidadAjustada,
          tipoAjuste,
          fechaHora: new Date(),
          usuarioId,
          descripcion: descripcion || 'Ajuste sin descripción',
        },
      });

      // 3) AUDITORÍA — después de todo, nunca dentro de una tx
      // Mapeamos TipoAjuste → TipoMovimientoStock para consistencia
      const tipoMovimiento =
        tipoAjuste === TipoAjuste.INCREMENTO
          ? TipoMovimientoStock.AJUSTE_MANUAL
          : tipoAjuste === TipoAjuste.DECREMENTO
            ? TipoMovimientoStock.AJUSTE_MANUAL
            : TipoMovimientoStock.CORRECCION;

      await this.movimientoStock.registrar({
        stockId: stockUpdated.id,
        productoId: productoId,
        tipoMovimiento,
        cantidadAnterior: stockToUpdate.cantidad, // valor real ANTES del update
        cantidadNueva: cantidad, // valor que quedó en DB
        usuarioId: usuarioId,
        sucursalId: stockToUpdate.sucursalId,
        ajusteStockId: ajusteCreado.id,
        descripcion: descripcion || 'Ajuste sin descripción',
        origenModulo: 'AjusteStockService.update',
      });

      return {
        message: 'Stock actualizado y registro de ajuste creado correctamente',
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al actualizar el stock y registrar el ajuste',
      );
    }
  }

  // ==========================
  // AJUSTE — EMPAQUE
  // ==========================
  async updateEmpaqueStock(
    id: number,
    updateAjusteStockDto: UpdateAjusteStockEmpaqueDto,
  ) {
    try {
      // Leemos ANTES para tener cantidadAnterior
      const stockToUpdate = await this.prisma.stock.findUnique({
        where: { id },
      });

      if (!stockToUpdate) {
        throw new InternalServerErrorException('Stock no encontrado');
      }

      const {
        cantidad,
        costoTotal,
        fechaIngreso,
        fechaVencimiento,
        cantidadAjustada,
        descripcion,
        usuarioId,
        empaqueId,
      } = updateAjusteStockDto;

      // Determinar tipo de ajuste
      let tipoAjuste: TipoAjuste;
      if (cantidadAjustada > stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.INCREMENTO;
      } else if (cantidadAjustada < stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.DECREMENTO;
      } else {
        tipoAjuste = TipoAjuste.CORRECCION;
      }

      // 1) Actualizar stock
      const stockUpdated = await this.prisma.stock.update({
        where: { id },
        data: {
          cantidad,
          costoTotal,
          fechaIngreso: new Date(fechaIngreso),
          fechaVencimiento: fechaVencimiento
            ? new Date(fechaVencimiento)
            : null,
        },
      });

      // 2) Crear registro de ajuste
      const ajusteCreado = await this.prisma.ajusteStock.create({
        data: {
          empaqueId,
          stockId: stockUpdated.id,
          cantidadAjustada,
          tipoAjuste,
          fechaHora: new Date(),
          usuarioId,
          descripcion: descripcion || 'Ajuste sin descripción',
        },
      });

      // 3) AUDITORÍA
      const tipoMovimiento =
        tipoAjuste === TipoAjuste.INCREMENTO
          ? TipoMovimientoStock.AJUSTE_MANUAL
          : tipoAjuste === TipoAjuste.DECREMENTO
            ? TipoMovimientoStock.AJUSTE_MANUAL
            : TipoMovimientoStock.CORRECCION;

      await this.movimientoStock.registrar({
        stockId: stockUpdated.id,
        empaqueId: empaqueId,
        tipoMovimiento,
        cantidadAnterior: stockToUpdate.cantidad,
        cantidadNueva: cantidad,
        usuarioId: usuarioId,
        sucursalId: stockToUpdate.sucursalId,
        ajusteStockId: ajusteCreado.id,
        descripcion: descripcion || 'Ajuste sin descripción',
        origenModulo: 'AjusteStockService.updateEmpaqueStock',
      });

      return {
        message: 'Stock actualizado y registro de ajuste creado correctamente',
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al actualizar el stock y registrar el ajuste',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} ajusteStock`;
  }
}
