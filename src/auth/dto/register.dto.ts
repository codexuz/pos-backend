import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
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

  @ApiProperty({ example: 'My Store' })
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @ApiPropertyOptional({ enum: ['en', 'uz', 'ru'], default: 'en' })
  @IsOptional()
  @IsEnum(['en', 'uz', 'ru'])
  language?: string;
}
