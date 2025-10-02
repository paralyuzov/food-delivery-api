import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsPositive, IsString } from 'class-validator';

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

  @ApiProperty({ description: 'The category of the dish' })
  @IsString({ message: 'Category must be a string' })
  category: string;

  @ApiProperty({ description: 'Is the dish available?' })
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable?: boolean;
}
