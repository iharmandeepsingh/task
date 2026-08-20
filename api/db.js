const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://harmanprab_db_user:zAoIwpKJA4ZnWJoR@cluster0.h5d3xpo.mongodb.net/?retryWrites=true&w=majority';

let cachedClient = null;
let cachedDb = null;

async function getDatabase(dbName = 'ctu_task_db') {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
}

module.exports = { getDatabase };
