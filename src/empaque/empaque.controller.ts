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
import { EmpaqueService } from './empaque.service';
import { CreateEmpaqueDto } from './dto/create-empaque.dto';
import { UpdateEmpaqueDto } from './dto/update-empaque.dto';

@Controller('empaque')
export class EmpaqueController {
  constructor(private readonly empaqueService: EmpaqueService) {}

  @Post()
  create(@Body() createEmpaqueDto: CreateEmpaqueDto) {
    return this.empaqueService.create(createEmpaqueDto);
  }

  @Get('')
  findAll() {
    return this.empaqueService.findAll();
  }

  @Get('/find-empaques-stock')
  find_empaques_stock() {
    return this.empaqueService.fin_empaques_stock();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empaqueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpaqueDto: UpdateEmpaqueDto) {
    return this.empaqueService.update(+id, updateEmpaqueDto);
  }

  @Delete('/mark-deleted/:id')
  markAsDeleted(@Param('id', ParseIntPipe) id: number) {
    return this.empaqueService.markAsDeletedEmpaque(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empaqueService.remove(+id);
  }
}
