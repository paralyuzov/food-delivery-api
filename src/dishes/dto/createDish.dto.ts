import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ description: 'The name of the dish' })
  @IsString({ message: 'Dish name must be a string' })
  name: string;

  @ApiProperty({ description: 'The description of the dish' })
  @IsString({ message: 'Dish description must be a string' })
  description: string;

  @ApiProperty({ description: 'The price of the dish' })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({ description: 'The image URL of the dish' })
  @IsString({ message: 'Image URL must be a string' })
  imageUrl: string;
}
