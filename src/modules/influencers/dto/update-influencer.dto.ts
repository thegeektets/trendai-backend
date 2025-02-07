import { PartialType } from '@nestjs/mapped-types';
import { CreateInfluencerDto } from './create-influencer.dto';

export class UpdateInfluencerDto extends PartialType(CreateInfluencerDto) {}
