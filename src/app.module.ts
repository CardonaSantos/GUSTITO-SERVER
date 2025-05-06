import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { VentaModule } from './venta/venta.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { CategoriaModule } from './categoria/categoria.module';
import { VentaProductoModule } from './venta-producto/venta-producto.module';
import { EntregaStockModule } from './entrega-stock/entrega-stock.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SucursalesModule } from './sucursales/sucursales.module';
import { TransferenciaProductoModule } from './transferencia-producto/transferencia-producto.module';
import { GatewayModule } from './web-sockets/websocket.module';
import { NotificationModule } from './notification/notification.module';
import { PriceRequestModule } from './price-request/price-request.module';
import { SolicitudTransferenciaProductoModule } from './solicitud-transferencia-producto/solicitud-transferencia-producto.module';
import { AjusteStockModule } from './ajuste-stock/ajuste-stock.module';
import { ProductRemoveModule } from './product-remove/product-remove.module';
import { ClientRemoveModule } from './client-remove/client-remove.module';
import { StockRemoveModule } from './stock-remove/stock-remove.module';
import { ClientModule } from './client/client.module';
import { WarrantyModule } from './warranty/warranty.module';
import { TicketModule } from './ticket/ticket.module';
import { VencimientosModule } from './vencimientos/vencimientos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports/reports.module';
import { SucursalSaldoModule } from './sucursal-saldo/sucursal-saldo.module';
import { CajaModule } from './caja/caja.module';
import { SaleDeletedModule } from './sale-deleted/sale-deleted.module';
import { CuotasModule } from './cuotas/cuotas.module';
import { RepairModule } from './repair/repair.module';
import { MetasModule } from './metas/metas.module';
// import { EmpresaModule } from './crm/empresa/empresa.module';
import { EmpresaModule } from './CRM/empresa/empresa.module';
import { EmpaqueModule } from './empaque/empaque.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProductsModule,
    StockModule,
    VentaModule,
    ProveedorModule,
    CategoriaModule,
    VentaProductoModule,
    EntregaStockModule,
    AnalyticsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible en toda la aplicación
    }),
    SucursalesModule,
    TransferenciaProductoModule,
    //SOCKETSSSSSS
    GatewayModule,
    NotificationModule,
    PriceRequestModule,
    SolicitudTransferenciaProductoModule,
    AjusteStockModule,
    ProductRemoveModule,
    ClientRemoveModule,
    StockRemoveModule,
    ClientModule,
    WarrantyModule,
    TicketModule,
    VencimientosModule,
    ScheduleModule.forRoot(),
    ReportsModule,
    SucursalSaldoModule,
    CajaModule,
    SaleDeletedModule,
    CuotasModule,
    RepairModule,
    MetasModule,
    EmpresaModule,
    EmpaqueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
