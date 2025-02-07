import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Campaign extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ default: 'ongoing' })
  status: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
