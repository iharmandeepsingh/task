const { getDatabase } = require('./db');

const PROTECTED_ADMIN_IDS = ['24051', '17572', '10001', '001'];

function normalizeStaffId(id) {
  if (id === null || id === undefined) return '';
  return String(id).trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();
    const verCollection = db.collection('ctu_staff_verification');
    const teamCollection = db.collection('ctu_team');

    // =========================================================================
    // GET /api/check-verification?staffId=...
    // Pre-Registration eligibility check & autofill lookup
    // =========================================================================
    if (req.method === 'GET') {
      let staffId = '';
      try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        staffId = normalizeStaffId(url.searchParams.get('staffId'));
      } catch (err) {
        // Fallback parameter extraction
        const queryIdx = req.url.indexOf('?');
        if (queryIdx !== -1) {
          const params = new URLSearchParams(req.url.slice(queryIdx));
          staffId = normalizeStaffId(params.get('staffId'));
        }
      }

      // If no staffId passed or empty query, return clean 200 without console error
      if (!staffId) {
        return res.status(200).json({
          success: true,
          preAuthorized: false,
          empty: true,
          message: 'No staffId provided'
        });
      }

      const record = await verCollection.findOne({
        staffId: new RegExp(`^${staffId}$`, 'i')
      });

      if (!record) {
        return res.status(200).json({
          success: true,
          preAuthorized: false,
          notFound: true,
          message: `Staff ID "${staffId}" was not found in the Pre-Authorization Directory.`
        });
      }

      const isAlreadyActive = record.status === 'Active' || record.status === 'Verified' || PROTECTED_ADMIN_IDS.includes(record.staffId);

      if (isAlreadyActive) {
        return res.status(200).json({
          success: true,
          preAuthorized: false,
          alreadyActive: true,
          message: `Staff ID "${record.staffId}" is already an active registered account. Please sign in with your password.`,
          record: {
            staffId: record.staffId,
            name: record.name,
            email: record.email,
            department: record.department,
            category: record.category,
            role: record.role,
            status: 'Active'
          }
        });
      }

      // Record is in Pre-Authorized state -> Eligible for self-registration!
      return res.status(200).json({
        success: true,
        preAuthorized: true,
        alreadyActive: false,
        record: {
          staffId: record.staffId,
          name: record.name,
          email: record.email,
          phone: record.phone || '',
          department: record.department,
          category: record.category,
          role: record.role,
          status: 'Pre-Authorized'
        }
      });
    }

    // =========================================================================
    // POST /api/check-verification -> Atomic Self-Registration & Account Activation
    // =========================================================================
    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try { bodyData = JSON.parse(bodyData); } catch (e) {}
      }

      const staffId = normalizeStaffId(bodyData?.staffId || bodyData?.employeeId || bodyData?.id);
      const password = String(bodyData?.password || '').trim();
      const name = String(bodyData?.name || '').trim();
      const email = String(bodyData?.email || '').trim();
      const phone = String(bodyData?.phone || '').trim();
      const dept = String(bodyData?.dept || bodyData?.department || '').trim();

      if (!staffId) {
        return res.status(400).json({ success: false, error: 'Staff ID is required for registration.' });
      }
      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required for registration.' });
      }

      // 1. Verify eligibility in ctu_staff_verification
      const verRecord = await verCollection.findOne({
        staffId: new RegExp(`^${staffId}$`, 'i')
      });

      if (!verRecord) {
        return res.status(403).json({
          success: false,
          error: `Registration rejected: Staff ID "${staffId}" is not pre-authorized in the Master Directory. Please contact Super Admin.`
        });
      }

      // 2. Prevent duplicate re-registration if already active with a set password
      if (verRecord.status === 'Active' && !PROTECTED_ADMIN_IDS.includes(verRecord.staffId)) {
        const existingTeamUser = await teamCollection.findOne({
          employeeId: new RegExp(`^${staffId}$`, 'i')
        });
        if (existingTeamUser && existingTeamUser.password) {
          return res.status(409).json({
            success: false,
            error: `An active account with Staff ID "${staffId}" already exists. Please log in with your credentials.`
          });
        }
      }

      const finalCategory = verRecord.category || (PROTECTED_ADMIN_IDS.includes(staffId) ? 'Admin' : 'Faculty');
      const finalRole = verRecord.role || (finalCategory === 'Admin' ? 'Administrative Staff' : 'Faculty Member');
      const finalDept = dept || verRecord.department || 'School of Engineering & Technology';
      const finalName = name || verRecord.name || `Staff Member ${staffId}`;
      const finalEmail = email || verRecord.email || `${staffId}@ctu.edu.in`;

      // 3. Update status to 'Active' in authoritative ctu_staff_verification
      await verCollection.updateOne(
        { staffId: verRecord.staffId },
        {
          $set: {
            status: 'Active',
            name: finalName,
            email: finalEmail,
            phone: phone || verRecord.phone || '',
            department: finalDept,
            category: finalCategory,
            role: finalRole,
            activatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      );

      // 4. Synchronize into operational ctu_team roster for task assignments & login
      const initials = finalName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
      const teamUserDoc = {
        id: `usr-${staffId}`,
        employeeId: staffId,
        name: finalName,
        email: finalEmail,
        phone: phone || verRecord.phone || '',
        password: password,
        role: finalRole,
        category: finalCategory,
        dept: finalDept,
        avatar: initials,
        status: 'Active',
        hasAccount: true,
        source: 'SELF_REGISTRATION',
        activatedAt: new Date().toISOString()
      };

      await teamCollection.updateOne(
        { employeeId: staffId },
        { $set: teamUserDoc },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: `Account activated successfully for ${finalName}!`,
        user: {
          id: teamUserDoc.id,
          employeeId: staffId,
          name: finalName,
          email: finalEmail,
          category: finalCategory,
          role: finalRole,
          dept: finalDept,
          avatar: initials,
          status: 'Active'
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('check-verification error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
