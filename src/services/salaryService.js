import {
  collection, doc, addDoc, getDocs, setDoc, updateDoc,
  query, orderBy, where, Timestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';

const salariesCol = (userId) =>
  collection(db, 'users', userId, 'salaries');

const employeesCol = (userId) =>
  collection(db, 'users', userId, 'salaryEmployees');

// ── Add a salary payment entry ─────────────────────────────────────────────
export const addSalaryEntry = async (userId, { name, amount, date, remarks = '' }) => {
  const entry = {
    name: name.trim(),
    amount,      // stored in paise, same as expenses
    date,
    remarks: remarks.trim(),
    deleted: false,
    createdAt: Timestamp.now(),
  };

  const ref = await addDoc(salariesCol(userId), entry);

  // Upsert employee record (name is the doc ID for easy lookup)
  const empRef = doc(employeesCol(userId), name.trim());
  await setDoc(
    empRef,
    { name: name.trim(), usageCount: increment(1), lastUsed: Timestamp.now() },
    { merge: true }
  );

  return { id: ref.id, ...entry };
};

// ── Fetch salary entries with optional date range ──────────────────────────
export const getSalaryEntries = async (userId, { startDate, endDate } = {}) => {
  const col = salariesCol(userId);

  const q =
    startDate && endDate
      ? query(col, where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date', 'desc'))
      : query(col, orderBy('date', 'desc'));

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((e) => !e.deleted);
};

// ── Fetch all employee names for autocomplete ──────────────────────────────
export const getSalaryEmployees = async (userId) => {
  const q = query(employeesCol(userId), orderBy('usageCount', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ── Check if employee name already exists ──────────────────────────────────
export const isExistingEmployee = (employees, name) =>
  employees.some((e) => e.name.toLowerCase() === name.trim().toLowerCase());

// ── Soft-delete (never remove from Firestore) ──────────────────────────────
export const softDeleteSalaryEntry = async (userId, entryId) => {
  const ref = doc(salariesCol(userId), entryId);
  await updateDoc(ref, { deleted: true, deletedAt: Timestamp.now() });
};
