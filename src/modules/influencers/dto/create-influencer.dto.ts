import { IsString, IsNotEmpty, IsInt, Min, IsMongoId } from 'class-validator';

export class CreateInfluencerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  socialMediaHandle: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsInt()
  @Min(0)
  followersCount: number;

  @IsMongoId()
  @IsNotEmpty()
  user: string;
}
