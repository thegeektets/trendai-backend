import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../src/modules/users/user.schema';
import { AuthModule } from '../src/modules/auth/auth.module';
import * as bcrypt from 'bcrypt';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AuthModule, // Import Auth Module
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Enable validation
    await app.init();

    connection = moduleFixture.get(getConnectionToken());
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await app.close();
  });

  const userData = {
    email: 'testuser@example.com',
    password: 'password123',
    role: 'influencer',
  };

  beforeEach(async () => {
    // Clear the database before each test
    await userModel.deleteMany({});
  });

  it('POST /auth/login should authenticate the user', async () => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await userModel.create({ ...userData, password: hashedPassword });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('POST /auth/login should fail with incorrect password', async () => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await userModel.create({ ...userData, password: hashedPassword });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userData.email, password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });

  it('POST /auth/login should fail for non-existent user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'unknown@example.com', password: 'password123' });

    expect(response.status).toBe(401);
  });
});
