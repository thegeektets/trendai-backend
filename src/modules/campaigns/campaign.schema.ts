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

  @Prop({ type: String, required: true, ref: 'Brand' })
  brand: string;

  _id?: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Now you can define the virtual after the schema is created
CampaignSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'campaignId',
});
