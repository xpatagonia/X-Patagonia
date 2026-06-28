import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let projectId = '';
let databaseId = '';
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  projectId = config.projectId;
  databaseId = config.firestoreDatabaseId;
} catch (e) {
  console.log('Using default project id or failed to load config');
}

if (!getApps().length) {
  initializeApp({
    projectId: projectId || undefined,
  });
}

export const adminAuth = getAuth();
export const adminDb = databaseId ? getFirestore(getApps()[0], databaseId) : getFirestore();
