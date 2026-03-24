import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Latest Apple smartphone' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 800.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({ example: 999.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellingPrice?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
