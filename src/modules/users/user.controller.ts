import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post(':userId/link-brand/:brandId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand', 'influencer')
  async linkBrand(
    @Param('userId') userId: string,
    @Param('brandId') brandId: string,
  ) {
    return this.userService.linkBrandToUser(userId, brandId);
  }

  @Post(':userId/link-influencer/:influencerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand', 'influencer')
  async linkInfluencer(
    @Param('userId') userId: string,
    @Param('influencerId') influencerId: string,
  ) {
    return this.userService.linkInfluencerToUser(userId, influencerId);
  }
}
