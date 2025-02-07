import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async createCampaign(dto: CreateCampaignDto): Promise<Campaign> {
    const newCampaign = new this.campaignModel(dto);
    return newCampaign.save();
  }

  async getCampaigns(): Promise<Campaign[]> {
    return this.campaignModel.find().exec();
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id).exec();
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const updatedCampaign = await this.campaignModel
      .findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return updatedCampaign;
  }

  /** 📌 Delete a campaign */
  async deleteCampaign(id: string): Promise<{ message: string }> {
    const deleted = await this.campaignModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return { message: 'Campaign deleted successfully' };
  }
}
