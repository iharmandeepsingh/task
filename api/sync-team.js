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
        team: [], 
        warning: 'MONGODB_URI is not configured in Vercel environment variables' 
      });
    }

    const collection = db.collection('ctu_team');

    if (req.method === 'POST') {
      let teamData = req.body;
      if (typeof teamData === 'string') {
        try {
          teamData = JSON.parse(teamData);
        } catch (e) {}
      }

      if (!Array.isArray(teamData)) {
        return res.status(400).json({ error: 'Body must be an array of team members' });
      }

      // Upsert document with id 'shared_team_roster'
      await collection.updateOne(
        { _id: 'shared_team_roster' },
        { 
          $set: { 
            team: teamData, 
            updatedAt: new Date().toISOString(),
            count: teamData.length 
          } 
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true, count: teamData.length });
    } else if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: 'shared_team_roster' });
      const team = doc && Array.isArray(doc.team) ? doc.team : [];
      return res.status(200).json({ team });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('MongoDB sync-team error:', error);
    return res.status(500).json({ error: error.message });
  }
}
