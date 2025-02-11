import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import mongoose from 'mongoose';
import {
  Influencer,
  InfluencerSchema,
} from '../src/modules/influencers/influencer.schema';
import { User, UserSchema } from '../src/modules/users/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { InfluencerService } from '../src/modules/influencers/influencer.service';
import { InfluencerModule } from '../src/modules/influencers/influencer.module';

describe('InfluencerController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let influencerModel: Model<Influencer>;
  let userModel: Model<User>;
  let testInfluencer: Influencer;
  let influencerUser: User;
  let brandUser: User;
  let brandToken: string;
  let influencerToken: string;
  let authHeadersInfluencer: { Authorization: string };
  let authHeadersBrand: { Authorization: string };
  let jwtService: JwtService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Influencer.name, schema: InfluencerSchema },
          { name: User.name, schema: UserSchema },
        ]),
        InfluencerModule,
      ],
      providers: [InfluencerService, JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    influencerModel = moduleFixture.get<Model<Influencer>>(
      getModelToken(Influencer.name),
    );
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test users
    influencerUser = await userModel.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'influencer@example.com',
      password: 'password123',
      role: 'influencer',
    });

    brandUser = await userModel.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'brand@example.com',
      password: 'password123',
      role: 'brand',
    });

    // Mock authentication headers
    // Generate JWT tokens
    brandToken = jwtService.sign({ id: brandUser._id, role: 'brand' });
    influencerToken = jwtService.sign({
      id: influencerUser._id,
      role: 'influencer',
    });
    authHeadersInfluencer = { Authorization: `Bearer ${influencerToken}` };
    authHeadersBrand = { Authorization: `Bearer ${brandToken}` };

    // Create a test influencer
    testInfluencer = await influencerModel.create({
      name: 'John Doe',
      socialMediaHandle: '@johndoe',
      platform: 'Instagram',
      followersCount: 5000,
      user: influencerUser._id,
    });
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await app.close();
  });

  it('POST /influencers - should allow an influencer to create their profile', async () => {
    const response = await request(app.getHttpServer())
      .post('/influencers')
      .set(authHeadersInfluencer)
      .send({
        name: 'Jane Doe',
        socialMediaHandle: '@janedoe',
        platform: 'TikTok',
        followersCount: 10000,
        user: influencerUser._id.toString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Jane Doe');
  });

  it('POST /influencers - should allow brands to create influencers', async () => {
    const response = await request(app.getHttpServer())
      .post('/influencers')
      .set(authHeadersBrand)
      .send({
        name: 'Brand User',
        socialMediaHandle: '@branduser',
        platform: 'LinkedIn',
        followersCount: 500,
        user: brandUser._id.toString(),
      });

    expect(response.status).toBe(201);
  });

  it('GET /influencers - should allow brands to list influencers', async () => {
    const response = await request(app.getHttpServer())
      .get('/influencers')
      .set(authHeadersBrand);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /influencers/:id - should allow brands to view a specific influencer', async () => {
    const response = await request(app.getHttpServer())
      .get(`/influencers/${testInfluencer._id}`)
      .set(authHeadersBrand);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testInfluencer._id.toString());
  });

  it('PATCH /influencers/:id - should allow an influencer to update their own profile', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/influencers/${testInfluencer._id}`)
      .set(authHeadersInfluencer)
      .send({ followersCount: 15000 });

    expect(response.status).toBe(200);
    expect(response.body.followersCount).toBe(15000);
  });

  it('PATCH /influencers/:id - should deny access to brands for updating an influencer', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/influencers/${testInfluencer._id}`)
      .set(authHeadersBrand)
      .send({ followersCount: 20000 });

    expect(response.status).toBe(403); // Forbidden
  });

  it('DELETE /influencers/:id - should allow an influencer to delete their own profile', async () => {
    const newUser = await userModel.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'newUser@example.com',
      password: 'password123',
      role: 'influencer',
    });

    const newInfluencer = await influencerModel.create({
      name: 'To Be Deleted',
      socialMediaHandle: '@deleteMe',
      platform: 'YouTube',
      followersCount: 5000,
      user: newUser._id,
    });

    const newToken = await jwtService.sign({
      id: newUser._id,
      role: 'influencer',
    });
    const newAuthHeaders = { Authorization: `Bearer ${newToken}` };

    const response = await request(app.getHttpServer())
      .delete(`/influencers/${newInfluencer._id}`)
      .set(newAuthHeaders);

    expect(response.status).toBe(200);

    const checkResponse = await request(app.getHttpServer())
      .get(`/influencers/${newInfluencer._id}`)
      .set(authHeadersInfluencer);
    expect(checkResponse.status).toBe(404);
  });

  it('DELETE /influencers/:id - should deny brands from deleting an influencer', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/influencers/${testInfluencer._id}`)
      .set(authHeadersBrand);

    expect(response.status).toBe(403);
  });
});
