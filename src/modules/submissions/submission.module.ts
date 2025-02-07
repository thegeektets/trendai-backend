import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { Submission, SubmissionSchema } from './submission.schema';
import { Campaign, CampaignSchema } from '../campaigns/campaign.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    AuthModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [MongooseModule, SubmissionService],
})
export class SubmissionsModule {}
