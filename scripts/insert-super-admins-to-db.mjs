import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import path from 'path';

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0";

const superAdmins = [
  {
    staffId: "24051",
    name: "Dr. Nitin Tandon",
    email: "drnitin@ctuniversity.in",
    department: "Vice Chancellor / Executive Director & Dean Research",
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
    role: "Super Admin",
    category: "Admin",
    status: "Verified",
    source: "SYSTEM_SUPER_ADMIN"
  }
];

const teamAdmins = [
  {
    id: "usr-24051",
    employeeId: "24051",
    name: "Dr. Nitin Tandon",
    role: "Super Admin",
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
    category: "Admin",
    dept: "University Administration",
    email: "superadmin@ctu.edu.in",
    avatar: "MS",
    status: "Active",
    source: "SYSTEM_SUPER_ADMIN",
    hasAccount: true
  }
];

async function insertSuperAdmins() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");
    const db = client.db('ctu_task_db');

    // 1. Upsert into ctu_staff_verification
    const verCol = db.collection('ctu_staff_verification');
    for (const sa of superAdmins) {
      await verCol.updateOne(
        { staffId: sa.staffId },
        { $set: { ...sa, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      console.log(`✅ Upserted in ctu_staff_verification: ${sa.name} (ID: ${sa.staffId})`);
    }

    // 2. Upsert into ctu_team individual docs
    const teamCol = db.collection('ctu_team');
    for (const tm of teamAdmins) {
      await teamCol.updateOne(
        { employeeId: tm.employeeId },
        { $set: { ...tm, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      console.log(`✅ Upserted in ctu_team: ${tm.name} (ID: ${tm.employeeId})`);
    }

    // 3. Update shared_team_roster doc
    const rosterDoc = await teamCol.findOne({ _id: 'shared_team_roster' });
    let currentTeam = (rosterDoc && Array.isArray(rosterDoc.team)) ? rosterDoc.team : [];
    
    // Merge teamAdmins into roster
    const teamMap = new Map();
    currentTeam.forEach(m => teamMap.set(String(m.employeeId || m.id).trim(), m));
    teamAdmins.forEach(m => teamMap.set(String(m.employeeId || m.id).trim(), { ...(teamMap.get(String(m.employeeId || m.id).trim()) || {}), ...m }));

    const mergedTeam = Array.from(teamMap.values());
    await teamCol.updateOne(
      { _id: 'shared_team_roster' },
      { 
        $set: { 
          team: mergedTeam,
          updatedAt: new Date().toISOString(),
          count: mergedTeam.length
        } 
      },
      { upsert: true }
    );
    console.log(`✅ Updated shared_team_roster with ${mergedTeam.length} total team members.`);

    // 4. Update local fallback shared_server_db.json
    const dbFilePath = path.resolve('./shared_server_db.json');
    if (fs.existsSync(dbFilePath)) {
      try {
        const localDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
        localDb.team = mergedTeam;
        fs.writeFileSync(dbFilePath, JSON.stringify(localDb, null, 2));
        console.log(`✅ Updated local shared_server_db.json`);
      } catch (e) {}
    }

    console.log("\n🎉 Super Admins successfully added to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB Atlas connection error:", err.message);
    if (err.message.includes("alert number 80") || err.message.includes("SSL")) {
      console.error("\n👉 Note: Please ensure '0.0.0.0/0' (Allow access from anywhere) is added in MongoDB Atlas under Security -> Network Access.");
    }
  } finally {
    await client.close();
  }
}

insertSuperAdmins();
