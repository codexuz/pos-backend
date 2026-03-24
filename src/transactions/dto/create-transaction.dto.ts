import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  expenseCategoryId?: string;

  @ApiPropertyOptional({ example: 'Monthly rent payment' })
  @IsOptional()
  @IsString()
  description?: string;
}
