import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission, SubmissionDocument } from './submission.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { flattenObject } from '../../common/utils';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
  ) {}

  async getSubmissions(): Promise<Submission[]> {
    const submissions = await this.submissionModel.find().exec();
    return submissions.map((submission: any) => ({
      ...submission,
      _id: submission._id.toString(),
    }));
  }

  async getSubmissionsByBrand(brandId: string): Promise<Submission[]> {
    const submissions = await this.submissionModel
      .find({ brand: brandId })
      .populate('influencer')
      .populate('campaign')
      .populate('brand')
      .populate('approver')
      .lean()
      .exec();
    return submissions.map((submission: any) => ({
      ...flattenObject(submission),
      _id: submission._id.toString(),
    }));
  }

  async getSubmissionsByInfluencer(influencerId: string) {
    const submissions = await this.submissionModel
      .find({ influencer: influencerId })
      .populate('brand')
      .populate('campaign')
      .populate('approver')
      .lean()
      .exec();

    // Grouping logic
    const groupedData = submissions.reduce((acc, submission: any) => {
      const brandId = submission.brand?._id.toString();
      const campaignId = submission.campaign?._id.toString();

      if (!acc[brandId]) {
        acc[brandId] = {
          ...submission.brand,
          brandName: submission.brand?.name || 'Unknown Brand',
          campaigns: {},
        };
      }

      if (!acc[brandId].campaigns[campaignId]) {
        acc[brandId].campaigns[campaignId] = {
          ...submission.campaign,
          campaignName: submission.campaign?.name || 'Unknown Campaign',
          submissions: [],
        };
      }

      acc[brandId].campaigns[campaignId].submissions.push({
        ...submission,
        _id: submission._id.toString(),
      });

      return acc;
    }, {});

    return groupedData;
  }

  async getSubmissionById(id: string): Promise<Submission> {
    const submission = await this.submissionModel.findById(id).exec();
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return {
      ...submission.toObject(),
      _id: submission._id.toString(),
    };
  }

  async createSubmission(data: CreateSubmissionDto): Promise<Submission> {
    const newSubmission = new this.submissionModel(data);
    const savedSubmission = await newSubmission.save();

    return {
      ...savedSubmission.toObject(),
      _id: savedSubmission._id.toString(),
    };
  }

  async updateSubmission(
    id: string,
    data: UpdateSubmissionDto,
  ): Promise<Submission> {
    const updatedSubmission = await this.submissionModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedSubmission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return {
      ...updatedSubmission.toObject(),
      _id: updatedSubmission._id.toString(),
    };
  }

  async deleteSubmission(id: string): Promise<{ message: string }> {
    const deletedSubmission = await this.submissionModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedSubmission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return { message: 'Submission deleted successfully' };
  }
}
