import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import {
  Campaign,
  CampaignSchema,
} from '../src/modules/campaigns/campaign.schema';
import { CampaignService } from '../src/modules/campaigns/campaign.service';
import { User, UserSchema } from '../src/modules/users/user.schema';
import { getConnectionToken } from '@nestjs/mongoose';

describe('CampaignController (e2e) - Role-Based Access', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let campaignModel: Model<Campaign>;
  let userModel: Model<User>;
  let jwtService: JwtService;

  let brandUser: User;
  let influencerUser: User;
  let brandToken: string;
  let influencerToken: string;
  let createdCampaignId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test_secret',
          signOptions: { expiresIn: '1h' },
        }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Campaign.name, schema: CampaignSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      providers: [CampaignService, JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    campaignModel = moduleFixture.get<Model<Campaign>>(
      getModelToken(Campaign.name),
    );
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test users
    brandUser = await userModel.create({
      email: 'brand@example.com',
      password: 'password123',
      role: 'brand',
    });

    influencerUser = await userModel.create({
      email: 'influencer@example.com',
      password: 'password456',
      role: 'influencer',
    });

    // Generate JWT tokens
    brandToken = jwtService.sign(
      { id: brandUser._id, role: 'brand' },
      { secret: 'test_secret' },
    );
    influencerToken = jwtService.sign(
      { id: influencerUser._id, role: 'influencer' },
      { secret: 'test_secret' },
    );
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await app.close();
  });

  it('POST /campaigns - should allow a brand user to create a campaign', async () => {
    const response = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        name: 'AI Marketing Campaign',
        description: 'A campaign to promote AI products',
        budget: 5000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        status: 'active',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('AI Marketing Campaign');

    createdCampaignId = response.body._id;
  });

  it('POST /campaigns - should deny access to an influencer user', async () => {
    const response = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${influencerToken}`)
      .send({
        name: 'Influencer Campaign',
        description: 'A campaign for influencers',
        budget: 3000,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You do not have permission to access this resource',
    );
  });

  it('GET /campaigns - should allow both brand and influencer users to view campaigns', async () => {
    const responseBrand = await request(app.getHttpServer())
      .get('/campaigns')
      .set('Authorization', `Bearer ${brandToken}`);

    const responseInfluencer = await request(app.getHttpServer())
      .get('/campaigns')
      .set('Authorization', `Bearer ${influencerToken}`);

    expect(responseBrand.status).toBe(200);
    expect(responseBrand.body.length).toBeGreaterThan(0);
    expect(responseInfluencer.status).toBe(200);
    expect(responseInfluencer.body.length).toBeGreaterThan(0);
  });

  it('GET /campaigns/:id - should return a specific campaign', async () => {
    const response = await request(app.getHttpServer())
      .get(`/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(createdCampaignId);
  });

  it('PATCH /campaigns/:id - should allow a brand user to update a campaign', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${brandToken}`)
      .send({ budget: 10000 });

    expect(response.status).toBe(200);
    expect(response.body.budget).toBe(10000);
  });

  it('PATCH /campaigns/:id - should deny an influencer from updating a campaign', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${influencerToken}`)
      .send({ budget: 20000 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You do not have permission to access this resource',
    );
  });

  it('DELETE /campaigns/:id - should allow a brand user to delete a campaign', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Campaign deleted successfully');

    const checkResponse = await request(app.getHttpServer())
      .get(`/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(checkResponse.status).toBe(404);
  });

  it('DELETE /campaigns/:id - should deny an influencer from deleting a campaign', async () => {
    // Create a new campaign to test deletion attempt
    const newCampaign = await campaignModel.create({
      name: 'Test Campaign',
      description: 'This is a test campaign',
      budget: 5000,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      status: 'active',
    });

    const response = await request(app.getHttpServer())
      .delete(`/campaigns/${newCampaign._id}`)
      .set('Authorization', `Bearer ${influencerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You do not have permission to access this resource',
    );
  });
});
