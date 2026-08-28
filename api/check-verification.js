const { getDatabase } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const staffId = url.searchParams.get('staffId');

    if (!staffId) {
      return res.status(400).json({ error: 'staffId parameter is required' });
    }

    const db = await getDatabase();
    const collection = db.collection('ctu_staff_verification');

    const cleanStaffId = String(staffId).trim();
    const record = await collection.findOne({
      staffId: new RegExp(`^${cleanStaffId}$`, 'i')
    });

    if (!record) {
      return res.status(200).json({ preAuthorized: false, record: null });
    }

    return res.status(200).json({
      preAuthorized: true,
      record: {
        staffId: record.staffId,
        name: record.name,
        email: record.email,
        department: record.department,
        category: record.category,
        role: record.role
      }
    });
  } catch (error) {
    console.error('check-verification error:', error.message);
    return res.status(500).json({ error: error.message, preAuthorized: false });
  }
};
