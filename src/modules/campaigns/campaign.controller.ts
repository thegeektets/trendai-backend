import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('campaigns')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async getAllCampaigns() {
    return await this.campaignService.getCampaigns();
  }

  @Get(':id')
  async getCampaign(@Param('id') id: string) {
    return await this.campaignService.getCampaignById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('brand')
  async createCampaign(@Body() data: CreateCampaignDto) {
    return await this.campaignService.createCampaign(data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('brand')
  async updateCampaign(
    @Param('id') id: string,
    @Body() data: UpdateCampaignDto,
  ) {
    return await this.campaignService.updateCampaign(id, data);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('brand')
  async partiallyUpdateCampaign(
    @Param('id') id: string,
    @Body() data: UpdateCampaignDto,
  ) {
    return await this.campaignService.updateCampaign(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('brand')
  async deleteCampaign(@Param('id') id: string) {
    return await this.campaignService.deleteCampaign(id);
  }
}
