import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply authentication & role-based access
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Roles('brand') // Only brands can create brands
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @Roles('user', 'influencer', 'brand') // Anyone can list brands
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @Roles('brand') // Only brands can fetch specific brand details
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @Roles('brand') // Only brands can update their details
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Roles('brand') // Only brands can delete their data
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
