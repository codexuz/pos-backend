import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiPropertyOptional({ example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minQuantity?: number;
}
