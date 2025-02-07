import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    return this.brandModel.create(createBrandDto);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandModel.find().exec();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id).exec();
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandModel
      .findByIdAndUpdate(id, updateBrandDto, { new: true })
      .exec();
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.brandModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Brand not found');
    }

    return { message: 'Brand deleted successfully' };
  }
}
