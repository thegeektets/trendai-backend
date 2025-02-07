import {
  IsString,
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
  campaignId: string;

  @IsString()
  @IsNotEmpty()
  influencer: string;

  @IsUrl()
  @IsNotEmpty()
  contentLink: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EngagementDto)
  engagement?: EngagementDto;
}
