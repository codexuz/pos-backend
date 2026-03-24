import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  saleId: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ enum: ['cash', 'card', 'transfer', 'other'], default: 'cash' })
  @IsOptional()
  @IsEnum(['cash', 'card', 'transfer', 'other'])
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
