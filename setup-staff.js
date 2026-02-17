import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import fs from 'fs';

// Firebase Configuration
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-config.json', 'utf8'));

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || serviceAccount.databaseURL
});

const db = getDatabase();

async function setupDefaultStaff() {
    console.log('Setting up default staff...');
    
    // Add default guardian
    const defaultGuardian = '2347077744645';
    const guardians = (await db.ref('guardians').once('value')).val() || [];
    
    if (!guardians.includes(defaultGuardian)) {
        guardians.push(defaultGuardian);
        await db.ref('guardians').set(guardians);
        console.log(`✅ Added ${defaultGuardian} as guardian`);
    } else {
        console.log(`Guardian ${defaultGuardian} already exists`);
    }
    
    // Add default mod
    const defaultMod = '2347079434802';
    const mods = (await db.ref('mods').once('value')).val() || [];
    
    if (!mods.includes(defaultMod)) {
        mods.push(defaultMod);
        await db.ref('mods').set(mods);
        console.log(`✅ Added ${defaultMod} as moderator`);
    } else {
        console.log(`Moderator ${defaultMod} already exists`);
    }
    
    console.log('✅ Setup complete!');
    process.exit(0);
}

setupDefaultStaff().catch(error => {
    console.error('Error setting up staff:', error);
    process.exit(1);
});
