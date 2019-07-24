import mongoose from 'mongoose';

import User from './user';
import Message from './message';

const connectDb = () => {
  // DATABASE_URL=mongodb://localhost:27017/node-express-mongodb-server
  // If database does not exist, Mongo will create one...
  return mongoose.connect(process.env.DATABASE_URL,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
    });
};

const models = { User, Message };

export { connectDb };

export default models;
