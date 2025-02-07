/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Submission,
  SubmissionSchema,
} from '../src/modules/submissions/submission.schema';
import { User, UserSchema } from '../src/modules/users/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { SubmissionsModule } from '../src/modules/submissions/submission.module';
import { JwtService } from '@nestjs/jwt';
import { SubmissionService } from '../src/modules/submissions/submission.service';

describe('SubmissionController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let submissionModel: Model<Submission>;
  let userModel: Model<User>;
  let createdSubmissionId: string;
  let influencerUser: User;
  let brandUser: User;
  let authHeadersInfluencer: { Authorization: string };
  let authHeadersBrand: { Authorization: string };
  let jwtService: JwtService;
  let brandToken: string;
  let influencerToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = await mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Submission.name, schema: SubmissionSchema },
          { name: User.name, schema: UserSchema },
        ]),
        SubmissionsModule,
      ],
      providers: [SubmissionService, JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    submissionModel = moduleFixture.get<Model<Submission>>(
      getModelToken(Submission.name),
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

    // Generate JWT tokens
    brandToken = jwtService.sign({ id: brandUser._id, role: 'brand' });
    influencerToken = jwtService.sign({
      id: influencerUser._id,
      role: 'influencer',
    });

    // Mock authentication headers
    authHeadersInfluencer = { Authorization: `Bearer ${influencerToken}` };
    authHeadersBrand = { Authorization: `Bearer ${brandToken}` };
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    if (app) {
      await app.close();
    }
  });

  it('POST /submissions - should allow an influencer to create a submission', async () => {
    const response = await request(app.getHttpServer())
      .post('/submissions')
      .set(authHeadersInfluencer)
      .send({
        campaignId: new mongoose.Types.ObjectId().toString(),
        influencer: influencerUser._id.toString(),
        contentLink: 'https://example.com/post',
        engagement: { likes: 100, comments: 20 },
        submittedAt: new Date(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.influencer).toBe(influencerUser._id.toString());

    createdSubmissionId = response.body._id;
  });

  it('POST /submissions - should prevent a brand from creating a submission', async () => {
    const response = await request(app.getHttpServer())
      .post('/submissions')
      .set(authHeadersBrand)
      .send({
        campaignId: new mongoose.Types.ObjectId().toString(),
        influencer: influencerUser._id.toString(),
        contentLink: 'https://example.com/post',
        engagement: { likes: 100, comments: 20 },
        submittedAt: new Date(),
      });

    expect(response.status).toBe(403); // Forbidden for brand role
  });

  it('GET /submissions - should allow an influencer to retrieve all submissions', async () => {
    const response = await request(app.getHttpServer())
      .get('/submissions')
      .set(authHeadersInfluencer);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /submissions - should allow a brand to retrieve all submissions', async () => {
    const response = await request(app.getHttpServer())
      .get('/submissions')
      .set(authHeadersBrand);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /submissions/:id - should allow an influencer to retrieve their submission', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/${createdSubmissionId}`)
      .set(authHeadersInfluencer);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(createdSubmissionId);
  });

  it('GET /submissions/:id - should allow a brand to retrieve a submission', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/${createdSubmissionId}`)
      .set(authHeadersBrand);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(createdSubmissionId);
  });

  it('PUT /submissions/:id - should allow an influencer to update their submission', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/submissions/${createdSubmissionId}`)
      .set(authHeadersInfluencer)
      .send({ engagement: { likes: 200, comments: 40 } });

    expect(response.status).toBe(200);
    expect(response.body.engagement.likes).toBe(200);
    expect(response.body.engagement.comments).toBe(40);
  });

  it('PUT /submissions/:id - should prevent a brand from updating a submission', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/submissions/${createdSubmissionId}`)
      .set(authHeadersBrand)
      .send({ engagement: { likes: 300, comments: 50 } });

    expect(response.status).toBe(403); // Forbidden for brand role
  });

  it('DELETE /submissions/:id - should allow an influencer to delete their submission', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/submissions/${createdSubmissionId}`)
      .set(authHeadersInfluencer);
    expect(response.status).toBe(200);

    // Verify deletion
    const checkResponse = await request(app.getHttpServer())
      .get(`/submissions/${createdSubmissionId}`)
      .set(authHeadersInfluencer);

    expect(checkResponse.status).toBe(404);
  });

  it('DELETE /submissions/:id - should prevent a brand from deleting a submission', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/submissions/${createdSubmissionId}`)
      .set(authHeadersBrand);

    expect(response.status).toBe(403); // Forbidden for brand role
  });
});
