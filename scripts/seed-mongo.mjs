import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = 'mongodb+srv://harmanprab_db_user:zAoIwpKJA4ZnWJoR@cluster0.h5d3xpo.mongodb.net/?retryWrites=true&w=majority';
const dbFile = path.resolve('./shared_server_db.json');

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');

    const db = client.db('ctu_task_db');
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

    const teamCol = db.collection('ctu_team');
    const tasksCol = db.collection('ctu_tasks');

    console.log(`Uploading ${data.team.length} team members...`);
    await teamCol.updateOne(
      { _id: 'shared_team_roster' },
      { 
        $set: { 
          team: data.team, 
          updatedAt: new Date().toISOString(),
          count: data.team.length 
        } 
      },
      { upsert: true }
    );

    console.log(`Uploading ${data.tasks.length} tasks...`);
    await tasksCol.updateOne(
      { _id: 'shared_tasks_roster' },
      { 
        $set: { 
          tasks: data.tasks, 
          updatedAt: new Date().toISOString(),
          count: data.tasks.length 
        } 
      },
      { upsert: true }
    );

    console.log('🎉 Database seeding complete! MongoDB Atlas now contains all university tasks and faculty records.');
  } catch (err) {
    console.error('❌ Connection or seed error:', err);
  } finally {
    await client.close();
  }
}

seed();
