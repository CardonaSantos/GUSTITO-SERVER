import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdatePriceDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsNumber()
  precio: number;

  @IsInt()
  @Min(1)
  orden: number;

  @IsOptional()
  eliminar?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  precioCostoActual: number;

  @IsArray()
  categorias: number[];

  @IsInt()
  usuarioId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePriceDto)
  precios: UpdatePriceDto[];
}
