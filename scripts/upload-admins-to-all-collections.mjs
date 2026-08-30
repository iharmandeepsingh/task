import { MongoClient, ServerApiVersion } from 'mongodb';

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0";

const adminRecords = [
  {
    staffId: "24051",
    name: "Dr. Nitin Tandon",
    email: "drnitin@ctuniversity.in",
    phone: "9876543210",
    department: "Vice Chancellor / Executive Director & Dean Research",
    designation: "Executive Director & Dean Research",
    role: "Super Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_SUPER_ADMIN"
  },
  {
    staffId: "17572",
    name: "Dr. Simranjeet Kaur Gill",
    email: "principalsol@ctuniversity.in",
    phone: "9876543211",
    department: "Pro Vice Chancellor / Dean Academics / Principal of SOL",
    designation: "Dean Academics & Principal SOL",
    role: "Super Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_SUPER_ADMIN"
  },
  {
    staffId: "10001",
    name: "Super Admin",
    email: "superadmin.10001@ctu.edu.in",
    phone: "9876543212",
    department: "University Executive Administration",
    designation: "Director of Systems & Operations",
    role: "Super Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_SUPER_ADMIN"
  },
  {
    staffId: "001",
    name: "Dr. Manjit Singh",
    email: "superadmin@ctu.edu.in",
    phone: "9876543213",
    department: "University Administration",
    designation: "Hon'ble Chancellor",
    role: "Super Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_SUPER_ADMIN"
  },
  {
    staffId: "ADM001",
    name: "University Admin Head",
    email: "adminhead@ctu.edu.in",
    phone: "9876543214",
    department: "General University Administration",
    designation: "Administration Head",
    role: "Admin Head",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HOD-CSE",
    name: "Dr. Rajesh Sharma",
    email: "hod.cse@ctuniversity.in",
    phone: "9876543215",
    department: "School of Engineering & Technology",
    designation: "Head of Department (CSE)",
    role: "HOD (CSE)",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HOD-MGMT",
    name: "Dr. Priya Verma",
    email: "hod.mgmt@ctuniversity.in",
    phone: "9876543216",
    department: "School of Management Studies",
    designation: "Head of Department (Management)",
    role: "HOD (Management)",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HOD-PHARM",
    name: "Dr. Harpreet Singh",
    email: "hod.pharm@ctuniversity.in",
    phone: "9876543217",
    department: "School of Pharmaceutical Sciences",
    designation: "Head of Department (Pharmacy)",
    role: "HOD (Pharmacy)",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HR001",
    name: "HR Directorate",
    email: "hr@ctuniversity.in",
    phone: "9876543218",
    department: "Human Resources Directorate",
    designation: "HR Head",
    role: "HR Lead",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "REG001",
    name: "Office of the Registrar",
    email: "registrar@ctuniversity.in",
    phone: "9876543219",
    department: "Registrar Office",
    designation: "University Registrar",
    role: "Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "ACC001",
    name: "Accounts & Finance Head",
    email: "accounts@ctuniversity.in",
    phone: "9876543220",
    department: "Finance & Accounts Division",
    designation: "Chief Finance Officer",
    role: "Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "EXAM001",
    name: "Controller of Examinations",
    email: "coe@ctuniversity.in",
    phone: "9876543221",
    department: "Examination Directorate",
    designation: "Controller of Examinations",
    role: "Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  }
];

const teamAdmins = adminRecords.map(adm => ({
  id: `usr-${adm.staffId.toLowerCase()}`,
  employeeId: adm.staffId,
  name: adm.name,
  role: adm.role,
  roleKey: adm.role.toLowerCase().includes('super') ? 'superAdmin' : (adm.role.toLowerCase().includes('hr') ? 'hr' : (adm.role.toLowerCase().includes('hod') ? 'hod' : 'admin')),
  category: 'Admin',
  dept: adm.department,
  email: adm.email,
  phone: adm.phone,
  avatar: adm.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  status: 'Active',
  source: adm.source,
  hasAccount: true
}));

async function uploadAdminsEverywhere() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!\n');

    const db = client.db('ctu_task_db');
    const staffVerCol = db.collection('ctu_staff_verification');
    const verCol = db.collection('ctu_verification');
    const teamCol = db.collection('ctu_team');

    // 1. Upload to ctu_staff_verification (Main API collection for verification & login lookup)
    console.log('--- 1. UPLOADING TO ctu_staff_verification ---');
    for (const adm of adminRecords) {
      const res = await staffVerCol.updateOne(
        { staffId: adm.staffId },
        { $set: { ...adm, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      console.log(`✓ [${adm.staffId}] ${adm.name} (${adm.role}) -> ctu_staff_verification: ${res.upsertedCount > 0 ? 'Created' : 'Updated'}`);
    }

    // 2. Upload to ctu_verification (Secondary mirror)
    console.log('\n--- 2. UPLOADING TO ctu_verification ---');
    for (const adm of adminRecords) {
      await verCol.updateOne(
        { staffId: adm.staffId },
        { $set: { ...adm, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }
    console.log(`✅ Synced ${adminRecords.length} admin records into ctu_verification mirror.`);

    // 3. Upsert into ctu_team (shared_team_roster)
    console.log('\n--- 3. MERGING ADMINS INTO ctu_team ---');
    const teamDoc = await teamCol.findOne({ _id: 'shared_team_roster' });
    let team = teamDoc && Array.isArray(teamDoc.team) ? teamDoc.team : [];

    for (const adm of teamAdmins) {
      const idx = team.findIndex(m => m.employeeId === adm.employeeId || m.id === adm.id);
      if (idx >= 0) {
        team[idx] = { ...team[idx], ...adm };
      } else {
        team.unshift(adm);
      }
    }

    await teamCol.updateOne(
      { _id: 'shared_team_roster' },
      { $set: { team: team, count: team.length, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    console.log(`✅ Saved ${team.length} members to ctu_team (with ${adminRecords.length} Admin & Super Admin profiles).`);

    // Verification Counts
    const staffVerCount = await staffVerCol.countDocuments();
    const verCount = await verCol.countDocuments();
    const adminVerCount = await staffVerCol.countDocuments({ category: 'Admin' });

    console.log('\n========================================');
    console.log('🎉 ALL ADMIN & LEADERSHIP DATA 100% POPULATED!');
    console.log('========================================');
    console.log(`• ctu_staff_verification Total Records: ${staffVerCount} (Admin Category: ${adminVerCount})`);
    console.log(`• ctu_verification Total Records: ${verCount}`);
    console.log(`• ctu_team Total Roster: ${team.length}`);

  } catch (err) {
    console.error('❌ Error uploading admins:', err);
  } finally {
    await client.close();
  }
}

uploadAdminsEverywhere();
