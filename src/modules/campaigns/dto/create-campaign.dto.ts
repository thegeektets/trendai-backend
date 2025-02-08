import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  budget: number;

  @IsDateString()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @IsEnum(['active', 'paused', 'completed'])
  status: string;

  @IsMongoId()
  @IsNotEmpty()
  brand: string;
}
