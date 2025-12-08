import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as tz from 'dayjs/plugin/timezone';
import { throwFatalError } from 'src/Utils/CommonFatalErrors';
import { TZGT } from 'src/Utils/TimeZone';
dayjs.extend(utc);
dayjs.extend(tz);

type Item = {
  id: number;
  fechaVenta: Date;
  totalVenta: number;
};
// COLORES DE MARCA "GUSTITO"
const BRAND_COLORS = {
  ventas: '#591C63', // Morado Oscuro
  egresos: '#EE8888', // Rosa/Salmón
  depositos: '#9C6AA1', // Lila Medio
};

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getTotalVentasMontoSemana(sucursalId: number) {
    try {
      // 1. “Now” in Guatemala
      const guatNow = dayjs().tz('America/Guatemala');

      // 2. Compute start of week (Monday) & end of week (Sunday) in local time
      //    day(): Sunday=0, Monday=1, … Saturday=6
      const daysSinceMonday = (guatNow.day() + 6) % 7;
      const startLocal = guatNow
        .subtract(daysSinceMonday, 'day')
        .startOf('day'); // Monday 00:00
      const endLocal = startLocal.add(6, 'day').endOf('day'); // Sunday 23:59:59.999

      // 3. Convert those to UTC instants for the query
      const startUTC = startLocal.utc().toDate();
      const endUTC = endLocal.utc().toDate();

      // 4. Fetch & sum
      const ventas = await this.prisma.venta.findMany({
        where: {
          sucursalId,
          fechaVenta: {
            gte: startUTC,
            lte: endUTC,
          },
        },
        select: { totalVenta: true },
      });

      return ventas.reduce((sum, { totalVenta }) => sum + totalVenta, 0);
    } catch (error) {
      console.error('Error al calcular monto semanal:', error);
      throw new InternalServerErrorException(
        'Error al calcular el monto total de ventas de la semana',
      );
    }
  }

  async getVentasSemanalChart(sucursalId: number) {
    try {
      const fechaActual = new Date();

      // Calcular el primer día de la semana (lunes)
      const diaSemana = fechaActual.getDay();
      const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
      const primerDiaSemana = new Date(
        fechaActual.setDate(fechaActual.getDate() + diferencia),
      );
      primerDiaSemana.setHours(0, 0, 0, 0);

      const ultimoDiaSemana = new Date(primerDiaSemana);
      ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
      ultimoDiaSemana.setHours(23, 59, 59, 999);

      // Obtener ventas agrupadas por día de la semana con suma y conteo
      const ventasPorDia = await this.prisma.venta.groupBy({
        by: ['fechaVenta'],
        where: {
          sucursalId: sucursalId,
          fechaVenta: {
            gte: primerDiaSemana,
            lte: ultimoDiaSemana,
          },
        },
        _sum: {
          totalVenta: true,
        },
        _count: {
          id: true,
        },
      });

      const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const ventasSemanal = diasSemana.map((dia, index) => ({
        dia,
        totalVenta: 0,
        ventas: 0,
        fecha: new Date(
          primerDiaSemana.getTime() + index * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }));

      // Asignar los montos de ventas y cantidad de ventas a cada día correspondiente
      ventasPorDia.forEach((venta) => {
        const fechaVenta = new Date(venta.fechaVenta);
        fechaVenta.setHours(0, 0, 0, 0); // Normalizar la fecha para asegurarnos de que coincida solo por día
        const diaIndex = (fechaVenta.getDay() + 6) % 7; // Convertir para que el índice empiece en lunes

        if (ventasSemanal[diaIndex]) {
          ventasSemanal[diaIndex].totalVenta += venta._sum.totalVenta || 0;
          ventasSemanal[diaIndex].ventas += venta._count.id || 0;
        }
      });

      return ventasSemanal;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al calcular el monto total de ventas de la semana',
      );
    }
  }

  async getProductosMasVendidos() {
    try {
      // Consulta para obtener los 10 productos más vendidos en una sucursal específica
      const productosMasVendidos = await this.prisma.producto.findMany({
        include: {
          ventas: {
            select: {
              cantidad: true,
            },
          },
        },
      });

      // Calcular la suma total de ventas por producto
      const productosConTotalVentas = productosMasVendidos.map((producto) => {
        const totalVentas = producto.ventas.reduce(
          (total, venta) => total + venta.cantidad,
          0,
        );
        return {
          id: producto.id,
          nombre: producto.nombre,
          totalVentas,
        };
      });

      // Ordenar los productos por el total de ventas y tomar los 10 primeros
      const topProductos = productosConTotalVentas
        .sort((a, b) => b.totalVentas - a.totalVentas)
        .slice(0, 10);

      return topProductos;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al calcular los productos más vendidos',
      );
    }
  }

  async getVentasRecientes() {
    try {
      const ventasRecientes = await this.prisma.venta.findMany({
        take: 10,
        orderBy: {
          fechaVenta: 'desc',
        },
        select: {
          id: true,
          fechaVenta: true,
          totalVenta: true,
          sucursal: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      return ventasRecientes;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al conseguir ventas recientes');
    }
  }

  //------------------DIA, SEMANA, MES--------------------------------

  async getVentasMes(idSucursal: number) {
    try {
      // 1. Grab “now” in Guatemala time
      const guatNow = dayjs().tz('America/Guatemala');
      // 2. Compute start/end of the LOCAL month
      const startOfMonth = guatNow.startOf('month').utc().toDate();
      const endOfMonth = guatNow.endOf('month').utc().toDate();

      // 3. Query between those UTC instants
      const ventasMes = await this.prisma.venta.findMany({
        where: {
          sucursalId: idSucursal,
          fechaVenta: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { fechaVenta: 'desc' },
        select: { totalVenta: true },
      });

      // 4. Sum up
      const totalVentasMes = ventasMes.reduce(
        (sum, v) => sum + v.totalVenta,
        0,
      );

      return totalVentasMes;
    } catch (error) {
      console.error('Error al encontrar los registros de venta:', error);
      throw new InternalServerErrorException(
        'Error al encontrar los registros de venta',
      );
    }
  }

  async getVentasDia(idSucursal: number, fecha?: string): Promise<number> {
    // Si no se pasa una fecha, usamos la fecha actual
    const fechaActual = fecha ? new Date(fecha) : new Date();

    // Eliminar la hora de la fecha seleccionada
    const inicioDia = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate(),
      0,
      0,
      0,
    );
    const finDia = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate(),
      23,
      59,
      59,
    );

    try {
      const ventasTotalMonto = await this.prisma.venta.aggregate({
        where: {
          sucursalId: idSucursal,
          fechaVenta: {
            gte: inicioDia, // Inicio del día
            lte: finDia, // Fin del día
          },
        },
        _sum: {
          totalVenta: true, // Sumar el total de ventas
        },
      });

      return ventasTotalMonto._sum.totalVenta || 0; // Si no hay ventas, retorna 0
    } catch (error) {
      console.error('Error al calcular las ventas del día:', error);
      throw new InternalServerErrorException(
        'Error al calcular el monto total de ventas del día',
      );
    }
  }

  async getVentasDiaII(idSucursal: number) {
    try {
      // Obtenemos la fecha de "hoy"
      const now = new Date();

      // Año, mes, día (en JavaScript, los meses arrancan en 0)
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();

      // get “now” in Guatemala
      const guatToday = dayjs().tz('America/Guatemala');
      const startOfLocalDay = guatToday.startOf('day').utc().toDate();
      const endOfLocalDay = guatToday.endOf('day').utc().toDate();

      // Construimos el rango de la medianoche hasta las 23:59:59
      const startOfDay = new Date(year, month, day, 0, 0, 0);
      const endOfDay = new Date(year, month, day, 23, 59, 59);

      // Buscamos todas las ventas hechas entre ese rango de fechas (independiente de la hora exacta)
      // then query with those:
      const ventasDeHoy = await this.prisma.venta.findMany({
        where: {
          sucursalId: idSucursal,
          fechaVenta: {
            gte: startOfLocalDay,
            lte: endOfLocalDay,
          },
        },
      });

      // Sumamos el total de ventas de este día
      const totalDeHoy = ventasDeHoy.reduce(
        (acc, venta) => acc + venta.totalVenta,
        0,
      );

      return totalDeHoy;
    } catch (error) {
      console.error('Error al obtener el total de ventas de hoy:', error);
      throw new InternalServerErrorException(
        'No se pudo obtener el total de ventas de hoy',
      );
    }
  }

  async getSucursalesSummary() {
    // Aquí pedimos todas las sucursales e incluimos el registro de SucursalSaldo
    const sucursales = await this.prisma.sucursal.findMany({
      include: {
        SucursalSaldo: true,
      },
    });

    // Opcionalmente podrías hacer cálculos o mapear los datos,
    // pero por ahora simplemente retornamos todo tal cual
    return sucursales;
  }

  //PETICIONES  DE ANALISIS

  async analitycsVentas(id: number) {
    try {
      const today = dayjs().tz(TZGT);

      const [diaData, semanaData, mesData, anioData] = await Promise.all([
        this.comparativasDia(id),

        // CORRECCIÓN "PUNTO ÚNICO":
        // En lugar de startOf('week'), usamos los últimos 7 días hacia atrás
        // para asegurar que siempre haya una línea llena.
        this.getHistoricalData(
          id,
          today.subtract(6, 'day').startOf('day').toDate(), // Desde hace 6 días
          today.endOf('day').toDate(), // Hasta hoy final del día
          'DD/MM',
        ),

        // Mes actual (Aquí sí está bien startOf month)
        this.getHistoricalData(
          id,
          today.startOf('month').toDate(),
          today.endOf('month').toDate(),
          'DD/MM',
        ),

        // Año (Agrupado por Mes)
        this.getHistoricalData(
          id,
          today.startOf('year').toDate(),
          today.endOf('year').toDate(),
          'MMM', // Ene, Feb, Mar...
        ),
      ]);

      return { dia: diaData, semana: semanaData, mes: mesData, anio: anioData };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async comparativasDia(id: number) {
    const todayStart = dayjs().tz(TZGT).startOf('day').toDate();
    const todayEnd = dayjs().tz(TZGT).endOf('day').toDate();

    const [ventas, egresos, depositos] = await Promise.all([
      this.prisma.venta.aggregate({
        where: {
          sucursalId: id,
          fechaVenta: { gte: todayStart, lte: todayEnd },
        },
        _sum: { totalVenta: true },
      }),
      this.prisma.egreso.aggregate({
        where: {
          sucursalId: id,
          fechaEgreso: { gte: todayStart, lte: todayEnd },
        },
        _sum: { monto: true },
      }),
      this.prisma.deposito.aggregate({
        where: {
          sucursalId: id,
          fechaDeposito: { gte: todayStart, lte: todayEnd },
        },
        _sum: { monto: true },
      }),
    ]);

    // Usamos los colores de la marca aquí también
    return [
      {
        id: 'Ventas',
        label: 'Ventas',
        value: Number(ventas._sum.totalVenta || 0),
        color: BRAND_COLORS.ventas,
      },
      {
        id: 'Egresos',
        label: 'Egresos',
        value: Number(egresos._sum.monto || 0),
        color: BRAND_COLORS.egresos,
      },
      {
        id: 'Depósitos',
        label: 'Depósitos',
        value: Number(depositos._sum.monto || 0),
        color: BRAND_COLORS.depositos,
      },
    ];
  }

  private async getHistoricalData(
    id: number,
    startDate: Date,
    endDate: Date,
    format: string,
  ) {
    const [ventasRaw, egresosRaw, depositosRaw] = await Promise.all([
      this.prisma.venta.findMany({
        where: { sucursalId: id, fechaVenta: { gte: startDate, lte: endDate } },
        select: { fechaVenta: true, totalVenta: true },
        orderBy: { fechaVenta: 'asc' },
      }),
      this.prisma.egreso.findMany({
        where: {
          sucursalId: id,
          fechaEgreso: { gte: startDate, lte: endDate },
        },
        select: { fechaEgreso: true, monto: true },
        orderBy: { fechaEgreso: 'asc' },
      }),
      this.prisma.deposito.findMany({
        where: {
          sucursalId: id,
          fechaDeposito: { gte: startDate, lte: endDate },
        },
        select: { fechaDeposito: true, monto: true },
        orderBy: { fechaDeposito: 'asc' },
      }),
    ]);

    const processSeries = (
      data: any[],
      dateField: string,
      amountField: string,
    ) => {
      // 1. Agrupar datos existentes
      const grouped = data.reduce((acc: Record<string, number>, item) => {
        let key = dayjs(item[dateField]).format(format);
        if (format === 'MMM') key = key.charAt(0).toUpperCase() + key.slice(1);
        const amount = Number(item[amountField]) || 0;
        acc[key] = (acc[key] || 0) + amount;
        return acc;
      }, {});

      // 2. (OPCIONAL PERO RECOMENDADO) Rellenar huecos con 0 si quieres la línea perfecta
      // Para simplificar, retornamos lo agrupado, pero el cambio de fecha "Last 7 days"
      // arriba ya debería asegurar que la línea se vea mejor distribuida.

      return Object.entries(grouped).map(([date, total]) => ({
        x: date,
        y: total,
      }));
    };

    return [
      {
        id: 'Ventas',
        color: BRAND_COLORS.ventas,
        data: processSeries(ventasRaw, 'fechaVenta', 'totalVenta'),
      },
      {
        id: 'Egresos',
        color: BRAND_COLORS.egresos,
        data: processSeries(egresosRaw, 'fechaEgreso', 'monto'),
      },
      {
        id: 'Depósitos',
        color: BRAND_COLORS.depositos,
        data: processSeries(depositosRaw, 'fechaDeposito', 'monto'),
      },
    ];
  }
}
