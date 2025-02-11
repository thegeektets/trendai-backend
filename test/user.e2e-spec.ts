import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema, UserRole } from '../src/modules/users/user.schema';
import { Brand, BrandSchema } from '../src/modules/brands/brand.schema';
import {
  Influencer,
  InfluencerSchema,
} from '../src/modules/influencers/influencer.schema';
import { AuthModule } from '../src/modules/auth/auth.module';
import { getConnectionToken } from '@nestjs/mongoose';

describe('User Management (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = await mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Brand.name, schema: BrandSchema },
          { name: Influencer.name, schema: InfluencerSchema },
        ]),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
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

  describe('User Registration', () => {
    it('should register a user without a brandId or influencerId', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
          role: UserRole.BRAND,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('testuser@example.com');
      expect(response.body.brandId).toBeUndefined();
      expect(response.body.influencerId).toBeUndefined();
    });

    it('should register a brand user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'branduser@example.com',
          password: 'password123',
          role: UserRole.BRAND,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('branduser@example.com');
      expect(response.body.role).toBe('brand');
    });

    it('should register a influencer user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'influenceruser@example.com',
          password: 'password123',
          role: UserRole.INFLUENCER,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('influenceruser@example.com');
      expect(response.body.role).toBe('influencer');
    });

    it('should reject duplicate email registration', async () => {
      await userModel.create({
        email: 'duplicate@example.com',
        password: 'password123',
        role: UserRole.BRAND,
      });

      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'duplicate@example.com',
          password: 'newpassword',
          role: UserRole.BRAND,
        });

      expect(response.status).toBe(400);
    });
  });
});
