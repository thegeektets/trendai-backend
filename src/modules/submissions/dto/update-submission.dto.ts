import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @IsOptional()
  @IsString()
  approver?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
