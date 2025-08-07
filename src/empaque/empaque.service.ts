import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmpaqueDto } from './dto/create-empaque.dto';
import { UpdateEmpaqueDto } from './dto/update-empaque.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Stock } from 'src/stock/entities/stock.entity';

@Injectable()
export class EmpaqueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmpaqueDto: CreateEmpaqueDto) {
    return await this.prisma.empaque.create({
      data: {
        nombre: createEmpaqueDto.nombre,
        codigoProducto: createEmpaqueDto.codigoProducto,
        descripcion: createEmpaqueDto.descripcion,
        precioCosto: createEmpaqueDto.precioCosto,
        precioVenta: createEmpaqueDto.precioVenta,
      },
    });
  }

  async findAll() {
    const empaques = await this.prisma.empaque.findMany({
      where: {
        isDeleted: false,
      },

      include: {
        stock: {
          where: {
            cantidad: {
              gt: 0, //greaten than > mayo que cero, no quiero esos xD
            },
          },
          include: {
            sucursal: true,
          },
        },
      },
    });

    if (!empaques) {
      throw new NotFoundException(`Empaques no encontrados.`);
    }

    return empaques.map((empaque) => ({
      id: empaque.id,
      nombre: empaque.nombre,
      descripcion: empaque.descripcion,
      codigoProducto: empaque.codigoProducto,
      precioCosto: empaque.precioCosto,
      precioVenta: empaque.precioVenta,
      stock: empaque.stock.map((stock) => ({
        id: stock.id,
        cantidad: stock.cantidad,
        fechaIngreso: stock.fechaIngreso,
        sucursal: {
          id: stock.sucursal.id,
          nombre: stock.sucursal.nombre,
        },
      })),
    }));
  }

  async fin_empaques_stock() {
    const empaques = await this.prisma.empaque.findMany({
      include: {
        stock: {
          where: {
            cantidad: {
              gt: 0, //greaten than > mayo que cero, no quiero esos xD
            },
          },
          include: {
            sucursal: true,
          },
        },
      },
    });

    if (!empaques) {
      throw new NotFoundException(`Empaques no encontrados.`);
    }

    const orders = empaques.sort((a, b) => {
      let a2 =
        a.stock.reduce((acc, stock) => acc + stock.cantidad, 0) -
        b.stock.reduce((acc, stock) => acc + stock.cantidad, 0);
      return a2;
    });

    return orders.map((empaque) => ({
      id: empaque.id,
      nombre: empaque.nombre,
      descripcion: empaque.descripcion,
      codigoProducto: empaque.codigoProducto,
      stock: empaque.stock.map((stock) => ({
        id: stock.id,
        cantidad: stock.cantidad,
        fechaIngreso: stock.fechaIngreso,
        sucursal: {
          id: stock.sucursal.id,
          nombre: stock.sucursal.nombre,
        },
      })),
    }));
  }

  async findOne(id: number) {
    const empaque = await this.prisma.empaque.findUnique({
      where: { id },
    });
    if (!empaque) {
      throw new NotFoundException(`Empaque con id ${id} no encontrado.`);
    }
    return empaque;
  }

  async update(id: number, updateEmpaqueDto: UpdateEmpaqueDto) {
    const empaque = await this.prisma.empaque.findUnique({
      where: { id },
    });
    if (!empaque) {
      throw new NotFoundException(`Empaque con id ${id} no encontrado.`);
    }
    return await this.prisma.empaque.update({
      where: { id },
      data: updateEmpaqueDto,
    });
  }

  async markAsDeletedEmpaque(empaqueID: number) {
    try {
      if (!empaqueID) {
        throw new BadRequestException({
          message: 'ID no proporcionado',
        });
      }

      const empaqueToMarkAsDeleted = await this.prisma.empaque.update({
        where: {
          id: empaqueID,
        },
        data: {
          isDeleted: true,
        },
      });
      return empaqueToMarkAsDeleted;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'Fatal error: Error inesperado',
      });
    }
  }

  async remove(id: number) {
    // const empaque = await this.prisma.empaque.findUnique({
    //   where: { id },
    // });
    // if (!empaque) {
    //   throw new NotFoundException(`Empaque con id ${id} no encontrado.`);
    // }
    // return await this.prisma.empaque.delete({
    //   where: { id },
    // });
  }
}
