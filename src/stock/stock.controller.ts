import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto, StockEntryDTO } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { DeleteStockDto } from './dto/delete-stock.dto';
import { CreateEmpaqueStockDto } from './dto/create-empaque-stock.dto';
import { DeleteEmpaqueStockDto } from './dto/delete-stockEmpaque.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  async create(@Body() createStockDto: StockEntryDTO) {
    console.log('Entrando al stock controller');
    console.log('Los datos en el controller son: ', createStockDto);

    return await this.stockService.create(createStockDto);
  }

  @Post('/empaques')
  async createStockEmpaques(@Body() createStockDto: CreateEmpaqueStockDto) {
    console.log('Entrando al stock controller');
    console.log('Los datos en el controller son: ', createStockDto);

    return await this.stockService.createEmpaqueStock(createStockDto);
  }

  @Get()
  async findAll() {
    return await this.stockService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.findOne(id);
  }

  @Get('/get-one-stock/:id')
  async findOneStock(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.findOneStock(id);
  }

  @Get('/get-empaque-stock/:id')
  async findOneEmpaqueStock(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.findOneStockEmpaqueEdti(id);
  }

  @Post('/delete-stock')
  async deleteOneStock(@Body() dto: DeleteStockDto) {
    console.log('En el controller del delete stock llega: ', dto);

    return await this.stockService.deleteOneStock(dto);
  }

  @Post('/delete-stock-empaque')
  async deleteOneEmpaqueStock(@Body() dto: DeleteEmpaqueStockDto) {
    console.log('En el controller del delete stock llega: ', dto);
    return await this.stockService.deleteOneEmpaqueStock(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return await this.stockService.update(id, updateStockDto);
  }

  @Delete('/delete-all')
  async removeAll() {
    return await this.stockService.removeAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.remove(id);
  }
}
