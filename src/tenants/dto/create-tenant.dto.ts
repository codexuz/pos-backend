import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'My Store' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  ownerPhone: string;

  @ApiPropertyOptional({ enum: ['en', 'uz', 'ru'], default: 'en' })
  @IsOptional()
  @IsEnum(['en', 'uz', 'ru'])
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subscriptionPlanId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
