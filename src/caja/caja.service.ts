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
    this.logger.log(
      `[closeCaja] payload=${JSON.stringify(createCajaDto, null, 2)}`,
    );

    if (
      !createCajaDto.id ||
      !createCajaDto.usuarioId ||
      !createCajaDto.sucursalId
    ) {
      throw new BadRequestException(
        'Faltan datos requeridos para cerrar el registro de caja',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const registro = await tx.registroCaja.findFirst({
        where: {
          id: createCajaDto.id,
          usuarioId: createCajaDto.usuarioId,
          sucursalId: createCajaDto.sucursalId,
          estado: 'ABIERTO',
          fechaCierre: null,
        },
        select: {
          id: true,
          saldoInicial: true,
          usuarioId: true,
          sucursalId: true,
        },
      });

      if (!registro) {
        throw new BadRequestException(
          'El registro no existe, no pertenece al usuario/sucursal o ya está cerrado',
        );
      }

      const [ventas, depositos, egresos] = await Promise.all([
        tx.venta.findMany({
          where: { registroCajaId: registro.id },
          select: { id: true, totalVenta: true },
        }),
        tx.deposito.findMany({
          where: { registroCajaId: registro.id },
          select: { id: true, monto: true },
        }),
        tx.egreso.findMany({
          where: { registroCajaId: registro.id },
          select: { id: true, monto: true },
        }),
      ]);

      const totalVentas = ventas.reduce(
        (acc: number, venta) => acc + Number(venta.totalVenta),
        0,
      );

      const totalDepositos = depositos.reduce(
        (acc: number, d) => acc + Number(d.monto),
        0,
      );

      const totalEgresos = egresos.reduce(
        (acc: number, e) => acc + Number(e.monto),
        0,
      );

      this.logger.log(
        `[closeCaja] resolucion_db={ ventas:${totalVentas}, depositos:${totalDepositos}, egresos:${totalEgresos} }`,
      );

      const saldoFinal = Number(createCajaDto.saldoFinal);

      const registUpdate = await tx.registroCaja.update({
        where: { id: registro.id },
        data: {
          comentario: createCajaDto.comentario,
          estado: 'CERRADO',
          fechaCierre: new Date(),
          saldoFinal,
        },
      });

      const metaMasReciente = await tx.metaUsuario.findFirst({
        where: {
          usuarioId: createCajaDto.usuarioId,
          estado: { in: ['ABIERTO', 'FINALIZADO'] },
        },
        orderBy: { fechaInicio: 'desc' },
        select: {
          id: true,
          montoActual: true,
          montoMeta: true,
          estado: true,
        },
      });

      if (metaMasReciente) {
        await tx.metaUsuario.update({
          where: { id: metaMasReciente.id },
          data: {
            montoActual: {
              increment: totalVentas,
            },
          },
        });

        const metaActualizada = await tx.metaUsuario.findUnique({
          where: { id: metaMasReciente.id },
          select: {
            id: true,
            montoActual: true,
            montoMeta: true,
          },
        });

        if (
          metaActualizada &&
          metaActualizada.montoActual >= metaActualizada.montoMeta
        ) {
          await tx.metaUsuario.update({
            where: { id: metaActualizada.id },
            data: {
              cumplida: true,
              estado: 'FINALIZADO',
              fechaCumplida: new Date(),
            },
          });
        }
      }

      this.logger.log(
        `[closeCaja] registro_cerrado=${JSON.stringify(registUpdate, null, 2)}`,
      );

      return registUpdate;
    });
  }

  //ABRIR EL REGISTRO DE CAJA CON DATOS PRIMARIOS
  async createRegistCash(createCajaDto: OpenRegistDTO) {
    const { sucursalId, usuarioId } = createCajaDto;

    if (!sucursalId || !usuarioId) {
      throw new BadRequestException(
        'sucursalId y usuarioId son requeridos para abrir el registro de caja',
      );
    }

    this.logger.log(
      `[openCaja] payload=${JSON.stringify(createCajaDto, null, 2)}`,
    );

    return this.prisma.$transaction(async (tx) => {
      const existingOpen = await tx.registroCaja.findFirst({
        where: {
          sucursalId,
          usuarioId,
          estado: 'ABIERTO',
          fechaCierre: null,
        },
        select: {
          id: true,
          saldoInicial: true,
          fechaInicio: true,
        },
      });

      if (existingOpen) {
        this.logger.warn(
          `[openCaja] ya existe una caja abierta=${JSON.stringify(existingOpen)}`,
        );
        throw new BadRequestException(
          'Ya existe un registro de caja abierto para este usuario en esta sucursal',
        );
      }

      const saldoInicial =
        createCajaDto.saldoInicial !== undefined &&
        createCajaDto.saldoInicial !== null
          ? Number(createCajaDto.saldoInicial)
          : 0;

      this.logger.log(
        `[openCaja] saldoInicial_resuelto=${saldoInicial}, usuarioId=${usuarioId}, sucursalId=${sucursalId}`,
      );

      const nuevoRegistro = await tx.registroCaja.create({
        data: {
          sucursalId,
          usuarioId,
          saldoInicial,
          estado: 'ABIERTO',
          comentario: createCajaDto.comentario ?? null,
          fechaCierre: null,
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

      this.logger.log(
        `[openCaja] registro_creado=${JSON.stringify(nuevoRegistro, null, 2)}`,
      );

      return nuevoRegistro;
    });
  }

  // CONSEGUIR EL ÚLTIMO REGISTRO DE CAJA ABIERTO DE MI SUCURSAL,
  // CON ESTE USUARIO LOGUEADO, + RESUMEN DE MOVIMIENTOS O ÚLTIMA CAJA CERRADA
  async findOpenCashRegist(sucursalId: number, userId: number) {
    this.logger.log(
      `[findOpenCashRegist] sucursalId=${sucursalId}, userId=${userId}`,
    );

    return this.prisma.$transaction(async (tx) => {
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

        this.logger.log(
          `[findOpenCashRegist] sin caja abierta, ultimaCajaCerrada=${JSON.stringify(ultimaCajaCerrada, null, 2)}`,
        );

        return {
          tieneCajaAbierta: false,
          cajaAbierta: null,
          ultimaCajaCerrada,
        };
      }

      const [ventasAgg, egresosAgg, depositosAgg, ventas, egresos, depositos] =
        await Promise.all([
          tx.venta.aggregate({
            where: { registroCajaId: registro.id },
            _sum: { totalVenta: true },
          }),
          tx.egreso.aggregate({
            where: { registroCajaId: registro.id },
            _sum: { monto: true },
          }),
          tx.deposito.aggregate({
            where: { registroCajaId: registro.id },
            _sum: { monto: true },
          }),
          tx.venta.findMany({
            where: { registroCajaId: registro.id },
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
          tx.egreso.findMany({
            where: { registroCajaId: registro.id },
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
          tx.deposito.findMany({
            where: { registroCajaId: registro.id },
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

      const resumen = {
        saldoInicial,
        totalVentas,
        totalEgresos,
        totalDepositos,
        saldoTeoricoFinal,
        diferencia: (registro.saldoFinal ?? 0) - saldoTeoricoFinal,
      };

      this.logger.log(
        `[findOpenCashRegist] resumen=${JSON.stringify(resumen, null, 2)}`,
      );

      return {
        tieneCajaAbierta: true,
        cajaAbierta: {
          ...registro,
          resumen,
        },
        ventas,
        depositos,
        egresos,
        ultimaCajaCerrada: null,
      };
    });
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
      this.logger.error(`Error al crear registro de depósito: ${error}`, error);

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
      this.logger.error(`Error al crear registro de egreso: ${error}`, error);

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
        `Error al eliminar registro de caja id=${id}: ${error}`,
        error,
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
