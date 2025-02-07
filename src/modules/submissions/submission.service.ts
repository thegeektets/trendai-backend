import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission, SubmissionDocument } from './submission.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
  ) {}

  async getSubmissions(): Promise<Submission[]> {
    return this.submissionModel.find().exec();
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
