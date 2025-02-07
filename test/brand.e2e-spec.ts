import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Brand, BrandSchema } from '../src/modules/brands/brand.schema';
import { User, UserSchema } from '../src/modules/users/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandService } from '../src/modules/brands/brand.service';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/mongoose';

describe('BrandController (e2e) - Role-Based Access', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let brandModel: Model<Brand>;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let brandUser: User;
  let influencerUser: User;
  let brandToken: string;
  let influencerToken: string;
  let testBrand: Brand;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Brand.name, schema: BrandSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      providers: [BrandService, JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    brandModel = moduleFixture.get<Model<Brand>>(getModelToken(Brand.name));
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test users with roles
    brandUser = await userModel.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'brand@example.com',
      password: 'password123',
      role: 'brand',
    });

    influencerUser = await userModel.create({
      _id: new mongoose.Types.ObjectId(),
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

    // Create a brand for update/delete tests
    testBrand = await brandModel.create({
      name: 'Adidas',
      industry: 'Sportswear',
      website: 'https://adidas.com',
      users: [brandUser._id],
    });
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await app.close();
  });

  it('POST /brands should allow a brand user to create a brand', async () => {
    const response = await request(app.getHttpServer())
      .post('/brands')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        name: 'Nike',
        industry: 'Sportswear',
        website: 'https://nike.com',
        users: [brandUser._id.toString()],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Nike');
  });

  it('POST /brands should deny access to an influencer user', async () => {
    const response = await request(app.getHttpServer())
      .post('/brands')
      .set('Authorization', `Bearer ${influencerToken}`)
      .send({
        name: 'Puma',
        industry: 'Sportswear',
        website: 'https://puma.com',
        users: [influencerUser._id.toString()],
      });

    expect(response.status).toBe(403); // Forbidden
    expect(response.body.message).toBe(
      'You do not have permission to access this resource',
    );
  });

  it('GET /brands should allow both brand and influencer users to view brands', async () => {
    const responseBrand = await request(app.getHttpServer())
      .get('/brands')
      .set('Authorization', `Bearer ${brandToken}`);

    const responseInfluencer = await request(app.getHttpServer())
      .get('/brands')
      .set('Authorization', `Bearer ${influencerToken}`);

    expect(responseBrand.status).toBe(200);
    expect(responseBrand.body.length).toBeGreaterThan(0);
    expect(responseInfluencer.status).toBe(200);
    expect(responseInfluencer.body.length).toBeGreaterThan(0);
  });

  it('PATCH /brands/:id should allow a brand user to update their brand', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/brands/${testBrand._id}`)
      .set('Authorization', `Bearer ${brandToken}`)
      .send({ name: 'Adidas Updated' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Adidas Updated');
  });

  it('PATCH /brands/:id should deny access to an influencer user', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/brands/${testBrand._id}`)
      .set('Authorization', `Bearer ${influencerToken}`)
      .send({ name: 'Puma Updated' });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You do not have permission to access this resource',
    );
  });

  it('DELETE /brands/:id should allow a brand user to delete their brand', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/brands/${testBrand._id}`)
      .set('Authorization', `Bearer ${brandToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Brand deleted successfully');
  });

  it('DELETE /brands/:id should deny access to an influencer user', async () => {
    const newBrand = await brandModel.create({
      name: 'Reebok',
      industry: 'Sportswear',
      website: 'https://reebok.com',
      users: [brandUser._id],
    });

    const response = await request(app.getHttpServer())
      .delete(`/brands/${newBrand._id}`)
      .set('Authorization', `Bearer ${influencerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You do not have permission to access this resource',
    );
  });
});
