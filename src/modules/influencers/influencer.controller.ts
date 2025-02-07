import {
  Controller,
  Get,
  Post,
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
  create(@Body() createInfluencerDto: CreateInfluencerDto) {
    return this.influencerService.create(createInfluencerDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('brand')
  findAll() {
    return this.influencerService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('brand', 'influencer')
  findOne(@Param('id') id: string) {
    return this.influencerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  update(
    @Param('id') id: string,
    @Body() updateInfluencerDto: UpdateInfluencerDto,
  ) {
    return this.influencerService.update(id, updateInfluencerDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('influencer')
  remove(@Param('id') id: string) {
    return this.influencerService.remove(id);
  }
}
