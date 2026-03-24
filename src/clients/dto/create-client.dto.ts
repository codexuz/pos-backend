import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '456 Oak Ave' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'VIP customer' })
  @IsOptional()
  @IsString()
  notes?: string;
}
