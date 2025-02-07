import { MongooseModule } from '@nestjs/mongoose';

export const DatabaseModule = MongooseModule.forRoot(
  process.env.MONGO_URI || 'mongodb://localhost:27017/trendai',
);
