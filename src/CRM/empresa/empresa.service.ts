import { Injectable } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
// import { PrismaCrmService } from 'src/prisma/crm/crm.service';

@Injectable()
export class EmpresaService {
  constructor() {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    return 'This action adds a new empresa';
  }

  findAll() {
    return `This action returns all empresa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} empresa`;
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return `This action updates a #${id} empresa`;
  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }
}
