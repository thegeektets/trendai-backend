# TrendAI Backend

## Description
TrendAI is a platform that connects influencers with brands and SMEs. This backend, built with Nest.js, provides API endpoints for managing campaigns, influencer submissions, and brand interactions.

## Features
- **Campaign Management**: Brands can create and manage marketing campaigns.
- **Influencer Submissions**: Influencers can submit content for review.
- **Review & Approval System**: Brands can review and approve influencer submissions.
- **MongoDB Integration**: Data is stored and managed in a MongoDB database.
- **Authentication & Authorization**: Secure access control for different user roles.
- **File Upload Support**: Allow influencers to upload content.

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

## Seeding the Database
To seed the database with initial test data, run:
```bash
npx ts-node src/seeder.ts
```

## API Documentation
API endpoints and usage details are documented in Swagger. To view the API docs, run the server and visit:
```
http://localhost:8000/api
```

## Deployment
- **Backend**: Deployed on Google Cloud
- **Frontend**: Deployed on Vercel

## License
This project is licensed under the MIT License.

