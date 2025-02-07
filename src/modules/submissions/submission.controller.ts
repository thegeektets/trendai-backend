import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('submissions')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('brand', 'influencer')
  async getAllSubmissions() {
    return await this.submissionService.getSubmissions();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('brand', 'influencer')
  async getSubmission(@Param('id') id: string) {
    return await this.submissionService.getSubmissionById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('influencer')
  async createSubmission(@Body() data: CreateSubmissionDto) {
    return await this.submissionService.createSubmission(data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  async updateSubmission(
    @Param('id') id: string,
    @Body() data: UpdateSubmissionDto,
  ) {
    return await this.submissionService.updateSubmission(id, data);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  async partiallyUpdateSubmission(
    @Param('id') id: string,
    @Body() data: UpdateSubmissionDto,
  ) {
    return await this.submissionService.partialUpdateSubmission(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('brand')
  async deleteSubmission(@Param('id') id: string) {
    return await this.submissionService.deleteSubmission(id);
  }
}
