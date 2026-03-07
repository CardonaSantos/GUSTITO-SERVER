import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AjusteStockService } from 'src/ajuste-stock/ajuste-stock.service';
import { MovimientoStockModule } from 'src/registrar-movimiento/registrar-movimiento.module';

@Module({
  imports: [MovimientoStockModule],
  controllers: [StockController],
  providers: [StockService, PrismaService, AjusteStockService],
})
export class StockModule {}
