import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(import.meta.dirname, 'shared_server_db.json');

// Helper to load shared DB
function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {}
  }
  return { team: null, tasks: null };
}

// Helper to save shared DB
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
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/api/sync-team')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const teamData = JSON.parse(body);
                saveDb({ team: teamData });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: teamData.length }));
              } catch (e) {
                res.writeHead(400); res.end('Invalid JSON');
              }
            });
            return;
          } else if (req.method === 'GET') {
            const db = loadDb();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ team: db.team }));
            return;
          }
        } else if (req.url.startsWith('/api/sync-tasks')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const tasksData = JSON.parse(body);
                saveDb({ tasks: tasksData });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: tasksData.length }));
              } catch (e) {
                res.writeHead(400); res.end('Invalid JSON');
              }
            });
            return;
          } else if (req.method === 'GET') {
            const db = loadDb();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ tasks: db.tasks }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
});
