import { Module } from '@nestjs/common';
import { EmpaqueService } from './empaque.service';
import { EmpaqueController } from './empaque.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EmpaqueController],
  providers: [EmpaqueService, PrismaService],
})
export class EmpaqueModule {}
