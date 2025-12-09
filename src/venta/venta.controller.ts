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
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FindSucursalSalesDto } from './dto/find-sucursal-sales.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  async create(@Body() createVentaDto: CreateVentaDto) {
    return await this.ventaService.create(createVentaDto);
  }

  @Get()
  async findAll() {
    return await this.ventaService.findAll();
  }

  @Get('/find-customer-sales/:customerId')
  async findAllSaleCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return await this.ventaService.findAllSaleCustomer(customerId);
  }

  @Get('/find-my-sucursal-sales/:id')
  async findAllSaleSucursal(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: FindSucursalSalesDto,
  ) {
    return await this.ventaService.findAllSaleSucursal(id, query);
  }

  @Get('/get-ventas-caja/:id/:usuarioId')
  async getSalesToCashRegist(
    @Param('id', ParseIntPipe) id: number,
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return await this.ventaService.getSalesToCashRegist(id, usuarioId);
  }

  @Get('/get-sale/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ventaService.findOneSale(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return await this.ventaService.update(id, updateVentaDto);
  }

  @Delete('/delete-all')
  async removeAll() {
    return await this.ventaService.removeAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.ventaService.remove(id);
  }
}
