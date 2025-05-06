import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateEmpaqueDto {
  @IsString()
  @Length(2, 100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @Length(2, 50)
  codigoProducto: string;

  @IsInt()
  @IsOptional()
  precioCosto: number;
  @IsInt()
  @IsOptional()
  precioVenta: number;
}
