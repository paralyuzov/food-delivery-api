import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DishDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  menuId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  isAvailable?: boolean;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  updatedAt?: string;

  @IsOptional()
  avgRating?: number;
}

export class OrderItemDto {
  @ValidateNested()
  @Type(() => DishDto)
  dish: DishDto;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  address: string; // This matches your "address" field

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
