const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harmanprab_db_user:zAoIwpKJA4ZnWJoR@cluster0.h5d3xpo.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0';

// Singleton cached client for serverless warm-start reuse
let client = null;

async function getDatabase(dbName = 'ctu_task_db') {
  if (!client) {
    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
  }
  return client.db(dbName);
}

module.exports = { getDatabase };
