import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';

const DB_FILE = path.resolve(import.meta.dirname, 'shared_server_db.json');
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://harmanprab_db_user:zAoIwpKJA4ZnWJoR@cluster0.h5d3xpo.mongodb.net/ctu_task_db?retryWrites=true&w=majority&appName=Cluster0";

let mongoClient = null;
async function getMongoDatabase(uri) {
  if (!mongoClient) {
    mongoClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    await mongoClient.connect();
  }
  return mongoClient.db('ctu_task_db');
}

// Helper to load shared DB fallback
function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {}
  }
  return { team: null, tasks: null };
}

function saveDb(data) {
  const current = loadDb();
  const updated = { ...current, ...data };
  fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

function syncServerPlugin() {
  return {
    name: 'sync-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Team Sync API
        if (req.url.startsWith('/api/sync-team')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const teamData = JSON.parse(body);
                const teamArray = Array.isArray(teamData) ? teamData : teamData.team;
                
                if (mongoUri && teamArray) {
                  const db = await getMongoDatabase(mongoUri);
                  await db.collection('ctu_team').deleteMany({});
                  if (teamArray.length > 0) {
                    await db.collection('ctu_team').insertMany(teamArray);
                  }
                }
                saveDb({ team: teamArray });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: teamArray?.length || 0 }));
              } catch (e) {
                res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          } else if (req.method === 'GET') {
            try {
              if (mongoUri) {
                const db = await getMongoDatabase(mongoUri);
                const team = await db.collection('ctu_team').find({}).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ team }));
                return;
              }
            } catch (e) {}
            const db = loadDb();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ team: db.team }));
            return;
          }
        }
        
        // 2. Tasks Sync API
        else if (req.url.startsWith('/api/sync-tasks')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const tasksData = JSON.parse(body);
                const tasksArray = Array.isArray(tasksData) ? tasksData : tasksData.tasks;
                
                if (mongoUri && tasksArray) {
                  const db = await getMongoDatabase(mongoUri);
                  await db.collection('ctu_tasks').deleteMany({});
                  if (tasksArray.length > 0) {
                    await db.collection('ctu_tasks').insertMany(tasksArray);
                  }
                }
                saveDb({ tasks: tasksArray });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: tasksArray?.length || 0 }));
              } catch (e) {
                res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          } else if (req.method === 'GET') {
            try {
              if (mongoUri) {
                const db = await getMongoDatabase(mongoUri);
                const tasks = await db.collection('ctu_tasks').find({}).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ tasks }));
                return;
              }
            } catch (e) {}
            const db = loadDb();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ tasks: db.tasks }));
            return;
          }
        }

        // 3. Verification Sync API
        else if (req.url.startsWith('/api/sync-verification')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const incomingData = JSON.parse(body);

                // Action: Clear/Wipe All Pre-Authorized Records
                if (incomingData?.action === 'clear-all' || incomingData?.action === 'wipe-all') {
                  if (mongoUri) {
                    const db = await getMongoDatabase(mongoUri);
                    const result = await db.collection('ctu_staff_verification').deleteMany({});
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, deletedCount: result.deletedCount }));
                    return;
                  }
                }

                // Action: Bulk Delete Array of Staff IDs
                if (incomingData?.action === 'bulk-delete' || Array.isArray(incomingData?.staffIds)) {
                  const staffIdsToDelete = incomingData.staffIds || incomingData.deletedStaffIds || [];
                  if (mongoUri && Array.isArray(staffIdsToDelete) && staffIdsToDelete.length > 0) {
                    const db = await getMongoDatabase(mongoUri);
                    const regexArray = staffIdsToDelete.map(id => new RegExp(`^${String(id).trim()}$`, 'i'));
                    const result = await db.collection('ctu_staff_verification').deleteMany({ staffId: { $in: regexArray } });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, deletedCount: result.deletedCount }));
                    return;
                  }
                }

                // Action: Single Delete
                if (incomingData?.action === 'remove' || incomingData?.action === 'delete') {
                  const removeId = incomingData.staffId || incomingData.id;
                  if (mongoUri && removeId) {
                    const db = await getMongoDatabase(mongoUri);
                    await db.collection('ctu_staff_verification').deleteOne({
                      staffId: new RegExp(`^${String(removeId).trim()}$`, 'i')
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, removed: removeId }));
                    return;
                  }
                }

                const records = Array.isArray(incomingData) ? incomingData : incomingData.records;
                if (mongoUri && records && records.length > 0) {
                  const db = await getMongoDatabase(mongoUri);
                  const collection = db.collection('ctu_staff_verification');
                  const bulkOps = records.map(record => ({
                    updateOne: {
                      filter: { staffId: record.staffId },
                      update: { $set: { ...record, updatedAt: new Date().toISOString() } },
                      upsert: true
                    }
                  }));
                  await collection.bulkWrite(bulkOps);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, count: records.length }));
                  return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: 0 }));
              } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          } else if (req.method === 'GET') {
            try {
              if (mongoUri) {
                const db = await getMongoDatabase(mongoUri);
                const records = await db.collection('ctu_staff_verification').find({}).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ records: records || [] }));
                return;
              }
            } catch (e) {}
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ records: [] }));
            return;
          }
        }

        // 4. Check Verification API
        else if (req.url.startsWith('/api/check-verification')) {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const staffId = url.searchParams.get('staffId');
            if (!staffId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'staffId required' }));
              return;
            }

            if (mongoUri) {
              const db = await getMongoDatabase(mongoUri);
              const record = await db.collection('ctu_staff_verification').findOne({
                staffId: new RegExp(`^${String(staffId).trim()}$`, 'i')
              });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ preAuthorized: !!record, record }));
              return;
            }
          } catch (e) {}
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ preAuthorized: false, record: null }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), syncServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
});
