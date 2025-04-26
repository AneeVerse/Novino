import mongoose from 'mongoose';

// Using a MongoDB Atlas cluster
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mayur:3QL1uhw5duQiKua2@cluster0.eeqwnze.mongodb.net/novino?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Define mongoose cache interface
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Define global with mongoose property
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 