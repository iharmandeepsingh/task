const { getDatabase } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDatabase();
    const collection = db.collection('ctu_tasks');

    if (req.method === 'POST') {
      let tasksData = req.body;
      if (typeof tasksData === 'string') {
        try { tasksData = JSON.parse(tasksData); } catch (e) {}
      }
      if (!Array.isArray(tasksData)) {
        return res.status(400).json({ error: 'Body must be an array' });
      }
      await collection.updateOne(
        { _id: 'shared_tasks_roster' },
        { $set: { tasks: tasksData, updatedAt: new Date().toISOString(), count: tasksData.length } },
        { upsert: true }
      );
      return res.status(200).json({ success: true, count: tasksData.length });

    } else if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: 'shared_tasks_roster' });
      return res.status(200).json({ tasks: doc && Array.isArray(doc.tasks) ? doc.tasks : [] });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('sync-tasks error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
