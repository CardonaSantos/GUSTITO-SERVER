import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MovimientoStockController } from './registrar-movimiento.controller';
import { MovimientoStockService } from './registrar-movimiento.service';

/**
 * @Global() hace que MovimientoStockService esté disponible en TODA la app
 * sin necesidad de importar MovimientoStockModule en cada módulo que lo use.
 *
 * Solo necesitas importarlo UNA VEZ en AppModule.
 */
@Global()
@Module({
  controllers: [MovimientoStockController],
  providers: [MovimientoStockService, PrismaService],
  exports: [MovimientoStockService], // ← clave para que otros módulos lo inyecten
})
export class MovimientoStockModule {}
