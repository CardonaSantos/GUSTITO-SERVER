import { MetodoPago } from '@prisma/client';
import {
  IsDate,
  IsArray,
  IsEnum,
  IsNumber,
  IsInt,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateVentaDto {
  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  dpi?: string;

  @IsString()
  @IsOptional()
  iPInternet?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsArray()
  productos: Array<{
    productoId: number;
    cantidad: number;
    selectedPriceId: number;
  }>;

  @IsArray()
  @IsOptional()
  empaques?: Array<{
    id: number;
    quantity: number;
  }>;

  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @IsNumber()
  monto: number;

  @IsInt()
  sucursalId: number;

  @IsString()
  @IsOptional()
  imei?: string;
}
