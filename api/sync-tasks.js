import { getDatabase } from './db.js';

export default async function handler(req, res) {
  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();
    
    if (!db) {
      // Return 200 with empty array if MONGODB_URI not configured yet
      return res.status(200).json({ 
        tasks: [], 
        warning: 'MONGODB_URI is not configured in Vercel environment variables' 
      });
    }

    const collection = db.collection('ctu_tasks');

    if (req.method === 'POST') {
      const tasksData = req.body;
      if (!Array.isArray(tasksData)) {
        return res.status(400).json({ error: 'Body must be an array of tasks' });
      }

      // Upsert document with id 'shared_tasks_roster'
      await collection.updateOne(
        { _id: 'shared_tasks_roster' },
        { 
          $set: { 
            tasks: tasksData, 
            updatedAt: new Date().toISOString(),
            count: tasksData.length 
          } 
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true, count: tasksData.length });
    } else if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: 'shared_tasks_roster' });
      const tasks = doc && Array.isArray(doc.tasks) ? doc.tasks : [];
      return res.status(200).json({ tasks });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('MongoDB sync-tasks error:', error);
    return res.status(500).json({ error: error.message });
  }
}
