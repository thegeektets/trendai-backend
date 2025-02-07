import { Controller, Get, Post, Body } from '@nestjs/common';
import { SubmissionService } from './submission.service';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  getAllSubmissions() {
    return this.submissionService.getSubmissions();
  }

  @Post()
  createSubmission(
    @Body()
    data: {
      influencerId: string;
      campaignId: string;
      submissionUrl: string;
    },
  ) {
    return this.submissionService.createSubmission(data);
  }
}
