// Firestore seed script — populates test data for RestauTrack
// Run: node scripts/seed.js <YOUR_USER_ID>
//
// Requires: firebase-admin
// Before running, place your serviceAccountKey.json in the project root.

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

let serviceAccount;
const saPath = resolve(rootDir, 'serviceAccountKey.json');

if (existsSync(saPath)) {
    serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
} else {
    console.error('❌ No serviceAccountKey.json found in project root.');
    console.error('Go to Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key');
    process.exit(1);
}

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const USER_ID = process.argv[2] || '';

if (!USER_ID) {
    console.error('❌ Please provide your Firebase Auth user UID as an argument: node scripts/seed.js <USER_UID>');
    process.exit(1);
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const expenseCategories = ['Vegetables', 'Meat & Fish', 'Groceries', 'Rent', 'Staff Salary', 'Electricity Bill', 'Miscellaneous'];

function generateExpenses() {
    const count = rand(3, 6);
    const expenses = [];
    const usedCats = new Set();

    for (let i = 0; i < count; i++) {
        let cat;
        do { cat = pick(expenseCategories); } while (usedCats.has(cat) && usedCats.size < expenseCategories.length);
        usedCats.add(cat);

        let amount = rand(10000, 200000); // 100 to 2000 INR
        expenses.push({ id: `exp_${Date.now()}_${i}`, category: cat, description: 'Test expense', amount });
    }
    return expenses;
}

function generateRecord(dateStr) {
    const expenses = generateExpenses();
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const cash = rand(800000, 2000000);
    const online = rand(300000, 1000000);
    const total = cash + online;
    const ts = Timestamp.fromDate(new Date(dateStr + 'T12:00:00'));

    return {
        date: dateStr,
        income: { cash, online, total },
        expenses,
        totalExpense,
        netProfit: total - totalExpense,
        status: 'submitted',
        createdAt: ts,
        updatedAt: ts,
    };
}

async function seed() {
    console.log(`🌱 Seeding 45 days of data for user: ${USER_ID}`);
    const batch = db.batch();
    const dates = [];
    const today = new Date();

    // Create last 45 days of entries
    for (let i = 1; i <= 45; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
    }

    const categoryUsage = {};

    for (const dateStr of dates) {
        const record = generateRecord(dateStr);
        const ref = db.collection('users').doc(USER_ID).collection('dailyRecords').doc(dateStr);
        batch.set(ref, record);

        for (const exp of record.expenses) {
            const key = exp.category.trim().toLowerCase();
            if (!categoryUsage[key]) {
                categoryUsage[key] = { name: exp.category.trim(), count: 0 };
            }
            categoryUsage[key].count++;
        }
    }

    for (const [key, data] of Object.entries(categoryUsage)) {
        const ref = db.collection('users').doc(USER_ID).collection('categories').doc(key);
        batch.set(ref, { name: data.name, usageCount: data.count, lastUsed: Timestamp.now() });
    }

    await batch.commit();
    console.log('✅ Seed complete!');
}

seed().catch(console.error);
