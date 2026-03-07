import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MovimientoStockService } from './registrar-movimiento.service';

@Controller('movimiento-stock')
export class MovimientoStockController {
  constructor(private readonly service: MovimientoStockService) {}

  @Get('/by-producto/:productoId')
  findByProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.service.findByProducto(productoId);
  }

  @Get('/by-sucursal/:sucursalId')
  findBySucursal(@Param('sucursalId', ParseIntPipe) sucursalId: number) {
    return this.service.findBySucursal(sucursalId);
  }

  @Get('/by-stock/:stockId')
  findByStock(@Param('stockId', ParseIntPipe) stockId: number) {
    return this.service.findByStock(stockId);
  }

  @Get('/by-usuario/:usuarioId')
  findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.service.findByUsuario(usuarioId);
  }
}
