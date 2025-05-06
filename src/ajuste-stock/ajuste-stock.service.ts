import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAjusteStockDto } from './dto/create-ajuste-stock.dto';
import { UpdateAjusteStockDto } from './dto/update-ajuste-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoAjuste } from '@prisma/client';
import { UpdateAjusteStockEmpaqueDto } from './dto/update-ajust-stock-empaque.dto';

@Injectable()
export class AjusteStockService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAjusteStockDto: CreateAjusteStockDto) {
    return 'This action adds a new ajusteStock';
  }

  // async editStock (){
  //   try {
  //     const nuevoRegistroCambio = await this.prisma.ajusteStock.create({
  //       data: {

  //       }
  //     })
  //   } catch (error) {

  //   }
  // }

  // id               Int      @id @default(autoincrement())
  // producto         Producto @relation(fields: [productoId], references: [id])
  // productoId       Int
  // stock            Stock?   @relation(fields: [stockId], references: [id]) // Relación opcional al stock
  // stockId          Int?     // Campo opcional para identificar el stock modificado
  // cantidadAjustada Int
  // tipoAjuste       TipoAjuste
  // fechaHora        DateTime @default(now())
  // usuario          Usuario?  @relation(fields: [usuarioId], references: [id])
  // usuarioId        Int?
  // descripcion      String?  // Campo opcional para el motivo del ajuste

  findAll() {
    return `This action returns all ajusteStock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ajusteStock`;
  }

  async update(id: number, updateAjusteStockDto: UpdateAjusteStockDto) {
    try {
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

      // Determinar el tipo de ajuste según la cantidad
      let tipoAjuste: TipoAjuste;
      if (cantidadAjustada > stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.INCREMENTO;
      } else if (cantidadAjustada < stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.DECREMENTO;
      } else {
        tipoAjuste = TipoAjuste.CORRECCION;
      }

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

      await this.prisma.ajusteStock.create({
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

  async updateEmpaqueStock(
    id: number,
    updateAjusteStockDto: UpdateAjusteStockEmpaqueDto,
  ) {
    try {
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

      // Determinar el tipo de ajuste según la cantidad
      let tipoAjuste: TipoAjuste;
      if (cantidadAjustada > stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.INCREMENTO;
      } else if (cantidadAjustada < stockToUpdate.cantidad) {
        tipoAjuste = TipoAjuste.DECREMENTO;
      } else {
        tipoAjuste = TipoAjuste.CORRECCION;
      }

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

      await this.prisma.ajusteStock.create({
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
