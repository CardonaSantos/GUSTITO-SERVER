import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNewProductDto } from './dto/create-productNew.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProductDto: CreateNewProductDto) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1) Crear producto
        const newProduct = await prisma.producto.create({
          data: {
            precioCostoActual: createProductDto.precioCostoActual,
            codigoProducto: createProductDto.codigoProducto,
            nombre: createProductDto.nombre,
            descripcion: createProductDto.descripcion,
            categorias: createProductDto.categorias?.length
              ? {
                  connect: createProductDto.categorias.map((categoriaId) => ({
                    id: categoriaId,
                  })),
                }
              : undefined,
          },
        });

        // 2) Ordenar precios por orden (por si vienen desordenados)
        const preciosOrdenados = [...createProductDto.precioVenta].sort(
          (a, b) => a.orden - b.orden,
        );

        // 3) Crear precios de venta asociados
        const preciosCreados = await Promise.all(
          preciosOrdenados.map((precioItem) =>
            prisma.precioProducto.create({
              data: {
                producto: {
                  connect: { id: newProduct.id },
                },
                precio: precioItem.precio,
                orden: precioItem.orden, // 👈 usamos el orden del DTO
                estado: 'APROBADO',
                tipo: 'ESTANDAR',
                creadoPor: {
                  connect: {
                    id: createProductDto.creadoPorId,
                  },
                },
                fechaCreacion: new Date(),
              },
            }),
          ),
        );

        return { newProduct, preciosCreados };
      });

      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al crear el producto con precios',
      );
    }
  }

  async findAllProductsToSale(id: number) {
    try {
      const productos = await this.prisma.producto.findMany({
        include: {
          precios: true,
          stock: {
            where: {
              cantidad: {
                gt: 0, // Solo traer productos con stock disponible
              },
              sucursalId: id,
            },
            select: {
              id: true,
              cantidad: true,
              fechaIngreso: true,
              fechaVencimiento: true,
            },
          },
        },
      });

      return productos;
    } catch (error) {
      console.error('Error en findAll productos:', error); // Proporcionar más contexto en el error
      throw new InternalServerErrorException('Error al obtener los productos');
    }
  }

  async findAll() {
    try {
      const productos = await this.prisma.producto.findMany({
        include: {
          precios: {
            select: {
              id: true,
              precio: true,
              tipo: true,
              usado: true,
            },
          },
          categorias: {
            select: {
              id: true,
              nombre: true,
            },
          },
          stock: {
            include: {
              sucursal: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
              entregaStock: {
                include: {
                  proveedor: {
                    select: {
                      nombre: true, // Solo seleccionamos el nombre del proveedor
                    },
                  },
                },
              },
            },
            where: {
              cantidad: {
                gt: 0, // Solo traer productos con stock disponible
              },
            },
          },
        },
      });
      return productos;
    } catch (error) {
      console.error('Error en findAll productos:', error); // Proporcionar más contexto en el error
      throw new InternalServerErrorException('Error al obtener los productos');
    }
  }

  async findAllProductsToTransfer(id: number) {
    try {
      const productos = await this.prisma.producto.findMany({
        include: {
          stock: {
            where: {
              cantidad: {
                gt: 0, // Solo traer productos con stock disponible
              },
              sucursalId: id,
            },
          },
        },
      });
      return productos;
    } catch (error) {
      console.error('Error en findAll productos:', error); // Proporcionar más contexto en el error
      throw new InternalServerErrorException('Error al obtener los productos');
    }
  }

  async findAllProductsToStcok() {
    try {
      const productos = await this.prisma.producto.findMany({
        select: {
          id: true,
          nombre: true,
          codigoProducto: true,
        },
        orderBy: {
          actualizadoEn: 'desc',
        },
      });

      return productos;
    } catch (error) {
      console.error('Error en findAll productos:', error); // Proporcionar más contexto en el error
      throw new InternalServerErrorException('Error al obtener los productos');
    }
  }

  async productToEdit(id: number) {
    try {
      const product = await this.prisma.producto.findUnique({
        where: { id },
        include: {
          categorias: true,
          precios: {
            select: {
              id: true,
              precio: true,
              orden: true,
            },
            orderBy: {
              orden: 'asc',
            },
          },
        },
      });
      return product;
    } catch (error) {
      console.error('Error en productToEdit:', error);
      throw new InternalServerErrorException('Error al obtener el producto');
    }
  }

  async productHistorialPrecios() {
    try {
      const historialPrecios = await this.prisma.historialPrecioCosto.findMany({
        include: {
          modificadoPor: {
            select: {
              nombre: true,
              id: true,
              rol: true,
              sucursal: {
                // Debes hacer include aquí
                select: {
                  nombre: true,
                  id: true,
                  direccion: true,
                },
              },
            },
          },
          producto: true, // Suponiendo que deseas incluir todo el producto
        },
        orderBy: {
          fechaCambio: 'desc',
        },
      });
      return historialPrecios;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error');
    }
  }

  async productToWarranty() {
    try {
      const products = await this.prisma.producto.findMany({
        orderBy: {
          creadoEn: 'desc',
        },
      });
      return products;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar productos');
    }
  }

  async findOne(id: number) {
    try {
      const producto = await this.prisma.producto.findUnique({
        where: { id },
      });
      return producto;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar el producto');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    console.log('Los datos a usar son:', id, updateProductDto);

    const productoAnterior = await this.prisma.producto.findUnique({
      where: { id },
    });

    try {
      const productoUpdate = await this.prisma.producto.update({
        where: { id },
        data: {
          codigoProducto: updateProductDto.codigoProducto,
          nombre: updateProductDto.nombre,
          descripcion: updateProductDto.descripcion,
          precioCostoActual: Number(updateProductDto.precioCostoActual),
          categorias: {
            set: [],
            connect: updateProductDto.categorias?.map((categoriaId) => ({
              id: categoriaId,
            })),
          },
        },
        include: {
          categorias: true,
        },
      });

      // 🔹 Mantener los precios sincronizados: update / create / delete
      for (const price of updateProductDto.precios) {
        if (price.id) {
          if (price.eliminar) {
            // eliminar precio existente
            await this.prisma.precioProducto.delete({
              where: { id: price.id },
            });
          } else {
            // actualizar precio existente (precio + orden)
            await this.prisma.precioProducto.update({
              where: { id: price.id },
              data: {
                precio: price.precio,
                orden: price.orden,
              },
            });
          }
        } else if (!price.eliminar) {
          // crear nuevo precio
          await this.prisma.precioProducto.create({
            data: {
              estado: 'APROBADO',
              precio: price.precio,
              orden: price.orden,
              creadoPorId: updateProductDto.usuarioId,
              productoId: productoUpdate.id,
              tipo: 'ESTANDAR',
            },
          });
        }
      }

      // 🔹 Historial de cambio de costo
      if (productoAnterior && productoUpdate) {
        if (
          Number(productoAnterior.precioCostoActual) !==
          Number(productoUpdate.precioCostoActual)
        ) {
          await this.prisma.historialPrecioCosto.create({
            data: {
              productoId: productoAnterior.id,
              precioCostoAnterior: Number(productoAnterior.precioCostoActual),
              precioCostoNuevo: Number(productoUpdate.precioCostoActual),
              modificadoPorId: updateProductDto.usuarioId,
            },
          });
        }
      }

      console.log('El producto editado es: ', productoUpdate);
      return productoUpdate;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: number) {
    try {
      const producto = await this.prisma.producto.delete({
        where: { id },
      });
      return producto;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }

  async removeAll() {
    try {
      const productos = await this.prisma.producto.deleteMany({});
      return productos;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar los productos');
    }
  }

  async productToCredit() {
    try {
      const products = await this.prisma.producto.findMany({
        select: {
          id: true,
          nombre: true,
          codigoProducto: true,
        },
      });
      return products;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al conseguir datos de los productos',
      );
    }
  }
}
