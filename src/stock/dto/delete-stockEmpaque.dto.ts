import { IsInt, IsOptional, IsString } from 'class-validator';

export class DeleteEmpaqueStockDto {
  @IsInt()
  stockId: number;

  @IsInt()
  empaqueId: number;

  @IsInt()
  usuarioId: number;

  @IsInt()
  sucursalId: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
