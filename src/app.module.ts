import { Module } from '@nestjs/common';
import { DatabaseModule } from './config/database';
import { CampaignsModule } from './modules/campaigns/campaign.module';
import { SubmissionsModule } from './modules/submissions/submission.module';

@Module({
  imports: [DatabaseModule, CampaignsModule, SubmissionsModule],
})
export class AppModule {}
