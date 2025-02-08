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
  /**
   * Retrieves all submissions.
   *
   * @returns All submissions.
   */
  async getAllSubmissions() {
    return await this.submissionService.getSubmissions();
  }

  @Get('brand/:brandId')
  @UseGuards(RolesGuard)
  @Roles('brand')
  /**
   * Retrieves all brand submissions.
   *
   * @returns All submissions.
   */
  async getSubmissionsByBrand(@Param('brandId') brandId: string) {
    return await this.submissionService.getSubmissionsByBrand(brandId);
  }

  @Get('influencer/:influencerId')
  @UseGuards(RolesGuard)
  @Roles('influencer', 'brand')
  /**
   * Retrieves all brand submissions.
   *
   * @returns All submissions.
   */
  async getSubmissionsByInfluencer(
    @Param('influencerId') influencerId: string,
  ) {
    return await this.submissionService.getSubmissionsByInfluencer(
      influencerId,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('brand', 'influencer')
  /**
   * Retrieves a submission by ID.
   *
   * @param id - The ID of the submission to be retrieved.
   * @returns The retrieved submission object.
   */
  async getSubmission(@Param('id') id: string) {
    return await this.submissionService.getSubmissionById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('influencer')
  /**
   * Handles the creation of a new submission.
   *
   * @param data - The data for creating a new submission, encapsulated in a CreateSubmissionDto.
   * @returns The created submission object.
   */
  async createSubmission(@Body() data: CreateSubmissionDto) {
    return await this.submissionService.createSubmission(data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer', 'brand')
  /**
   * Handles the update of a submission.
   *
   * @param id - The id of the submission to be updated.
   * @param data - The data for updating the submission, encapsulated in an UpdateSubmissionDto.
   * @returns The updated submission object.
   */
  async updateSubmission(
    @Param('id') id: string,
    @Body() data: UpdateSubmissionDto,
  ) {
    return await this.submissionService.updateSubmission(id, data);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer', 'brand')
  /**
   * Handles the partial update of a submission.
   *
   * @param id - The id of the submission to be updated.
   * @param data - The data for updating the submission, encapsulated in an UpdateSubmissionDto. Only the provided fields will be updated.
   * @returns The updated submission object.
   */
  async partiallyUpdateSubmission(
    @Param('id') id: string,
    @Body() data: UpdateSubmissionDto,
  ) {
    return await this.submissionService.updateSubmission(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  /**
   * Handles the deletion of a submission.
   *
   * @param id - The id of the submission to be deleted.
   * @returns A message indicating that the submission was deleted successfully.
   */
  async deleteSubmission(@Param('id') id: string) {
    return await this.submissionService.deleteSubmission(id);
  }
}
