import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubmissionDocument = Submission & Document;

class Engagement {
  @Prop({ type: Number, required: true, default: 0 })
  likes: number;

  @Prop({ type: Number, required: true, default: 0 })
  comments: number;
}

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Campaign' })
  campaign: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Influencer', required: true })
  influencer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ required: true })
  contentLink: string;

  @Prop({ type: Engagement, default: () => ({ likes: 0, comments: 0 }) })
  engagement: Engagement;

  @Prop({ required: true, type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  approver: Types.ObjectId | null;

  _id?: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
