import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission } from './submission.schema';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
  ) {}

  async getSubmissions(): Promise<Submission[]> {
    return this.submissionModel.find().exec();
  }

  async createSubmission(data: {
    influencerId: string;
    campaignId: string;
    submissionUrl: string;
  }) {
    const newSubmission = new this.submissionModel(data);
    return newSubmission.save();
  }
}
