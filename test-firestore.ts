import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Logged in:", cred.user.uid);
    const docRef = await addDoc(collection(db, "insights"), {
        title: "Test",
        content: "Test content"
    });
    console.log("Inserted:", docRef.id);
  } catch(e: any) {
    console.error("Error:", e.message);
  }
}
test();
