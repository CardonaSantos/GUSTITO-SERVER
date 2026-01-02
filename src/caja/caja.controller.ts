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
import { CajaService } from './caja.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { DepositoDto } from './dto/deposito.dto';
import { EgresoDto } from './dto/egreso.dto';
import { OpenRegistDTO } from './dto/open-regist.dto';

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  // ==========================================
  // RUTAS DE CREACIÓN / ACCIÓN (POST)
  // ==========================================

  @Post('/open-cash-regist')
  openCashRegister(@Body() openDto: OpenRegistDTO) {
    return this.cajaService.createRegistCash(openDto);
  }

  @Post('/create-deposit')
  createDeposit(@Body() depositoDto: DepositoDto) {
    return this.cajaService.registDeposit(depositoDto);
  }

  @Post('/create-egreso')
  createEgreso(@Body() egresoDto: EgresoDto) {
    return this.cajaService.registEgreso(egresoDto);
  }

  // ==========================================
  // RUTAS DE ACTUALIZACIÓN (PATCH)
  // ==========================================

  @Patch('/close-box')
  closeBox(@Body() closeDto: CreateCajaDto) {
    return this.cajaService.createCajaRegist(closeDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCajaDto,
  ) {
    return this.cajaService.update(id, updateDto);
  }

  // ==========================================
  // RUTAS DE CONSULTA (GET)
  // ==========================================

  /** * IMPORTANTE: Las rutas estáticas o con Query Params van ARRIBA
   * de las rutas que usan :id genérico.
   */

  @Get('/find-cash-regist-open')
  findOpenCashRegist(
    @Query('sucursalId', ParseIntPipe) sucursalId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.cajaService.findOpenCashRegist(sucursalId, userId);
  }

  @Get('/get-all-deposits-sucursal/:id')
  findAllDepositsSucursal(@Param('id', ParseIntPipe) idSucursal: number) {
    return this.cajaService.findAllMyDeposti(idSucursal);
  }

  @Get('/get-all-egresos-sucursal/:id')
  findAllEgresosSucursal(@Param('id', ParseIntPipe) idSucursal: number) {
    return this.cajaService.findAllMyEgresos(idSucursal);
  }

  @Get('/get-all-cash-register-sucursal/:id')
  findAllCashRegister(@Param('id', ParseIntPipe) idSucursal: number) {
    return this.cajaService.findAllCashRegister(idSucursal);
  }

  @Get('/set-null/:id')
  setNull(@Param('id', ParseIntPipe) id: number) {
    // return this.cajaService.setNull(id);
  }

  // Ruta genérica al final de los GET
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cajaService.findOne(id);
  }

  // ==========================================
  // RUTAS DE ELIMINACIÓN (DELETE)
  // ==========================================

  @Delete('delete-deposito/:id')
  deleteDeposit(@Param('id', ParseIntPipe) id: number) {
    return this.cajaService.deleteDeposito(id);
  }

  @Delete('delete-egreso/:id')
  deleteEgreso(@Param('id', ParseIntPipe) id: number) {
    return this.cajaService.deleteEgreso(id);
  }

  @Delete('delete-cash-register/:id')
  deleteCashRegister(@Param('id', ParseIntPipe) id: number) {
    return this.cajaService.deleteCashRegister(id);
  }
}
