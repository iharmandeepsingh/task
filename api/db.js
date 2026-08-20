const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://harmanprab_db_user:zAoIwpKJA4ZnWJoR@cluster0.h5d3xpo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const options = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  tls: true,
  tlsAllowInvalidCertificates: false,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
};

let cachedClient = null;

async function getDatabase(dbName = 'ctu_task_db') {
  if (cachedClient) {
    return cachedClient.db(dbName);
  }
  const client = new MongoClient(uri, options);
  await client.connect();
  cachedClient = client;
  return client.db(dbName);
}

module.exports = { getDatabase };
