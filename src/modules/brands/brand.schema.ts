import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  website: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  users: Types.ObjectId[];

  _id: any;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
