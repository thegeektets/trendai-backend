import {
  IsNotEmpty,
  IsMongoId,
  IsUrl,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EngagementDto {
  @IsOptional()
  @IsNumber()
  likes?: number;

  @IsOptional()
  @IsNumber()
  comments?: number;
}

export class CreateSubmissionDto {
  @IsMongoId()
  @IsNotEmpty()
  campaign: string;

  @IsMongoId()
  @IsNotEmpty()
  influencer: string;

  @IsMongoId()
  @IsNotEmpty()
  brand: string;

  @IsUrl()
  @IsNotEmpty()
  contentLink: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EngagementDto)
  engagement?: EngagementDto;
}
