import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, MinLength } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'The name of the restaurant' })
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiProperty({ description: 'A brief description of the restaurant' })
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  description: string;

  @ApiProperty({ description: 'The address of the restaurant' })
  @IsString()
  @MinLength(1, { message: 'Address is required' })
  address: string;

  @ApiProperty({ description: 'The phone number of the restaurant' })
  @IsString()
  @MinLength(1, { message: 'Phone number is required' })
  phone: string;

  @ApiProperty({ description: 'The email of the restaurant' })
  @IsString()
  @MinLength(1, { message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'The image URL of the restaurant' })
  @IsString()
  @MinLength(1, { message: 'Image URL is required' })
  imageUrl: string;

  @ApiProperty({ description: 'Is the restaurant active?' })
  @IsBoolean()
  isActive?: boolean;
}
