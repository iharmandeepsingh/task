const { getDatabase } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDatabase();
    const collection = db.collection('ctu_team');

    if (req.method === 'POST') {
      let teamData = req.body;
      if (typeof teamData === 'string') {
        try { teamData = JSON.parse(teamData); } catch (e) {}
      }
      if (!Array.isArray(teamData)) {
        return res.status(400).json({ error: 'Body must be an array' });
      }

      // Upsert individual member records
      const bulkOps = teamData.map(m => {
        const empId = String(m.employeeId || m.id || '').trim();
        return {
          updateOne: {
            filter: { employeeId: empId },
            update: { $set: { ...m, employeeId: empId, updatedAt: new Date().toISOString() } },
            upsert: true
          }
        };
      });

      if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps);
      }

      return res.status(200).json({ success: true, count: teamData.length });

    } else if (req.method === 'GET') {
      // Fetch all registered active team member documents
      const docs = await collection.find({ _id: { $ne: 'shared_team_roster' } }).toArray();
      return res.status(200).json({ success: true, team: docs || [] });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('sync-team error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
