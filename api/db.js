const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0';

// For Vercel serverless: create a fresh client per invocation but reuse within warm instance
let cachedClient = null;

async function getDatabase(dbName = 'ctu_task_db') {
  // If cached client exists and is still connected, reuse it
  if (cachedClient) {
    try {
      // Ping to check if still alive
      await cachedClient.db('admin').command({ ping: 1 });
      return cachedClient.db(dbName);
    } catch (e) {
      // Connection is dead — reset and reconnect
      cachedClient = null;
    }
  }

  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  await client.connect();
  cachedClient = client;
  return client.db(dbName);
}

module.exports = { getDatabase };
