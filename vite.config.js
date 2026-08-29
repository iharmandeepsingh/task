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
        const url = req.url || '';

        // Helper to run serverless handler
        const runHandler = async (handlerFile) => {
          let bodyData = null;
          if (req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT') {
            let bodyStr = '';
            await new Promise(resolve => {
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', resolve);
            });
            if (bodyStr) {
              try { bodyData = JSON.parse(bodyStr); } catch (e) { bodyData = bodyStr; }
            }
          }
          req.body = bodyData;

          res.status = function(code) {
            this.statusCode = code;
            return this;
          };
          res.json = function(data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
            return this;
          };

          try {
            const handlerPath = path.resolve(import.meta.dirname, 'api', handlerFile);
            delete require.cache[require.resolve(handlerPath)];
            const handler = require(handlerPath);
            await handler(req, res);
          } catch (err) {
            console.error(`API Error in ${handlerFile}:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        };

        if (url.startsWith('/api/check-verification')) {
          await runHandler('check-verification.js');
          return;
        }

        if (url.startsWith('/api/sync-verification')) {
          await runHandler('sync-verification.js');
          return;
        }

        if (url.startsWith('/api/sync-team')) {
          await runHandler('sync-team.js');
          return;
        }

        if (url.startsWith('/api/sync-tasks')) {
          await runHandler('sync-tasks.js');
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
