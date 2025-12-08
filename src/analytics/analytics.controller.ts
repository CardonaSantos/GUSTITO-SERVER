import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Sin parámetros :id Siempre van al principio para evitar colisiones

  @Get('sucursales-summary')
  async getSucursalesSummary() {
    return this.analyticsService.getSucursalesSummary();
  }

  @Get('get-productos-mas-vendidos') // Quité el slash final innecesario
  getProductosMasVendidos() {
    return this.analyticsService.getProductosMasVendidos();
  }

  @Get('get-ventas-recientes')
  getVentasRecientes() {
    return this.analyticsService.getVentasRecientes();
  }

  // ==========================================
  // 2. RUTAS DINÁMICAS (Con parámetros :id)
  // Van después de las estáticas
  // ==========================================

  @Get('venta-dia/:idSucursal')
  async getVentasDiaII(@Param('idSucursal', ParseIntPipe) idSucursal: number) {
    const totalDeHoy = await this.analyticsService.getVentasDiaII(idSucursal);
    return {
      totalDeHoy,
    };
  }

  // PARA EL CHART DEL DASHBOARD
  @Get('get-ventas/semanal-chart/:id')
  getVentasSemanalChart(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getVentasSemanalChart(id);
  }

  // DESGLOSE DE TIEMPO

  @Get('get-ventas/dia/:id')
  getVentasDia(@Param('id', ParseIntPipe) id: number) {
    // NOTA: Corregí el nombre del método, antes decía getVentasSemana
    return this.analyticsService.getVentasDia(id);
  }

  @Get('get-ventas/semana/:id')
  getVentasSemana(@Param('id', ParseIntPipe) id: number) {
    // NOTA: Corregí el nombre del método, antes decía getVentasDia
    return this.analyticsService.getTotalVentasMontoSemana(id);
  }

  @Get('get-ventas/mes/:id')
  getVentasMes(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getVentasMes(id);
  }

  @Get('comparativa/:id')
  comparativasAnalitycs(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.analitycsVentas(id);
  }
}
