import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['brand', 'influencer'])
  role: 'brand' | 'influencer';

  @IsOptional()
  @IsMongoId()
  brandId?: string;

  @IsOptional()
  @IsMongoId()
  influencerId?: string;
}
