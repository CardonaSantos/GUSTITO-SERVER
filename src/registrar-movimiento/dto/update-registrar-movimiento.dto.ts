import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrarMovimientoDto } from './create-registrar-movimiento.dto';

export class UpdateRegistrarMovimientoDto extends PartialType(CreateRegistrarMovimientoDto) {}
