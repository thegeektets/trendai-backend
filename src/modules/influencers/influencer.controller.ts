import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { InfluencerService } from './influencer.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('influencers')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class InfluencerController {
  constructor(private readonly influencerService: InfluencerService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('brand', 'influencer')
  async create(@Body() data: CreateInfluencerDto) {
    return await this.influencerService.create(data);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('brand')
  async findAll() {
    return await this.influencerService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('brand', 'influencer')
  async findOne(@Param('id') id: string) {
    return await this.influencerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateInfluencerDto: UpdateInfluencerDto,
  ) {
    return await this.influencerService.update(id, updateInfluencerDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  async update(
    @Param('id') id: string,
    @Body() updateInfluencerDto: UpdateInfluencerDto,
  ) {
    return await this.influencerService.update(id, updateInfluencerDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  async remove(@Param('id') id: string) {
    return await this.influencerService.remove(id);
  }
}
