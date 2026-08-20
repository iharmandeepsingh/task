import fs from 'fs';
import path from 'path';

const sharedDb = JSON.parse(fs.readFileSync(path.resolve('./shared_server_db.json'), 'utf-8'));
const initialDataPath = path.resolve('./src/data/initialData.js');

let content = fs.readFileSync(initialDataPath, 'utf-8');

const updatedInitialTeamStr = 'export const INITIAL_TEAM = ' + JSON.stringify(sharedDb.team, null, 2) + ';';

content = content.replace(/export const INITIAL_TEAM = \[[\s\S]*?\];/, updatedInitialTeamStr);

fs.writeFileSync(initialDataPath, content, 'utf-8');
console.log(`Updated initialData.js with ${sharedDb.team.length} faculty members.`);
