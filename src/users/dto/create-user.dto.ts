import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ enum: ['super_admin', 'owner', 'seller'], default: 'seller' })
  @IsOptional()
  @IsEnum(['super_admin', 'owner', 'seller'])
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: ['en', 'uz', 'ru'], default: 'en' })
  @IsOptional()
  @IsEnum(['en', 'uz', 'ru'])
  language?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
