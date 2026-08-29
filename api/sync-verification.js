const { getDatabase } = require('./db');

const PROTECTED_ADMIN_IDS = ['24051', '17572', '10001', '001'];

// Helper to normalize staff IDs (treat as string, trim whitespace, preserve leading zeros like "001")
function normalizeStaffId(id) {
  if (id === null || id === undefined) return '';
  const s = String(id).trim();
  // Reject headers accidentally passed as IDs
  const lower = s.toLowerCase();
  if (lower === 'emp id' || lower === 'emp code' || lower === 'staff id' || lower === 'id' || lower === 'sno' || lower === 'sr no' || lower === 'code') {
    return '';
  }
  return s;
}

// Helper to derive category
function deriveCategory(cat, role) {
  const c = String(cat || '').trim();
  if (c.toLowerCase() === 'admin') return 'Admin';
  if (c.toLowerCase() === 'faculty') return 'Faculty';
  const r = String(role || '').toLowerCase();
  if (r.includes('admin') || r.includes('hr') || r.includes('registrar') || r.includes('accountant') || r.includes('finance')) {
    return 'Admin';
  }
  return 'Faculty';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDatabase();
    const collection = db.collection('ctu_staff_verification');

    // =========================================================================
    // GET /api/sync-verification -> Return all staff records from source of truth
    // =========================================================================
    if (req.method === 'GET') {
      const records = await collection.find({}).sort({ staffId: 1 }).toArray();
      return res.status(200).json({
        success: true,
        records: records || [],
        total: records.length
      });
    }

    // =========================================================================
    // POST /api/sync-verification -> Upsert, Bulk Delete, Wipe, or Remove
    // =========================================================================
    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try { bodyData = JSON.parse(bodyData); } catch (e) {}
      }

      // --- ACTION 1: WIPE ALL (protecting 4 permanent super admins) ---
      if (bodyData?.action === 'clear-all' || bodyData?.action === 'wipe-all') {
        const deleteFilter = {
          staffId: { $nin: PROTECTED_ADMIN_IDS }
        };
        const result = await collection.deleteMany(deleteFilter);
        return res.status(200).json({
          success: true,
          deletedCount: result.deletedCount,
          protectedCount: PROTECTED_ADMIN_IDS.length,
          message: `Successfully wiped ${result.deletedCount} pre-authorized records. Protected ${PROTECTED_ADMIN_IDS.length} Super Admin records.`
        });
      }

      // --- ACTION 2: BULK DELETE ---
      if (bodyData?.action === 'bulk-delete' || Array.isArray(bodyData?.deletedStaffIds)) {
        const rawIds = bodyData.staffIds || bodyData.deletedStaffIds || [];
        const normalizedIds = rawIds.map(normalizeStaffId).filter(Boolean);
        
        // Filter out protected super admins
        const allowedToDelete = normalizedIds.filter(id => !PROTECTED_ADMIN_IDS.includes(id));
        const protectedAttempted = normalizedIds.filter(id => PROTECTED_ADMIN_IDS.includes(id));

        if (allowedToDelete.length === 0) {
          if (protectedAttempted.length > 0) {
            return res.status(403).json({
              success: false,
              error: 'Cannot delete permanent Super Admin accounts.',
              protectedIds: protectedAttempted
            });
          }
          return res.status(400).json({ success: false, error: 'No valid staff IDs provided for deletion' });
        }

        const regexArray = allowedToDelete.map(id => new RegExp(`^${id}$`, 'i'));
        const result = await collection.deleteMany({ staffId: { $in: regexArray } });

        return res.status(200).json({
          success: true,
          deletedCount: result.deletedCount,
          protectedCount: protectedAttempted.length,
          protectedIds: protectedAttempted
        });
      }

      // --- ACTION 3: SINGLE DELETE ---
      if (bodyData?.action === 'remove' || bodyData?.action === 'delete') {
        const rawId = bodyData.staffId || bodyData.id;
        const cleanId = normalizeStaffId(rawId);

        if (!cleanId) {
          return res.status(400).json({ success: false, error: 'Valid staffId is required for deletion' });
        }

        if (PROTECTED_ADMIN_IDS.includes(cleanId)) {
          return res.status(403).json({
            success: false,
            error: `Staff ID "${cleanId}" is a protected permanent Super Admin and cannot be deleted.`
          });
        }

        const result = await collection.deleteOne({
          staffId: new RegExp(`^${cleanId}$`, 'i')
        });

        return res.status(200).json({
          success: true,
          deletedStaffId: cleanId,
          deletedCount: result.deletedCount
        });
      }

      // --- ACTION 4: BULK UPSERT STAFF RECORDS ---
      const rawRecords = Array.isArray(bodyData) ? bodyData : (bodyData?.records || []);

      if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid records array provided in payload' });
      }

      const errors = [];
      const validRecords = [];
      const seenUploadIds = new Set();

      rawRecords.forEach((row, idx) => {
        const staffId = normalizeStaffId(row.staffId || row.empId || row.employeeId);
        const name = String(row.name || row.displayName || '').trim();

        if (!staffId) {
          errors.push({ row: idx + 1, staffId: '', reason: 'Missing or invalid Staff ID' });
          return;
        }
        if (!name) {
          errors.push({ row: idx + 1, staffId, reason: 'Missing required staff Name' });
          return;
        }

        if (seenUploadIds.has(staffId.toLowerCase())) {
          errors.push({ row: idx + 1, staffId, reason: 'Duplicate Staff ID within the uploaded file' });
          return;
        }
        seenUploadIds.add(staffId.toLowerCase());

        const category = deriveCategory(row.category, row.role || row.designation);
        const department = String(row.department || row.dept || (category === 'Admin' ? 'University Administration' : 'School of Engineering & Technology')).trim();
        const role = String(row.role || row.designation || (category === 'Admin' ? 'Administrative Staff' : 'Faculty Member')).trim();
        const email = String(row.email || '').trim();
        const phone = String(row.phone || row.contactNo || row.mobile || '').trim();

        validRecords.push({
          staffId,
          name,
          department,
          category,
          role,
          email,
          phone,
          uploadedCategory: category
        });
      });

      if (validRecords.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid staff records found in upload.',
          errors
        });
      }

      // Fetch existing records from MongoDB to determine status transition rules
      const submittedStaffIds = validRecords.map(r => r.staffId);
      const existingDbRecords = await collection.find({
        staffId: { $in: submittedStaffIds.map(id => new RegExp(`^${id}$`, 'i')) }
      }).toArray();

      const existingMap = new Map();
      existingDbRecords.forEach(r => existingMap.set(String(r.staffId).toLowerCase(), r));

      let insertedCount = 0;
      let updatedCount = 0;

      const bulkOps = validRecords.map(rec => {
        const existing = existingMap.get(rec.staffId.toLowerCase());
        const isPermanentAdmin = PROTECTED_ADMIN_IDS.includes(rec.staffId);

        // RULE: If already Active (or permanent Super Admin), preserve 'Active' status. Never downgrade to 'Pre-Authorized'.
        let finalStatus = 'Pre-Authorized';
        if (isPermanentAdmin || existing?.status === 'Active' || existing?.status === 'Verified') {
          finalStatus = 'Active';
        }

        if (existing) {
          updatedCount++;
        } else {
          insertedCount++;
        }

        return {
          updateOne: {
            filter: { staffId: rec.staffId },
            update: {
              $set: {
                staffId: rec.staffId,
                name: rec.name,
                department: rec.department,
                category: rec.category,
                role: rec.role,
                email: rec.email,
                phone: rec.phone,
                status: finalStatus,
                updatedAt: new Date().toISOString(),
                lastImportedAt: new Date().toISOString()
              },
              $setOnInsert: {
                createdAt: new Date().toISOString()
              }
            },
            upsert: true
          }
        };
      });

      await collection.bulkWrite(bulkOps, { ordered: false });

      // DATABASE WRITE VERIFICATION: Query database to verify records actually exist
      const verifiedDbRecords = await collection.find({
        staffId: { $in: submittedStaffIds.map(id => new RegExp(`^${id}$`, 'i')) }
      }).toArray();

      const verifiedCount = verifiedDbRecords.length;

      return res.status(200).json({
        success: true,
        submittedCount: rawRecords.length,
        validCount: validRecords.length,
        insertedCount,
        updatedCount,
        errorCount: errors.length,
        verifiedInDatabase: verifiedCount,
        errors
      });
    }

    // =========================================================================
    // DELETE /api/sync-verification?staffId=...
    // =========================================================================
    if (req.method === 'DELETE') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const staffId = normalizeStaffId(url.searchParams.get('staffId'));

      if (!staffId) {
        return res.status(400).json({ success: false, error: 'staffId query parameter is required' });
      }

      if (PROTECTED_ADMIN_IDS.includes(staffId)) {
        return res.status(403).json({
          success: false,
          error: `Staff ID "${staffId}" is a permanent Super Admin and cannot be deleted.`
        });
      }

      const result = await collection.deleteOne({
        staffId: new RegExp(`^${staffId}$`, 'i')
      });

      return res.status(200).json({
        success: true,
        deletedStaffId: staffId,
        deletedCount: result.deletedCount
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('sync-verification API error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
