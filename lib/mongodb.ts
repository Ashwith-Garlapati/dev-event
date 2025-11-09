import mongoose from 'mongoose';

// Define the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global type to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Initialize the cached connection object
let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

// Cache the connection globally to persist across hot reloads
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * Returns the cached connection if it exists, otherwise creates a new one
 * @returns {Promise<typeof mongoose>} The Mongoose instance
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    // Throw an error if the connection string is not defined
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset the promise on error to allow retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
