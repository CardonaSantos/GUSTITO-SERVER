import { TipoMovimientoStock } from '@prisma/client';

export interface RegistrarMovimientoDto {
  // ¿QUÉ se movió?
  stockId?: number;
  productoId?: number;
  empaqueId?: number;

  // ¿QUÉ pasó?
  tipoMovimiento: TipoMovimientoStock;
  cantidadAnterior: number;
  cantidadNueva: number;

  // ¿QUIÉN / DÓNDE?
  usuarioId?: number;
  sucursalId?: number;

  // ¿DESDE QUÉ ORIGEN?
  ventaId?: number;
  entregaStockId?: number;
  ajusteStockId?: number;
  transferenciaId?: number;

  // CONTEXTO adicional
  descripcion?: string;
  origenModulo?: string; // ej: 'StockService.create', 'VentaService.create'
}
