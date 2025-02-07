import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

const MONGO_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'trendAI';

async function seedDatabase() {
  if (!MONGO_URI) {
    console.error('MongoDB URI is missing in the environment variables.');
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas!');

    const db = client.db(DATABASE_NAME);

    // Clear existing data
    await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('brands').deleteMany({}),
      db.collection('influencers').deleteMany({}),
      db.collection('campaigns').deleteMany({}),
      db.collection('submissions').deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Seed Users
    const usersCollection = db.collection('users');
    const users = Array.from({ length: 10 }, () => ({
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(['brand', 'influencer']),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const { insertedIds: userIds } = await usersCollection.insertMany(users);
    console.log('Seeded Users');

    // Seed Brands
    const brandsCollection = db.collection('brands');
    const brands = Array.from({ length: 5 }, (_, index) => ({
      name: faker.company.name(),
      industry: faker.helpers.arrayElement([
        'Fashion',
        'Tech',
        'Sportswear',
        'Beauty',
        'Food & Beverage',
      ]),
      website: faker.internet.url(),
      userId: Object.values(userIds)[index], // Link a user to a brand
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const { insertedIds: brandIds } = await brandsCollection.insertMany(brands);
    console.log('Seeded Brands');

    // Seed Influencers
    const influencersCollection = db.collection('influencers');
    const influencers = Array.from({ length: 10 }, (_, index) => ({
      name: faker.person.fullName(),
      socialMediaHandle: faker.internet.userName(),
      platform: faker.helpers.arrayElement(['Instagram', 'YouTube', 'TikTok']),
      followersCount: faker.number.int({ min: 1000, max: 1000000 }),
      userId: Object.values(userIds)[index + 5], // Link a user to an influencer
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const { insertedIds: influencerIds } =
      await influencersCollection.insertMany(influencers);
    console.log('Seeded Influencers');

    // Seed Campaigns
    const campaignsCollection = db.collection('campaigns');
    const campaigns = Array.from({ length: 10 }, () => ({
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      budget: parseFloat(
        faker.finance.amount({ min: 1000, max: 50000, dec: 2 }),
      ),
      startDate: faker.date.soon(),
      endDate: faker.date.future(),
      status: faker.helpers.arrayElement(['active', 'paused', 'completed']),
      brandId: faker.helpers.arrayElement(Object.values(brandIds)), // Link to brands
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const { insertedIds: campaignIds } =
      await campaignsCollection.insertMany(campaigns);
    console.log('Seeded Campaigns');

    // Seed Submissions
    const submissionsCollection = db.collection('submissions');
    const submissions = Array.from({ length: 20 }, () => ({
      campaignId: faker.helpers.arrayElement(Object.values(campaignIds)), // Link to campaigns
      influencerId: faker.helpers.arrayElement(Object.values(influencerIds)), // Link to influencers
      contentLink: faker.internet.url(),
      engagement: {
        likes: faker.number.int({ min: 10, max: 5000 }),
        comments: faker.number.int({ min: 5, max: 1000 }),
      },
      submittedAt: faker.date.recent(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await submissionsCollection.insertMany(submissions);
    console.log('Seeded Submissions');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

// Run the seeding script
seedDatabase();
