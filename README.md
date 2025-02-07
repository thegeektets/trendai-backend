# TrendAI Backend

## Description

TrendAI is a platform that connects influencers with brands and SMEs. This backend, built with Nest.js, provides API endpoints for managing campaigns, influencer submissions, and brand interactions.

## Features

- **Campaign Management**: Brands can create and manage marketing campaigns.
- **Influencer Submissions**: Influencers can submit content for review.
- **MongoDB Integration**: Data is stored and managed in a MongoDB database.
- **Authentication & Authorization**: Secure access control for different user roles.
- **Role-Based Access Control (RBAC)**: Different access permissions for brands and influencers.
- **Submission Management**: Brands can manage influencer submissions and track progress.
- **Database Seeding**: Automatically populates the database with test data.

## Project Setup

```bash
# Install dependencies
npm install
```

## Running the Project

```bash
# Development mode
npm run start

# Watch mode (hot-reload)
npm run start:dev

# Production mode
npm run start:prod
```

## Database Setup

Ensure MongoDB is running locally:

```bash
mongod --dbpath /path/to/your/data/db
```

Or using Docker:

```bash
docker run --name mongo-local -p 27017:27017 -d mongo
```

## Environment Variables (.env)

```
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```

## Seeding the Database

To populate the database with test data, run:

```bash
npm run seed
```

This will create sample users, brands, influencers, campaigns, and submissions.

## Running Tests

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## API Endpoints

### Authentication

#### Login

**POST** `/auth/login`

##### Request Payload

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

##### Response

```json
{
  "message": "Login successful",
  "accessToken": "jwt_token_here",
  "user": {
    "id": "123456789",
    "email": "john@example.com",
    "role": "brand"
  }
}
```

### Users

#### Register User

**POST** `/users/register`

##### Request Payload

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "brand"
}
```

##### Response

```json
{
  "id": "123456789",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "brand"
}
```

### Brands

#### Create Brand

**POST** `/brands`

##### Request Payload

```json
{
  "name": "Brand X",
  "industry": "Fashion",
  "website": "https://brandx.com",
  "description": "A premium clothing brand"
}
```

##### Response

```json
{
  "id": "987654321",
  "name": "Brand X",
  "industry": "Fashion",
  "website": "https://brandx.com",
  "description": "A premium clothing brand"
}
```

### Influencers

#### Register Influencer

**POST** `/influencers`

##### Request Payload

```json
{
  "name": "Jane Doe",
  "socialMediaHandle": "@janedoe",
  "platform": "Instagram",
  "followersCount": 10000
}
```

##### Response

```json
{
  "id": "1122334455",
  "name": "Jane Doe",
  "socialMediaHandle": "@janedoe",
  "platform": "Instagram",
  "followersCount": 10000
}
```

### Campaigns

#### Create Campaign

**POST** `/campaigns`

##### Request Payload

```json
{
  "name": "Summer Promo",
  "description": "A summer-themed campaign",
  "budget": 5000,
  "startDate": "2025-06-01",
  "endDate": "2025-07-01",
  "status": "active"
}
```

##### Response

```json
{
  "id": "7766554433",
  "name": "Summer Promo",
  "description": "A summer-themed campaign",
  "budget": 5000,
  "startDate": "2025-06-01",
  "endDate": "2025-07-01",
  "status": "active"
}
```

### Submissions

#### Create Submission

**POST** `/submissions`

##### Request Payload

```json
{
  "campaignId": "9988776655",
  "influencer": "Jane Doe",
  "contentLink": "https://socialmedia.com/post/12345",
  "engagement": {
    "likes": 100,
    "comments": 20
  }
}
```

##### Response

```json
{
  "id": "5544332211",
  "campaignId": "9988776655",
  "influencer": "Jane Doe",
  "contentLink": "https://socialmedia.com/post/12345",
  "engagement": {
    "likes": 100,
    "comments": 20
  },
  "submittedAt": "2025-02-07T12:00:00.000Z"
}
```

## License

This project is licensed under the MIT License.
