import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  budget: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ enum: ['active', 'paused', 'completed'], default: 'active' })
  status: string;

  _id?: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
