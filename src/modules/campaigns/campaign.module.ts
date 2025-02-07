import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Campaign, CampaignSchema } from './campaign.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    AuthModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [MongooseModule, CampaignService],
})
export class CampaignsModule {}
