import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/?retryWrites=true&w=majority';

async function checkDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db('ctu_task_db');

    // Check team data
    const teamCollection = db.collection('ctu_team');
    const teamDoc = await teamCollection.findOne({ _id: 'shared_team_roster' });

    if (teamDoc && Array.isArray(teamDoc.team)) {
      console.log(`\n📋 TEAM DATA:`);
      console.log(`   Total members stored: ${teamDoc.team.length}`);
      console.log(`   Last updated: ${teamDoc.updatedAt || 'unknown'}`);
      const roles = {};
      teamDoc.team.forEach(m => { const r = m.role || 'NONE'; roles[r] = (roles[r]||0)+1; });
      console.log(`   Role breakdown:`, JSON.stringify(roles, null, 2));
      console.log(`   Sample (first 5):`, teamDoc.team.slice(0, 5).map(m => `${m.name} (${m.employeeId || m.id}) - ${m.role}`).join('\n     '));
    } else {
      console.log(`\n❌ TEAM DATA: No shared_team_roster document found in ctu_team collection`);
      const count = await teamCollection.countDocuments();
      console.log(`   Total documents in ctu_team: ${count}`);
      if (count > 0) {
        const sample = await teamCollection.find({}).limit(3).toArray();
        console.log(`   Sample docs:`, sample.map(d => d._id));
      }
    }

    // Check tasks data
    const tasksCollection = db.collection('ctu_tasks');
    const tasksDoc = await tasksCollection.findOne({ _id: 'shared_tasks_roster' });

    if (tasksDoc && Array.isArray(tasksDoc.tasks)) {
      console.log(`\n📌 TASKS DATA:`);
      console.log(`   Total tasks stored: ${tasksDoc.tasks.length}`);
      console.log(`   Last updated: ${tasksDoc.updatedAt || 'unknown'}`);
      console.log(`   Sample (first 3):`, tasksDoc.tasks.slice(0, 3).map(t => `${t.title} (stage: ${t.stage})`).join('\n     '));
    } else {
      console.log(`\n❌ TASKS DATA: No shared_tasks_roster document found in ctu_tasks collection`);
      const count = await tasksCollection.countDocuments();
      console.log(`   Total documents in ctu_tasks: ${count}`);
    }

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📂 All collections in ctu_task_db: ${collections.map(c => c.name).join(', ')}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.close();
  }
}

checkDatabase();
