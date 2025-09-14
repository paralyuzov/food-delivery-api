import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'The country of the address' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'The city of the address' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'The state of the address' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'The street of the address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'The zip code of the address' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;
}
