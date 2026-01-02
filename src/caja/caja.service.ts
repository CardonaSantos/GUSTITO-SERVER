import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepositoDto } from './dto/deposito.dto';
import { EgresoDto } from './dto/egreso.dto';
import { OpenRegistDTO } from './dto/open-regist.dto';

@Injectable()
export class CajaService {
  private readonly logger = new Logger(CajaService.name);
  constructor(private readonly prisma: PrismaService) {}

  //CERRAR EL REGISTRO DE CAJA
  async createCajaRegist(createCajaDto: CreateCajaDto) {
    try {
      console.log(
        'Los datos para crear el cierre de caja son: ',
        createCajaDto,
      );

      if (!createCajaDto.id) {
        throw new BadRequestException(
          'Faltan datos requeridos para cerrar el registro de caja',
        );
      }

      return await this.prisma.$transaction(async (prisma) => {
        const registUpdate = await prisma.registroCaja.update({
          where: { id: createCajaDto.id },
          data: {
            comentario: createCajaDto.comentario,
            estado: 'CERRADO',
            fechaCierre: new Date(),
            saldoFinal: Number(createCajaDto.saldoFinal),
          },
        });

        if (createCajaDto.depositosIds?.length) {
          await prisma.deposito.updateMany({
            where: { id: { in: createCajaDto.depositosIds } },
            data: { registroCajaId: registUpdate.id },
          });
        }

        if (createCajaDto.egresosIds?.length) {
          await prisma.egreso.updateMany({
            where: { id: { in: createCajaDto.egresosIds } },
            data: { registroCajaId: registUpdate.id },
          });
        }

        let totalVentas = 0;
        if (createCajaDto.ventasIds?.length) {
          const ventas = await prisma.venta.findMany({
            where: { id: { in: createCajaDto.ventasIds } },
            select: { totalVenta: true },
          });
          totalVentas = ventas.reduce(
            (acc, venta) => acc + venta.totalVenta,
            0,
          );
          await prisma.venta.updateMany({
            where: { id: { in: createCajaDto.ventasIds } },
            data: { registroCajaId: registUpdate.id },
          });
        }

        let metaMasReciente = await prisma.metaUsuario.findFirst({
          where: {
            usuarioId: Number(createCajaDto.usuarioId),
            estado: { in: ['ABIERTO', 'FINALIZADO'] },
          },
          orderBy: { fechaInicio: 'desc' },
        });

        if (!metaMasReciente) {
          console.warn(
            `No se encontró ninguna meta activa para el usuario con ID ${createCajaDto.usuarioId}`,
          );
          // Optionally, continue without updating meta
        } else {
          // Update meta if it exists, allowing both ABIERTO and FINALIZADO states.
          const metaTienda = await prisma.metaUsuario.update({
            where: {
              id: metaMasReciente.id,
              estado: { in: ['ABIERTO', 'FINALIZADO'] },
              // Remove or adjust the montoActual condition if necessary:
              // montoActual: { lt: metaMasReciente.montoMeta },
            },
            data: { montoActual: { increment: totalVentas } },
          });

          const metaActualizada = await prisma.metaUsuario.findUnique({
            where: { id: metaMasReciente.id },
          });

          // If the updated meta has reached the target, update its status.
          if (metaActualizada.montoActual >= metaActualizada.montoMeta) {
            await prisma.metaUsuario.update({
              where: { id: metaActualizada.id },
              data: {
                cumplida: true,
                estado: 'FINALIZADO',
                fechaCumplida: new Date(),
              },
            });
          }

          console.log(
            'El registro de meta de tienda actualizado es: ',
            metaTienda,
          );
        }

        return registUpdate;
      });
    } catch (error) {
      console.error('Error al cerrar el registro de caja:', error);
      throw new BadRequestException('Error al cerrar el registro de caja');
    }
  }

  //ABRIR EL REGISTRO DE CAJA CON DATOS PRIMARIOS
  // ABRIR EL REGISTRO DE CAJA CON DATOS PRIMARIOS
  async createRegistCash(createCajaDto: OpenRegistDTO) {
    const { sucursalId, usuarioId } = createCajaDto;

    if (!sucursalId || !usuarioId) {
      throw new BadRequestException(
        'sucursalId y usuarioId son requeridos para abrir el registro de caja',
      );
    }

    try {
      const registro = await this.prisma.$transaction(async (tx) => {
        // 1) Verificar que no exista caja abierta para este usuario/sucursal
        const existingOpen = await tx.registroCaja.findFirst({
          where: {
            sucursalId,
            usuarioId,
            estado: 'ABIERTO',
            fechaCierre: null,
          },
        });

        if (existingOpen) {
          throw new BadRequestException(
            'Ya existe un registro de caja abierto para este usuario en esta sucursal',
          );
        }

        // 2) Buscar última caja cerrada de la sucursal (para heredar saldo)
        const lastClosed = await tx.registroCaja.findFirst({
          where: {
            sucursalId,
            estado: 'CERRADO', // o EstadoCaja.CERRADO
          },
          orderBy: {
            fechaCierre: 'desc',
          },
          select: {
            saldoFinal: true,
          },
        });

        const saldoInicial =
          lastClosed?.saldoFinal ??
          (createCajaDto.saldoInicial !== undefined
            ? Number(createCajaDto.saldoInicial)
            : 0);

        const nuevoRegistro = await tx.registroCaja.create({
          data: {
            sucursalId,
            usuarioId,
            saldoInicial,
            estado: 'ABIERTO', // EstadoCaja.ABIERTO si quieres
            comentario: createCajaDto.comentario,
            fechaCierre: null,

            // fechaInicio se llena con default(now())
          },
        });

        return nuevoRegistro;
      });

      this.logger.log(
        `Registro de caja abierto:\n${JSON.stringify(registro, null, 2)}`,
      );

      return registro;
    } catch (error) {
      this.logger.error(
        `Error al abrir el registro de caja: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'No se pudo abrir el registro de caja',
      );
    }
  }

  // CONSEGUIR EL ÚLTIMO REGISTRO DE CAJA ABIERTO DE MI SUCURSAL,
  // CON ESTE USUARIO LOGUEADO, + RESUMEN DE MOVIMIENTOS O ÚLTIMA CAJA CERRADA
  async findOpenCashRegist(sucursalId: number, userId: number) {
    try {
      this.logger.log(
        `findOpenCashRegist -> sucursal=${sucursalId}, user=${userId}`,
      );

      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Intentar obtener caja ABIERTA
        const registro = await tx.registroCaja.findFirst({
          where: {
            sucursalId,
            usuarioId: userId,
            fechaCierre: null,
            estado: 'ABIERTO',
          },
          orderBy: {
            fechaInicio: 'desc',
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                rol: true,
              },
            },
          },
        });

        // 2) Si NO hay caja abierta, buscamos la última caja CERRADA
        if (!registro) {
          const ultimaCajaCerrada = await tx.registroCaja.findFirst({
            where: {
              sucursalId,
              usuarioId: userId,
              estado: 'CERRADO',
              fechaCierre: { not: null },
            },
            orderBy: {
              fechaCierre: 'desc',
            },
            select: {
              id: true,
              sucursalId: true,
              saldoFinal: true,
              fechaCierre: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  rol: true,
                },
              },
            },
          });

          return {
            tieneCajaAbierta: false,
            cajaAbierta: null,
            ultimaCajaCerrada, // puede ser null si nunca ha tenido caja
          };
        }

        // 3) Si HAY caja abierta, calculamos resumen de movimientos
        const [
          ventasAgg,
          egresosAgg,
          depositosAgg,
          ventas,
          egresos,
          depositos,
        ] = await Promise.all([
          tx.venta.aggregate({
            where: { registroCajaId: registro.id },
            _sum: { totalVenta: true },
          }),
          tx.egreso.aggregate({
            where: { registroCajaId: registro.id },
            _sum: { monto: true },
          }),

          tx.deposito.aggregate({
            where: {
              registroCajaId: registro.id,
            },
            _sum: { monto: true },
          }),

          // VENTAS
          tx.venta.findMany({
            where: {
              registroCajaId: registro.id,
            },
            select: {
              id: true,
              clienteId: true,
              fechaVenta: true,
              horaVenta: true,
              totalVenta: true,
              sucursalId: true,
              nombreClienteFinal: true,
              telefonoClienteFinal: true,
              direccionClienteFinal: true,
              imei: true,
              registroCajaId: true,
              productos: {
                select: {
                  cantidad: true,
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
          }),
          // EGRESOS
          tx.egreso.findMany({
            where: {
              registroCajaId: registro.id,
            },
            select: {
              id: true,
              registroCajaId: true,
              descripcion: true,
              monto: true,
              fechaEgreso: true,
              sucursalId: true,
              usuarioId: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  rol: true,
                },
              },
            },
          }),
          // DEPOSITOS
          tx.deposito.findMany({
            where: {
              registroCajaId: registro.id,
            },
            select: {
              id: true,
              registroCajaId: true,
              monto: true,
              numeroBoleta: true,
              banco: true,
              fechaDeposito: true,
              usadoParaCierre: true,
              descripcion: true,
              sucursalId: true,
              usuarioId: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  rol: true,
                },
              },
              sucursal: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          }),
        ]);

        const saldoInicial = registro.saldoInicial ?? 0;
        const totalVentas = ventasAgg._sum.totalVenta ?? 0;
        const totalEgresos = egresosAgg._sum.monto ?? 0;
        const totalDepositos = depositosAgg._sum.monto ?? 0;

        const saldoTeoricoFinal =
          saldoInicial + totalVentas - totalEgresos - totalDepositos;

        const diferencia = (registro.saldoFinal ?? 0) - saldoTeoricoFinal;
        const resumenCaja = {
          saldoInicial,
          totalVentas,
          totalEgresos,
          totalDepositos,
          saldoTeoricoFinal,
        };
        this.logger.log(
          `resumenCaja:\n${JSON.stringify(resumenCaja, null, 2)}`,
        );

        const resumen = {
          saldoInicial: saldoInicial,
          totalVentas: totalVentas,
          totalEgresos: totalEgresos,
          totalDepositos: totalDepositos,
          diferencia: diferencia,
          saldoTeoricoFinal: saldoTeoricoFinal,
        };

        return {
          tieneCajaAbierta: true,
          cajaAbierta: {
            ...registro,
            resumen,
          },
          ventas: ventas,
          depositos: depositos,
          egresos: egresos,

          ultimaCajaCerrada: null,
        };
      });

      this.logger.log(`Estado de caja: ${JSON.stringify(result, null, 2)}`);

      return result;
    } catch (error) {
      console.error('Error al conseguir el registro de caja abierto:', error);
      throw new InternalServerErrorException(
        'No se pudo encontrar el registro de caja abierto',
      );
    }
  }

  //FALTA INCREMENTAR EL SALDO-YA VINCULADO
  async registDeposit(depositoDto: DepositoDto) {
    const { sucursalId, usuarioId } = depositoDto;

    if (!sucursalId || !usuarioId) {
      throw new BadRequestException(
        'sucursalId y usuarioId son requeridos para registrar un depósito',
      );
    }

    const monto = Number(depositoDto.monto);

    if (!monto || monto <= 0) {
      throw new BadRequestException('El monto del depósito debe ser mayor a 0');
    }

    this.logger.log(
      `Intentando registrar depósito. sucursalId=${sucursalId}, usuarioId=${usuarioId}, monto=${monto}`,
    );

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Buscar caja abierta para este usuario en esta sucursal
        const cajaAbierta = await tx.registroCaja.findFirst({
          where: {
            sucursalId,
            usuarioId,
            estado: 'ABIERTO',
          },
          orderBy: {
            fechaInicio: 'desc',
          },
          select: {
            id: true,
          },
        });

        if (!cajaAbierta) {
          this.logger.warn(
            `No se encontró caja abierta para sucursalId=${sucursalId}, usuarioId=${usuarioId} al registrar depósito`,
          );
          throw new BadRequestException(
            'No hay un registro de caja abierto para este usuario en esta sucursal. No se puede registrar el depósito.',
          );
        }

        // 2) Crear depósito ligado a la caja abierta
        const deposito = await tx.deposito.create({
          data: {
            banco: depositoDto.banco,
            monto,
            numeroBoleta: depositoDto.numeroBoleta,
            usadoParaCierre: depositoDto.usadoParaCierre || false,
            sucursalId,
            descripcion: depositoDto.descripcion,
            usuarioId,
            registroCajaId: cajaAbierta.id, // 👈 AHORA siempre apunta a una caja válida
          },
        });

        // 3) Actualizar saldo de la sucursal
        // (mantengo tu lógica: es un egreso de caja hacia banco)
        await tx.sucursalSaldo.update({
          where: {
            sucursalId,
          },
          data: {
            totalEgresos: {
              increment: monto,
            },
            saldoAcumulado: {
              decrement: monto,
            },
          },
        });

        return { deposito, cajaId: cajaAbierta.id };
      });

      this.logger.log(
        `Depósito creado correctamente. depositoId=${result.deposito.id}, cajaId=${result.cajaId}`,
      );

      return result.deposito;
    } catch (error) {
      this.logger.error(
        `Error al crear registro de depósito: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        // Errores de negocio claros
        throw error;
      }

      // Errores inesperados (DB, etc.)
      throw new InternalServerErrorException(
        'Error interno al crear registro de depósito',
      );
    }
  }

  //FALTA RESTAR EL SALDO-YA VINCULADO
  async registEgreso(egresoDto: EgresoDto) {
    const { sucursalId, usuarioId } = egresoDto;

    if (!sucursalId || !usuarioId) {
      throw new BadRequestException(
        'sucursalId y usuarioId son requeridos para registrar un egreso',
      );
    }

    const monto = Number(egresoDto.monto);

    if (!monto || monto <= 0) {
      throw new BadRequestException('El monto del egreso debe ser mayor a 0');
    }

    this.logger.log(
      `Intentando registrar egreso. sucursalId=${sucursalId}, usuarioId=${usuarioId}, monto=${monto}`,
    );

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Buscar caja abierta para este usuario en esta sucursal
        const cajaAbierta = await tx.registroCaja.findFirst({
          where: {
            sucursalId,
            usuarioId,
            estado: 'ABIERTO',
          },
          orderBy: {
            fechaInicio: 'desc',
          },
          select: {
            id: true,
          },
        });

        if (!cajaAbierta) {
          this.logger.warn(
            `No se encontró caja abierta para sucursalId=${sucursalId}, usuarioId=${usuarioId} al registrar egreso`,
          );
          throw new BadRequestException(
            'No hay un registro de caja abierto para este usuario en esta sucursal. No se puede registrar el egreso.',
          );
        }

        // 2) Crear egreso ligado a la caja abierta
        const nuevoRegistroEgreso = await tx.egreso.create({
          data: {
            descripcion: egresoDto.descripcion,
            monto,
            sucursalId,
            usuarioId,
            registroCajaId: cajaAbierta.id, // 👈 AHORA siempre apunta a una caja válida
          },
        });

        // 3) Actualizar saldo de la sucursal
        await tx.sucursalSaldo.update({
          where: {
            sucursalId,
          },
          data: {
            totalEgresos: {
              increment: monto,
            },
            saldoAcumulado: {
              decrement: monto,
            },
          },
        });

        return { egreso: nuevoRegistroEgreso, cajaId: cajaAbierta.id };
      });

      this.logger.log(
        `Egreso creado correctamente. egresoId=${result.egreso.id}, cajaId=${result.cajaId}`,
      );

      return result.egreso;
    } catch (error) {
      this.logger.error(
        `Error al crear registro de egreso: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno al crear registro de egreso',
      );
    }
  }

  async findAllMyDeposti(idSucursal: number) {
    try {
      const misRegistrosDepositos = await this.prisma.deposito.findMany({
        orderBy: {
          fechaDeposito: 'desc',
        },
        where: {
          sucursalId: idSucursal,
          registroCajaId: null,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              rol: true,
            },
          },
          sucursal: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
      return misRegistrosDepositos;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al encontrart registros no vinculador de esta sucursal',
      );
    }
  }

  async findAllMyEgresos(idSucursal: number) {
    try {
      const misRegistrosDepositos = await this.prisma.egreso.findMany({
        where: {
          sucursalId: idSucursal,
          registroCajaId: null,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              rol: true,
            },
          },
        },
      });
      console.log('buscando egresos');

      return misRegistrosDepositos;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al encontrart registros no vinculador de esta sucursal',
      );
    }
  }

  async findAllCashRegister(idSucursal: number) {
    try {
      const data = await this.prisma.registroCaja.findMany({
        orderBy: {
          fechaCierre: 'desc',
        },
        where: {
          sucursalId: idSucursal,
        },
        include: {
          ventas: {
            orderBy: {
              fechaVenta: 'desc',
            },
            select: {
              fechaVenta: true,
              id: true,
              productos: {
                select: {
                  cantidad: true,
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
          },
          depositos: {
            orderBy: {
              fechaDeposito: 'desc',
            },
            select: {
              banco: true,
              descripcion: true,
              fechaDeposito: true,
              id: true,
              monto: true,
              numeroBoleta: true,
              usadoParaCierre: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  rol: true,
                },
              },
            },
          },
          egresos: {
            orderBy: {
              fechaEgreso: 'desc',
            },
            select: {
              id: true,
              descripcion: true,
              fechaEgreso: true,
              monto: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  rol: true,
                },
              },
            },
          },
          sucursal: {
            select: {
              id: true,
              nombre: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              rol: true,
            },
          },
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al conseguir datos de registros de cajas',
      );
    }
  }

  async setNull(sucursalId: number) {
    try {
      const saldoSucursal = await this.prisma.sucursalSaldo.update({
        where: {
          sucursalId: sucursalId,
        },
        data: {
          saldoAcumulado: {
            set: 0,
          },
          totalEgresos: {
            set: 0,
          },
          totalIngresos: {
            set: 0,
          },
        },
      });

      console.log('El registro actualizado es: ', saldoSucursal);
    } catch (error) {}
  }

  findAll() {
    return `This action returns all caja`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caja`;
  }

  update(id: number, updateCajaDto: UpdateCajaDto) {
    return `This action updates a #${id} caja`;
  }

  /**
   * Eliminar un turno de caja.
   *
   * Reglas:
   * - Debe existir el registro.
   * - Solo se permite eliminar cajas CERRADAS (estado = 'CERRADO' y fechaCierre != null).
   * - No dejamos huérfanos: se limpian las FK de ventas, depósitos y egresos (registroCajaId = null).
   * - Todo se hace en una transacción.
   */
  async deleteCashRegister(id: number) {
    this.logger.log(`Intentando eliminar registro de caja id=${id}`);

    try {
      const deleted = await this.prisma.$transaction(async (tx) => {
        // 1) Buscar el registro de caja con sus movimientos
        const registro = await tx.registroCaja.findUnique({
          where: { id },
          include: {
            ventas: true,
            depositos: true,
            egresos: true,
          },
        });

        if (!registro) {
          this.logger.warn(
            `Intento de eliminar registro de caja inexistente. id=${id}`,
          );

          throw new NotFoundException('Registro de caja no encontrado');
        }

        // Solo permitir eliminar cajas cerradas
        // if (registro.estado !== 'CERRADO' || !registro.fechaCierre) {
        //   this.logger.warn(
        //     `Intento de eliminar caja no cerrada. id=${id}, estado=${registro.estado}, fechaCierre=${registro.fechaCierre}`,
        //   );
        //   throw new BadRequestException(
        //     'Solo se pueden eliminar registros de caja que estén CERRADOS.',
        //   );
        // }

        this.logger.log(
          `Eliminando caja id=${id}. Ventas=${registro.ventas.length}, Depositos=${registro.depositos.length}, Egresos=${registro.egresos.length}`,
        );

        // 2) Quitar relación de ventas, depósitos y egresos con la caja (evitar huérfanos)
        if (registro.ventas.length > 0) {
          await tx.venta.updateMany({
            where: { registroCajaId: id },
            data: { registroCajaId: null },
          });
        }

        if (registro.depositos.length > 0) {
          await tx.deposito.updateMany({
            where: { registroCajaId: id },
            data: { registroCajaId: null },
          });
        }

        if (registro.egresos.length > 0) {
          await tx.egreso.updateMany({
            where: { registroCajaId: id },
            data: { registroCajaId: null },
          });
        }

        // 3) Eliminar el registro de caja
        const cajaEliminada = await tx.registroCaja.delete({
          where: { id },
        });

        this.logger.log(`Registro de caja eliminado correctamente. id=${id}`);

        return cajaEliminada;
      });

      return deleted;
    } catch (error) {
      this.logger.error(
        `Error al eliminar registro de caja id=${id}: ${error?.message}`,
        error?.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al eliminar el registro de caja',
      );
    }
  }

  async deleteDeposito(id: number) {
    try {
      if (!id) throw new BadRequestException('Registro no proporcionado');

      const registToDelete = await this.prisma.deposito.delete({
        where: {
          id,
        },
      });
      return registToDelete;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async deleteEgreso(id: number) {
    try {
      if (!id) throw new BadRequestException('Registro no proporcionado');

      const registToDelete = await this.prisma.egreso.delete({
        where: {
          id,
        },
      });
      return registToDelete;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
