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
import { AjusteStockService } from './ajuste-stock.service';
import { CreateAjusteStockDto } from './dto/create-ajuste-stock.dto';
import { UpdateAjusteStockDto } from './dto/update-ajuste-stock.dto';
import { UpdateAjusteStockEmpaqueDto } from './dto/update-ajust-stock-empaque.dto';

@Controller('ajuste-stock')
export class AjusteStockController {
  constructor(private readonly ajusteStockService: AjusteStockService) {}

  @Post()
  create(@Body() createAjusteStockDto: CreateAjusteStockDto) {
    return this.ajusteStockService.create(createAjusteStockDto);
  }

  @Get()
  findAll() {
    return this.ajusteStockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ajusteStockService.findOne(+id);
  }

  @Patch('/update-stock/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAjusteStockDto: UpdateAjusteStockDto,
  ) {
    console.log('En el controller del edit llega: ', updateAjusteStockDto);
    console.log('EL ID DEL STOCK POR PARAM URL: ', id);

    return this.ajusteStockService.update(id, updateAjusteStockDto);
  }

  @Patch('/update-empaque-stock/:id')
  updateEmpaqueStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAjusteStockDto: UpdateAjusteStockEmpaqueDto,
  ) {
    console.log('En el controller del edit llega: ', updateAjusteStockDto);
    console.log('EL ID DEL STOCK POR PARAM URL: ', id);

    return this.ajusteStockService.updateEmpaqueStock(id, updateAjusteStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ajusteStockService.remove(+id);
  }
}
