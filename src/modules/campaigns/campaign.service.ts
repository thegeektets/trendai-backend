import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {
  Submission,
  SubmissionDocument,
} from '../submissions/submission.schema';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
  ) {}

  async getCampaignsByBrand(brandId: string) {
    // Step 1: Fetch campaigns for the brand
    const campaigns = await this.campaignModel
      .find({ brand: brandId })
      .lean()
      .exec();

    // Step 2: Fetch all submissions for the brand in a single query
    const submissions = await this.submissionModel
      .find({ campaign: { $in: campaigns.map((c) => c._id.toString()) } })
      .populate('influencer')
      .lean()
      .exec();

    console.log('submissions', submissions);

    // Step 3: Group submissions by campaign and influencer
    const campaignMap = new Map<string, any>();

    // Initialize the map with all campaigns
    campaigns.forEach((campaign) => {
      campaignMap.set(campaign._id.toString(), {
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
        budget: campaign.budget,
        status: campaign.status,
        startDate: new Date(campaign.startDate).toLocaleString(),
        endDate: new Date(campaign.endDate).toLocaleString(),
        influencers: new Map<string, any>(), // Use a Map to group influencers
      });
    });

    // Add submissions to their respective campaigns and influencers
    submissions.forEach((submission: any) => {
      const campaignId = submission.campaign.toString();
      const influencerId = submission.influencer._id.toString();

      const campaignData = campaignMap.get(campaignId);

      console.log('campaignData', campaignData);

      // Initialize the influencer in the campaign's influencer map if it doesn't exist
      if (!campaignData.influencers.has(influencerId)) {
        campaignData.influencers.set(influencerId, {
          id: influencerId,
          name: submission.influencer.name,
          avatar:
            submission.influencer.avatar || 'https://via.placeholder.com/50',
          socialMediaHandle: submission.influencer.socialMediaHandle,
          platform: submission.influencer.platform,
          followersCount: submission.influencer.followersCount,
          submissions: [],
        });
      }

      // Add the submission to the influencer's submissions array
      campaignData.influencers.get(influencerId).submissions.push({
        id: submission._id.toString(),
        date: submission.createdAt.toISOString(),
        status: submission.status,
        engagement: submission.engagement,
      });
    });

    // Step 4: Convert the campaign map to an array of formatted campaigns
    const formattedCampaigns = Array.from(campaignMap.values()).map(
      (campaign) => ({
        ...campaign,
        influencers: Array.from(campaign.influencers.values()), // Convert influencer map to array
      }),
    );

    return formattedCampaigns;
  }
  async createCampaign(campaign: CreateCampaignDto): Promise<Campaign> {
    const newCampaign = new this.campaignModel(campaign);
    const savedCampaign = await newCampaign.save();

    return {
      ...savedCampaign.toObject(),
      _id: savedCampaign._id.toString(),
    };
  }

  async getCampaigns(): Promise<Campaign[]> {
    const campaigns = await this.campaignModel.find().exec();
    return campaigns.map((campaign: any) => ({
      ...campaign.toObject(),
      name: campaign.name,
      description: campaign.description,
      budget: campaign.budget,
      startDate: new Date(campaign.startDate).toLocaleString(),
      endDate: new Date(campaign.endDate).toLocaleString(),
      _id: campaign._id.toString(),
    }));
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id).exec();
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return {
      ...campaign.toObject(),
      _id: campaign._id.toString(),
    };
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

    return {
      ...updatedCampaign.toObject(),
      _id: updatedCampaign._id.toString(),
    };
  }

  async deleteCampaign(id: string): Promise<{ message: string }> {
    const deleted = await this.campaignModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return { message: 'Campaign deleted successfully' };
  }
}
