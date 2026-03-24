import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Rent' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
