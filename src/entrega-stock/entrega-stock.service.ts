import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEntregaStockDto } from './dto/create-entrega-stock.dto';
import { UpdateEntregaStockDto } from './dto/update-entrega-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EntregaStockService {
  ///

  constructor(private readonly prisma: PrismaService) {}

  async create(createEntregaStockDto: CreateEntregaStockDto) {
    try {
      const entregaStock = await this.prisma.entregaStock.create({
        data: {
          proveedorId: createEntregaStockDto.proveedorId,
          montoTotal: createEntregaStockDto.montoTotal,
          fechaEntrega: createEntregaStockDto.fechaEntrega,
          recibidoPorId: createEntregaStockDto.recibidoPorId,
          stockEntregado: {
            create: createEntregaStockDto.stockEntregado.map((stock) => ({
              productoId: stock.productoId,
              cantidad: stock.cantidad,
              costoTotal: stock.precioCosto * stock.cantidad,
              fechaIngreso: new Date(),
              precioCosto: stock.precioCosto,
              fechaVencimiento: stock.fechaVencimiento || null, // Manejar fecha opcional

              producto: {
                connect: {
                  id: stock.productoId,
                },
              },
              sucursal: {
                connect: {
                  id: createEntregaStockDto.sucursalId,
                },
              },
            })),
          },
        },
      });
      return entregaStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al crear la entrega de stock',
      );
    }
  }

  async findAll() {
    try {
      const entregasStock = await this.prisma.entregaStock.findMany({});
      return entregasStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al obtener las entregas de stock',
      );
    }
  }

  async findAllEntregasStock(id: number) {
    try {
      const entregasStock = await this.prisma.entregaStock.findMany({});
      return entregasStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al obtener las entregas de stock',
      );
    }
  }

  async findAllEntregasStockBySucursal(sucursalId: number) {
    try {
      const entregasStock = await this.prisma.entregaStock.findMany({
        where: {
          sucursalId: sucursalId,
        },
        include: {
          proveedor: true, // Incluye información adicional si es necesario
        },
      });
      return entregasStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al obtener las entregas de stock',
      );
    }
  }

  // async findAllDeliveryStock(sucursalId: number) {
  //   try {
  //     const deliveryStocks = await this.prisma.entregaStock.findMany({
  //       where: {
  //         id: sucursalId,
  //       },
  //       include: {
  //         proveedor: {
  //           select: {
  //             id: true,
  //             nombre: true,
  //             correo: true,
  //             telefono: true,
  //           },
  //         },
  //         usuarioRecibido: {
  //           select: {
  //             id: true,
  //             nombre: true,
  //             rol: true,
  //           },
  //         },
  //         stockEntregado: true,
  //         sucursal: {
  //           select: {
  //             nombre: true,
  //             id: true,
  //             direccion: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!deliveryStocks) {
  //       throw new NotFoundException(
  //         'Error al encontrar los registros de stock',
  //       );
  //     }

  //     return deliveryStocks;
  //   } catch (error) {
  //     console.error(error);
  //     throw new InternalServerErrorException(
  //       'Error al obtener las entregas de stock',
  //     );
  //   }
  // }

  async findAllDeliveryStock(sucursalId: number) {
    try {
      const deliveryStocks = await this.prisma.entregaStock.findMany({
        where: {
          sucursalId: sucursalId,
        },
        include: {
          proveedor: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              telefono: true,
            },
          },
          usuarioRecibido: {
            select: {
              id: true,
              nombre: true,
              rol: true,
            },
          },
          stockEntregado: {
            include: {
              producto: {
                select: {
                  nombre: true,
                  codigoProducto: true,
                },
              },
              empaque: {
                select: {
                  nombre: true,
                  codigoProducto: true,
                },
              },
              sucursal: {
                select: {
                  nombre: true,
                  direccion: true,
                },
              },
            },
          },
          sucursal: {
            select: {
              nombre: true,
              id: true,
              direccion: true,
            },
          },
        },
        orderBy: {
          fechaEntrega: 'desc',
        },
      });

      // 🔁 Transformar estructura para facilitar uso en el frontend
      const formatted = deliveryStocks.map((entrega) => ({
        ...entrega,
        stockEntregado: entrega.stockEntregado.map((item) => {
          const tipoItem = item.producto
            ? 'producto'
            : item.empaque
              ? 'empaque'
              : 'desconocido';

          const detalleItem = item.producto ||
            item.empaque || { nombre: 'Desconocido' };

          return {
            ...item,
            tipoItem,
            detalleItem,
          };
        }),
      }));

      return formatted;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al obtener las entregas de stock',
      );
    }
  }

  async findOne(id: number) {
    try {
      const entregaStock = await this.prisma.entregaStock.findUnique({
        where: { id },
      });
      if (!entregaStock) {
        throw new NotFoundException(
          `Entrega de stock con ID ${id} no encontrada`,
        );
      }
      return entregaStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al encontrar la entrega de stock',
      );
    }
  }

  async update(id: number, updateEntregaStockDto: UpdateEntregaStockDto) {
    try {
      const entregaStock = await this.prisma.entregaStock.update({
        where: { id },
        data: {
          fechaEntrega: updateEntregaStockDto.fechaEntrega,
          montoTotal: updateEntregaStockDto.montoTotal,
          proveedor: {
            connect: {
              id: updateEntregaStockDto.proveedorId,
            },
          },
        },
      });
      if (!entregaStock) {
        throw new NotFoundException(
          `Entrega de stock con ID ${id} no encontrada`,
        );
      }
      return entregaStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al actualizar la entrega de stock',
      );
    }
  }

  async removeAll() {
    try {
      const entregasStock = await this.prisma.entregaStock.deleteMany({});
      return entregasStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al eliminar las entregas de stock',
      );
    }
  }

  async remove(id: number) {
    try {
      const entregaStock = await this.prisma.entregaStock.delete({
        where: { id },
      });
      if (!entregaStock) {
        throw new NotFoundException(
          `Entrega de stock con ID ${id} no encontrada`,
        );
      }
      return entregaStock;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al eliminar la entrega de stock',
      );
    }
  }
}
