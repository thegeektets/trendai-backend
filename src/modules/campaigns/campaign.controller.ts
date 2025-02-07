import { Controller, Get } from '@nestjs/common';
import { CampaignService } from './campaign.service';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  getAllCampaigns() {
    return this.campaignService.getCampaigns();
  }
}
