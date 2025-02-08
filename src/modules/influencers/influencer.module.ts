import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InfluencerService } from './influencer.service';
import { InfluencerController } from './influencer.controller';
import { Influencer, InfluencerSchema } from './influencer.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Influencer.name, schema: InfluencerSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [InfluencerController],
  providers: [InfluencerService],
  exports: [MongooseModule, InfluencerService],
})
export class InfluencerModule {}
