import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  shortName: string;
}
