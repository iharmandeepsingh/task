import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI || "mongodb+srv://ctutasks_db_user:NRLtQ1ElSTK2BaHP@cluster0.q8oubgb.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0";

const sharedDb = JSON.parse(fs.readFileSync(path.resolve('./shared_server_db.json'), 'utf-8'));

// Filter clean tasks
const cleanTasks = (sharedDb.tasks || []).filter(t => t && t.id && t.title);

// Clean team
const cleanTeam = (sharedDb.team || []).filter(m => m && (m.employeeId || m.id) && m.name);

// Super Admin definitions to guarantee present
const superAdminTeamMembers = [
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

// Merge Super Admins into clean team
for (const adm of superAdminTeamMembers) {
  const idx = cleanTeam.findIndex(m => m.employeeId === adm.employeeId || m.id === adm.id);
  if (idx >= 0) {
    cleanTeam[idx] = { ...cleanTeam[idx], ...adm };
  } else {
    cleanTeam.unshift(adm);
  }
}

async function syncAll() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('ctu_task_db');

  console.log(`Uploading ${cleanTasks.length} clean tasks to ctu_tasks...`);
  await db.collection('ctu_tasks').updateOne(
    { _id: 'shared_tasks_roster' },
    { $set: { tasks: cleanTasks, count: cleanTasks.length, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );

  console.log(`Uploading ${cleanTeam.length} team members to ctu_team...`);
  await db.collection('ctu_team').updateOne(
    { _id: 'shared_team_roster' },
    { $set: { team: cleanTeam, count: cleanTeam.length, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );

  console.log('✅ Synchronized clean tasks & team with MongoDB Atlas successfully!');
  await client.close();
}

syncAll();
