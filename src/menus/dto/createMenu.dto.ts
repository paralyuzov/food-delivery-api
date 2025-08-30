import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString({ message: 'Restaurant ID must be a string' })
  restaurantId: string;

  @ApiProperty({ description: 'Name of the menu' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'Description of the menu' })
  @IsString({ message: 'Description must be a string' })
  description: string;
}
