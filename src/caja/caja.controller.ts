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

  //CERRAR LA CAJA
  @Patch('/close-box')
  create(@Body() createCajaDto: CreateCajaDto) {
    return this.cajaService.createCajaRegist(createCajaDto);
  }

  // caja.controller.ts

  // ABRIR EL REGISTRO DE CAJA [TURNO]
  @Post('/open-cash-regist')
  createRegistCash(@Body() createCajaDto: OpenRegistDTO) {
    return this.cajaService.createRegistCash(createCajaDto);
  }

  // CONSEGUIR REGISTRO DE CAJA SIN CERRAR (por sucursal + usuario, vía query)
  @Get('/find-cash-regist-open')
  findOpenCashRegist(
    @Query('sucursalId', ParseIntPipe) sucursalId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.cajaService.findOpenCashRegist(sucursalId, userId);
  }

  //CREAR REGISTRO DE DEPOSITO => RESTAR AL SALDO PRINCIPAL DE LA SUCURSAL (CERRAR TURNO)
  @Post('/create-deposit')
  createDeposit(@Body() createDepositoDto: DepositoDto) {
    return this.cajaService.registDeposit(createDepositoDto);
  }
  //CREAR REGISTRO DE EGRESO => RESTAR AL SALDO DE LA SUCURSAL
  @Post('/create-egreso')
  createEgreso(@Body() createEgresoDto: EgresoDto) {
    return this.cajaService.registEgreso(createEgresoDto);
  }

  //CONSEGUIR REGISTROS DE DEPOSITOS DE MI SUCURSAL ACTUAL [DONDE NO ESTÉN VINCULADOR A NINGUN REGISTRO DE CIERRE DE CAJA] DESPUÉS VINCULAR
  @Get('/get-all-deposits-sucursal/:id')
  findAllDepositsSucursal(@Param('id', ParseIntPipe) idSucursal: number) {
    return this.cajaService.findAllMyDeposti(idSucursal);
  }

  //CONSEGUIR REGISTROS DE EGRESOS DE MI SUCURSAL ACTUAL [NORMAL]
  @Get('/get-all-egresos-sucursal/:id')
  findAllEgresosSucursal(@Param('id', ParseIntPipe) idSucursal: number) {
    return this.cajaService.findAllMyEgresos(idSucursal);
  }

  //CONSEGUIR REGISTROS DE EGRESOS DE MI SUCURSAL ACTUAL [NORMAL]
  @Get('/get-all-cash-register-sucursal/:id')
  findAllCashRegister(@Param('id', ParseIntPipe) idSucursal: number) {
    return this.cajaService.findAllCashRegister(idSucursal);
  }

  @Get('/set-null/:id')
  setNull(@Param('id', ParseIntPipe) id: number) {
    return this.cajaService.setNull(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cajaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCajaDto: UpdateCajaDto) {
    return this.cajaService.update(+id, updateCajaDto);
  }

  @Delete('delete-cash-register/:id')
  async deleteCashRegister(@Param('id', ParseIntPipe) id: number) {
    // Aquí podrías aplicar un guard de admin si quieres (RolesGuard, etc.)
    return this.cajaService.deleteCashRegister(id);
  }
}
