import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrecioVentaItemDto {
  @IsNumber()
  @IsPositive()
  precio: number;

  @IsInt()
  @IsPositive()
  orden: number;
}

export class CreateNewProductDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @IsPositive()
  precioCostoActual: number;

  @IsNumber()
  @IsPositive()
  creadoPorId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrecioVentaItemDto)
  precioVenta: PrecioVentaItemDto[];

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  categorias?: number[];
}
