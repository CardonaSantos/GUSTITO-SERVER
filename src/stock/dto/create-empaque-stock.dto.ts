import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmpaqueStockEntryDto {
  @IsInt()
  @Min(1)
  empaqueId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioCosto: number;

  @IsNumber()
  @Min(0)
  costoTotal: number;

  @IsDateString()
  fechaIngreso: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsInt()
  @Min(1)
  proveedorId: number;
}

export class CreateEmpaqueStockDto {
  @IsInt()
  @Min(1)
  proveedorId: number;

  @IsInt()
  @Min(1)
  sucursalId: number;

  @IsInt()
  @Min(1)
  recibidoPorId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmpaqueStockEntryDto)
  stockEntries: EmpaqueStockEntryDto[];
}
