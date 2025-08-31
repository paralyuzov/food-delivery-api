import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ description: 'Name of the menu' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'Description of the menu' })
  @IsString({ message: 'Description must be a string' })
  description: string;
}
