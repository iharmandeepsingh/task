import fs from 'fs';
import path from 'path';

const sharedDb = JSON.parse(fs.readFileSync(path.resolve('./shared_server_db.json'), 'utf-8'));
const cleanTasks = (sharedDb.tasks || []).filter(t => t && t.id && t.title);

const initialDataPath = path.resolve('./src/data/initialData.js');
let content = fs.readFileSync(initialDataPath, 'utf-8');

// Replace INITIAL_TASKS
const newTasksDeclaration = 'export const INITIAL_TASKS = ' + JSON.stringify(cleanTasks, null, 2) + ';';
content = content.replace(/export const INITIAL_TASKS = \[[\s\S]*?\];/, newTasksDeclaration);

fs.writeFileSync(initialDataPath, content, 'utf-8');
console.log(`Updated initialData.js with ${cleanTasks.length} initial tasks.`);
