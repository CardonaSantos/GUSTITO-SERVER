import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpaqueDto } from './create-empaque.dto';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class UpdateEmpaqueDto extends PartialType(CreateEmpaqueDto) {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  codigoProducto?: string;

  @IsInt()
  @IsOptional()
  precioCosto: number;
  @IsInt()
  @IsOptional()
  precioVenta: number;
}
