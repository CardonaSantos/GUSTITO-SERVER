import { PartialType } from '@nestjs/mapped-types';
import { CreateAjusteStockDto } from './create-ajuste-stock.dto';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoAjuste } from '@prisma/client';

export class UpdateAjusteStockEmpaqueDto {
  @IsInt()
  cantidad: number;
  @IsNumber()
  costoTotal: number;
  @IsString()
  fechaVencimiento: string;
  @IsString()
  fechaIngreso: string;

  //OTROS CAMPOS PERO PARA CREAR EL REGISTRO DE AJUSTE DE STOCK

  @IsInt()
  empaqueId: number;

  @IsInt()
  @IsOptional()
  stockId?: number; // Opcional, se usa solo si es un ajuste específico sobre un stock

  @IsInt()
  cantidadAjustada: number; // La cantidad que se ajusta, puede ser positiva o negativa

  @IsEnum(TipoAjuste)
  tipoAjuste: TipoAjuste; // Enum de tipo de ajuste: INCREMENTO, DECREMENTO o CORRECCION

  @IsInt()
  @IsOptional()
  usuarioId?: number; // Opcional, puede ser nulo si no hay un usuario asociado al ajuste

  @IsString()
  @IsOptional()
  descripcion?: string; // Descripción opcional para el motivo del ajuste
}
