import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../users/user.service';
import { Brand, BrandDocument } from '../brands/brand.schema';
import {
  Influencer,
  InfluencerDocument,
} from '../influencers/influencer.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(Influencer.name)
    private influencerModel: Model<InfluencerDocument>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { id: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    let profileData = null;

    // Fetch additional data based on role
    if (user.role === 'brand') {
      profileData = await this.brandModel
        .findOne({ users: { $in: [user._id.toString()] } })
        .exec();
    } else if (user.role === 'influencer') {
      profileData = await this.influencerModel
        .findOne({ user: user._id.toString() })
        .exec();
    }

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: profileData,
      },
    };
  }
}
