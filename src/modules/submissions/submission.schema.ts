import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Submission extends Document {
  @Prop({ required: true })
  influencerId: string;

  @Prop({ required: true })
  campaignId: string;

  @Prop({ required: true })
  submissionUrl: string;

  @Prop({ default: 'pending' }) // pending, approved, rejected
  status: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
