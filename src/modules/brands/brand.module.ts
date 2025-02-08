import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { Brand, BrandSchema } from './brand.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [MongooseModule, BrandService],
})
export class BrandsModule {}
