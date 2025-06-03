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
        // Crear el producto
        const newProduct = await prisma.producto.create({
          data: {
            precioCostoActual: createProductDto.precioCostoActual,
            codigoProducto: createProductDto.codigoProducto,
            nombre: createProductDto.nombre,
            descripcion: createProductDto.descripcion,
            categorias: {
              connect: createProductDto.categorias?.map((categoriaId) => ({
                id: categoriaId,
              })),
            },
          },
        });

        // Crear precios de venta asociados al producto
        const preciosCreados = await Promise.all(
          createProductDto.precioVenta.map((precio) =>
            prisma.precioProducto.create({
              data: {
                producto: {
                  connect: { id: newProduct.id }, // Relacionar con el producto recién creado
                },

                precio: precio,
                estado: 'APROBADO', // Se puede manejar el estado según lo requerido
                tipo: 'ESTANDAR',
                // creadoPorId: createProductDto.creadoPorId, // El vendedor o usuario que lo creó (si es aplicable)
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
        console.log('el nuevo producto es: ', newProduct);

        return { newProduct, preciosCreados };
      });

      return result; // Devuelve el producto y sus precios creados
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
        where: {
          id,
        },
        include: {
          categorias: true,
          precios: {
            select: {
              id: true,
              precio: true,
            },
          },
        },
      });
      return product;
    } catch (error) {
      console.error('Error en findAll productos:', error); // Proporcionar más contexto en el error
      throw new InternalServerErrorException('Error al obtener los productos');
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
    console.log(
      'Los datos a usar son: ID: ',
      id,
      ' LOS OTROS DATOS: ',
      updateProductDto,
    );
    const productoAnterior = await this.prisma.producto.findUnique({
      where: {
        id: id,
      },
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

      // Aquí vamos a manejar los precios
      for (const price of updateProductDto.precios) {
        if (price.id) {
          // Actualizar precio existente
          await this.prisma.precioProducto.update({
            where: { id: price.id },
            data: { precio: price.precio },
          });
        } else {
          // Crear nuevo precio (si es necesario, aunque en este caso no parece que se deba añadir)
          await this.prisma.precioProducto.create({
            data: {
              estado: 'APROBADO',
              precio: price.precio,
              creadoPorId: updateProductDto.usuarioId,
              productoId: productoUpdate.id,
              tipo: 'ESTANDAR',
            },
          });
        }
      }

      if (productoAnterior && productoUpdate) {
        console.log(
          'Precio anterior:',
          productoAnterior.precioCostoActual,
          'Precio nuevo:',
          productoUpdate.precioCostoActual,
        );

        if (
          //
          Number(productoAnterior.precioCostoActual) !==
          Number(productoUpdate.precioCostoActual)
        ) {
          console.log('El precio ha cambiado, actualizando');

          const nuevoRegistroPrecioCosto =
            await this.prisma.historialPrecioCosto.create({
              data: {
                productoId: productoAnterior.id,
                precioCostoAnterior: Number(productoAnterior.precioCostoActual),
                precioCostoNuevo: Number(productoUpdate.precioCostoActual),
                modificadoPorId: updateProductDto.usuarioId,
              },
            });

          console.log(
            'El nuevo registro de cambio de precio es: ',
            nuevoRegistroPrecioCosto,
          );
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
