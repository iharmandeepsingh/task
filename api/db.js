import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://harmanprab_db_user:zAoIwpKJA4ZnWJoR@cluster0.h5d3xpo.mongodb.net/?retryWrites=true&w=majority';
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase(dbName = 'ctu_task_db') {
  if (!clientPromise) {
    return null;
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
