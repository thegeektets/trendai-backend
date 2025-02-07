import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './config/database';
import { CampaignsModule } from './modules/campaigns/campaign.module';
import { SubmissionsModule } from './modules/submissions/submission.module';
import { BrandsModule } from './modules/brands/brand.module';
import { InfluencerModule } from './modules/influencers/influencer.module';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    DatabaseModule,
    CampaignsModule,
    SubmissionsModule,
    BrandsModule,
    InfluencerModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
