import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsNumber, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSaleItemDto } from './create-sale.dto';

export class UpdateSaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ example: 0, description: 'Seller profit amount added on top of total' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellerProfitAmount?: number;

  @ApiPropertyOptional({ enum: ['pending', 'partial', 'paid'] })
  @IsOptional()
  @IsEnum(['pending', 'partial', 'paid'])
  paymentStatus?: 'pending' | 'partial' | 'paid';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [CreateSaleItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items?: CreateSaleItemDto[];
}
