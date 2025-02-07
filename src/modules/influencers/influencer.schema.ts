import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InfluencerDocument = Influencer & Document;

@Schema({ timestamps: true })
export class Influencer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  socialMediaHandle: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true, min: 0 })
  followersCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;
  _id: any;
}

export const InfluencerSchema = SchemaFactory.createForClass(Influencer);
