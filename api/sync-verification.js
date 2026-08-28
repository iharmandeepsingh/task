const { getDatabase } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDatabase();
    const collection = db.collection('ctu_staff_verification');

    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try { bodyData = JSON.parse(bodyData); } catch (e) {}
      }

      // Action: Wipe All Pre-Authorized Records
      if (bodyData?.action === 'clear-all' || bodyData?.action === 'wipe-all') {
        const result = await collection.deleteMany({});
        return res.status(200).json({ success: true, deletedCount: result.deletedCount });
      }

      // Action: Bulk Delete Array of Staff IDs
      if (bodyData?.action === 'bulk-delete' || Array.isArray(bodyData?.deletedStaffIds)) {
        const staffIdsToDelete = bodyData.staffIds || bodyData.deletedStaffIds || [];
        if (Array.isArray(staffIdsToDelete) && staffIdsToDelete.length > 0) {
          const regexArray = staffIdsToDelete.map(id => new RegExp(`^${String(id).trim()}$`, 'i'));
          const result = await collection.deleteMany({ staffId: { $in: regexArray } });
          return res.status(200).json({ success: true, deletedCount: result.deletedCount });
        }
      }

      // Action: Single Delete / Remove
      if (bodyData?.action === 'remove' || bodyData?.action === 'delete') {
        const removeId = bodyData.staffId || bodyData.id;
        if (removeId) {
          const result = await collection.deleteOne({ 
            staffId: new RegExp(`^${String(removeId).trim()}$`, 'i') 
          });
          return res.status(200).json({ success: true, removed: removeId, deletedCount: result.deletedCount });
        }
      }

      const records = Array.isArray(bodyData) ? bodyData : (bodyData?.records || []);

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'No valid records provided' });
      }

      const bulkOps = records.map(record => ({
        updateOne: {
          filter: { staffId: record.staffId },
          update: { $set: { ...record, updatedAt: new Date().toISOString() } },
          upsert: true
        }
      }));

      await collection.bulkWrite(bulkOps);
      return res.status(200).json({ success: true, count: records.length });

    } else if (req.method === 'GET') {
      const records = await collection.find({}).toArray();
      return res.status(200).json({ records: records || [] });

    } else if (req.method === 'DELETE') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const staffId = url.searchParams.get('staffId');
      if (staffId) {
        await collection.deleteOne({ 
          staffId: new RegExp(`^${String(staffId).trim()}$`, 'i') 
        });
        return res.status(200).json({ success: true, deletedStaffId: staffId });
      }
      return res.status(400).json({ error: 'staffId is required' });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('sync-verification error:', error.message);
    return res.status(500).json({ error: error.message, records: [] });
  }
};
