import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;
}

export class CreateSaleDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @ApiPropertyOptional({ enum: ['cash', 'card', 'transfer', 'other'], default: 'cash' })
  @IsOptional()
  @IsEnum(['cash', 'card', 'transfer', 'other'])
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  paidAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
