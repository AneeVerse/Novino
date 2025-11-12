import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env.local file');
}

interface MongoClientCache {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

declare global {
  var mongoClientCache: MongoClientCache | undefined;
}

let cached: MongoClientCache = global.mongoClientCache || {
  client: null,
  db: null,
  promise: null,
};

if (!global.mongoClientCache) {
  global.mongoClientCache = cached;
}

export async function connectToMongoDB() {
  // Return cached connection if it exists
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Create new connection
  cached.promise = (async () => {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10, // Maximum connection pool size
      minPoolSize: 2,  // Minimum connection pool size
      maxIdleTimeMS: 60000, // Close connections after 60 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if unable to connect
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    await client.connect();
    const db = client.db(MONGODB_DB);
    
    console.log('✓ Connected to MongoDB with connection pooling');

    cached.client = client;
    cached.db = db;

    return { client, db };
  })();

  try {
    const result = await cached.promise;
    return result;
  } catch (error) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export default connectToMongoDB;

