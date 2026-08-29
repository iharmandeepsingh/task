import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/?retryWrites=true&w=majority';


async function checkLiveDatabase() {
  console.log('Connecting to your MongoDB Atlas Cluster...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connection Status: CONNECTED & ONLINE');

    const db = client.db('ctu_task_db');
    const collections = await db.listCollections().toArray();
    console.log('Collections Found:', collections.map(c => c.name));

    const teamCol = db.collection('ctu_team');
    const tasksCol = db.collection('ctu_tasks');

    const teamDoc = await teamCol.findOne({ _id: 'shared_team_roster' });
    const tasksDoc = await tasksCol.findOne({ _id: 'shared_tasks_roster' });

    console.log('\n--- LIVE DATABASE METRICS ---');
    console.log(`👥 Faculty & Admin Profiles in MongoDB: ${teamDoc?.team?.length || 0} users`);
    console.log(`📋 Active Tasks in MongoDB: ${tasksDoc?.tasks?.length || 0} tasks`);
    console.log(`🕒 Last Updated Timestamp: ${tasksDoc?.updatedAt || 'N/A'}`);

    if (tasksDoc?.tasks?.length > 0) {
      console.log('\nSample Tasks Stored in MongoDB:');
      tasksDoc.tasks.slice(0, 3).forEach((t, i) => {
        console.log(`  ${i+1}. [${t.id}] "${t.title}" (Stage: ${t.stage}, Assignee: ${t.assigneeName})`);
      });
    }

    if (teamDoc?.team?.length > 0) {
      console.log('\nSample Faculty Stored in MongoDB:');
      teamDoc.team.slice(0, 3).forEach((m, i) => {
        console.log(`  ${i+1}. ${m.name} (Emp ID: ${m.employeeId}, Role: ${m.role})`);
      });
    }

    console.log('\n✅ ALL SYSTEMS OPERATIONAL: The app is 100% connected to MongoDB Atlas!');
  } catch (error) {
    console.error('❌ Connection Check Failed:', error);
  } finally {
    await client.close();
  }
}

checkLiveDatabase();
