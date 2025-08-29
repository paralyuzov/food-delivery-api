import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'yourpassword' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
