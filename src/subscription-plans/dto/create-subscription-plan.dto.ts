import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Basic' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Basic plan with limited features' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationDays: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxBranches?: number;

  @ApiPropertyOptional({ example: 3, default: 3 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxUsers?: number;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxProducts?: number;

  @ApiPropertyOptional({ example: { analytics: true, export: false } })
  @IsOptional()
  features?: Record<string, boolean>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
