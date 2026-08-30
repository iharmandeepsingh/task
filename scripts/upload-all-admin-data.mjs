import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import path from 'path';

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0";

// Comprehensive Super Admin & Admin master records
const adminVerificationRecords = [
  {
    staffId: "24051",
    name: "Dr. Nitin Tandon",
    email: "drnitin@ctuniversity.in",
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
    department: "University Executive Administration",
    designation: "Director of Systems & University Operations",
    role: "Super Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_SUPER_ADMIN"
  },
  {
    staffId: "001",
    name: "Dr. Manjit Singh",
    email: "superadmin@ctu.edu.in",
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
    department: "General University Administration",
    designation: "Administration Head",
    role: "Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HOD-CSE",
    name: "Dr. Rajesh Sharma",
    email: "hod.cse@ctuniversity.in",
    department: "School of Engineering & Technology",
    designation: "Head of Department (CSE)",
    role: "HOD",
    category: "Faculty",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HOD-MGMT",
    name: "Dr. Priya Verma",
    email: "hod.mgmt@ctuniversity.in",
    department: "School of Management Studies",
    designation: "Head of Department (Management)",
    role: "HOD",
    category: "Faculty",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  },
  {
    staffId: "HOD-PHARM",
    name: "Dr. Harpreet Singh",
    email: "hod.pharm@ctuniversity.in",
    department: "School of Pharmaceutical Sciences",
    designation: "Head of Department (Pharmacy)",
    role: "HOD",
    category: "Faculty",
    status: "Verified",
    source: "SYSTEM_ADMIN"
  }
];

const teamAdmins = [
  {
    id: "usr-24051",
    employeeId: "24051",
    name: "Dr. Nitin Tandon",
    role: "Super Admin",
    roleKey: "superAdmin",
    category: "Admin",
    dept: "Vice Chancellor / Executive Director & Dean Research",
    email: "drnitin@ctuniversity.in",
    avatar: "NT",
    status: "Active",
    source: "SYSTEM_SUPER_ADMIN",
    hasAccount: true
  },
  {
    id: "usr-17572",
    employeeId: "17572",
    name: "Dr. Simranjeet Kaur Gill",
    role: "Super Admin",
    roleKey: "superAdmin",
    category: "Admin",
    dept: "Pro Vice Chancellor / Dean Academics / Principal of SOL",
    email: "principalsol@ctuniversity.in",
    avatar: "SG",
    status: "Active",
    source: "SYSTEM_SUPER_ADMIN",
    hasAccount: true
  },
  {
    id: "usr-10001",
    employeeId: "10001",
    name: "Super Admin",
    role: "Super Admin",
    roleKey: "superAdmin",
    category: "Admin",
    dept: "University Executive Administration",
    email: "superadmin.10001@ctu.edu.in",
    avatar: "SA",
    status: "Active",
    source: "SYSTEM_SUPER_ADMIN",
    hasAccount: true
  },
  {
    id: "usr-0",
    employeeId: "001",
    name: "Dr. Manjit Singh",
    role: "Super Admin",
    roleKey: "superAdmin",
    category: "Admin",
    dept: "University Administration",
    email: "superadmin@ctu.edu.in",
    avatar: "MS",
    status: "Active",
    source: "SYSTEM_SUPER_ADMIN",
    hasAccount: true
  },
  {
    id: "usr-1",
    employeeId: "ADM001",
    name: "University Admin Head",
    role: "Admin Head",
    roleKey: "adminHead",
    category: "Admin",
    dept: "General University Administration",
    email: "adminhead@ctu.edu.in",
    avatar: "AH",
    status: "Active",
    source: "SYSTEM_ADMIN",
    hasAccount: true
  },
  {
    id: "usr-2",
    employeeId: "HOD-CSE",
    name: "Dr. Rajesh Sharma",
    role: "HOD (CSE)",
    roleKey: "hod",
    category: "Faculty",
    dept: "School of Engineering & Technology",
    email: "hod.cse@ctuniversity.in",
    avatar: "RS",
    status: "Active",
    source: "SYSTEM_ADMIN",
    hasAccount: true
  }
];

async function uploadAdminData() {
  console.log('Connecting to MongoDB Atlas (ctu_task_db)...');
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
    console.log('✅ Connected successfully to MongoDB Atlas!\n');

    const db = client.db('ctu_task_db');
    const verifCol = db.collection('ctu_verification');
    const teamCol = db.collection('ctu_team');
    const tasksCol = db.collection('ctu_tasks');

    // 1. Upload to ctu_verification
    console.log('--- 1. UPLOADING ADMINS TO ctu_verification ---');
    for (const admin of adminVerificationRecords) {
      const res = await verifCol.updateOne(
        { staffId: admin.staffId },
        { $set: { ...admin, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      console.log(`✓ Admin Record [${admin.staffId}] ${admin.name} (${admin.role}): ${res.upsertedCount > 0 ? 'Created' : 'Updated'}`);
    }

    // 2. Upload to ctu_team (shared_team_roster)
    console.log('\n--- 2. UPDATING SHARED TEAM ROSTER (ctu_team) ---');
    const existingTeamDoc = await teamCol.findOne({ _id: 'shared_team_roster' });
    let fullTeam = existingTeamDoc && Array.isArray(existingTeamDoc.team) ? existingTeamDoc.team : [];

    // Merge admin team members
    for (const adm of teamAdmins) {
      const idx = fullTeam.findIndex(m => m.employeeId === adm.employeeId || m.id === adm.id);
      if (idx >= 0) {
        fullTeam[idx] = { ...fullTeam[idx], ...adm };
      } else {
        fullTeam.unshift(adm);
      }
    }

    // Read local backup if needed
    try {
      const dbJson = JSON.parse(fs.readFileSync(path.resolve('./shared_server_db.json'), 'utf-8'));
      if (dbJson.team && Array.isArray(dbJson.team)) {
        for (const tm of dbJson.team) {
          if (!fullTeam.some(m => m.id === tm.id || m.employeeId === tm.employeeId)) {
            fullTeam.push(tm);
          }
        }
      }
    } catch (e) {}

    await teamCol.updateOne(
      { _id: 'shared_team_roster' },
      { $set: { team: fullTeam, count: fullTeam.length, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    console.log(`✅ Saved ${fullTeam.length} members to ctu_team (shared_team_roster).`);

    // 3. Ensure initial tasks exist in ctu_tasks
    console.log('\n--- 3. VERIFYING TASKS ROSTER (ctu_tasks) ---');
    const existingTasksDoc = await tasksCol.findOne({ _id: 'shared_tasks_roster' });
    let fullTasks = existingTasksDoc && Array.isArray(existingTasksDoc.tasks) ? existingTasksDoc.tasks : [];

    if (fullTasks.length === 0) {
      try {
        const dbJson = JSON.parse(fs.readFileSync(path.resolve('./shared_server_db.json'), 'utf-8'));
        if (dbJson.tasks && Array.isArray(dbJson.tasks)) {
          fullTasks = dbJson.tasks;
        }
      } catch (e) {}

      await tasksCol.updateOne(
        { _id: 'shared_tasks_roster' },
        { $set: { tasks: fullTasks, count: fullTasks.length, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      console.log(`✅ Initialized ${fullTasks.length} tasks in ctu_tasks.`);
    } else {
      console.log(`✓ ctu_tasks already has ${fullTasks.length} live tasks.`);
    }

    // 4. Print summary
    console.log('\n========================================');
    console.log('🎉 ALL ADMIN & SUPER ADMIN DATA UPLOADED SUCCESSFULLY TO MONGODB!');
    console.log('========================================');
    const countVerif = await verifCol.countDocuments();
    console.log(`• ctu_verification Total Records: ${countVerif}`);
    console.log(`• ctu_team Total Members: ${fullTeam.length}`);
    console.log(`• ctu_tasks Total Tasks: ${fullTasks.length}`);

  } catch (err) {
    console.error('❌ Error uploading admin data to MongoDB:', err);
  } finally {
    await client.close();
  }
}

uploadAdminData();
