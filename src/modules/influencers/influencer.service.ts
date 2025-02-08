import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Influencer, InfluencerDocument } from './influencer.schema';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';

@Injectable()
export class InfluencerService {
  constructor(
    @InjectModel(Influencer.name)
    private influencerModel: Model<InfluencerDocument>,
  ) {}

  async create(data: CreateInfluencerDto): Promise<Influencer> {
    const newInfluencer = new this.influencerModel(data);
    const savedInfluencer = await newInfluencer.save();

    return {
      ...savedInfluencer.toObject(),
      _id: savedInfluencer._id.toString(),
    };
  }

  async findAll(): Promise<Influencer[]> {
    return await this.influencerModel.find().exec();
  }

  async findOne(id: string): Promise<Influencer> {
    const influencer = await this.influencerModel.findById(id).exec();
    if (!influencer) throw new NotFoundException('Influencer not found');
    return { ...influencer.toObject(), _id: influencer._id.toString() };
  }

  async update(
    id: string,
    updateInfluencerDto: UpdateInfluencerDto,
  ): Promise<Influencer> {
    const updatedInfluencer = await this.influencerModel
      .findByIdAndUpdate(id, updateInfluencerDto, { new: true })
      .exec();
    if (!updatedInfluencer) throw new NotFoundException('Influencer not found');
    return {
      ...updatedInfluencer.toObject(),
      _id: updatedInfluencer._id.toString(),
    };
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.influencerModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Influencer not found');
  }

  async findByUserId(userId: string): Promise<Influencer | null> {
    const influencer = await this.influencerModel.findOne({ userId }).exec();
    if (!influencer) throw new NotFoundException('Influencer not found');
    return influencer;
  }
}
