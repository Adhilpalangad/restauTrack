import { doc, getDoc, setDoc, query, collection, where, orderBy, getDocs, limit, startAfter, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getToday } from '../utils/dates';

const getRecordRef = (userId, dateId) => {
  return doc(db, 'users', userId, 'dailyRecords', dateId);
};

const getRecordsCollection = (userId) => {
  return collection(db, 'users', userId, 'dailyRecords');
};

export const createEmptyRecord = (dateId) => ({
  date: dateId,
  income: { cash: 0, online: 0, total: 0 },
  expenses: [],
  totalExpense: 0,
  netProfit: 0,
  status: 'draft',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});

export const getDailyRecord = async (userId, dateId) => {
  const ref = getRecordRef(userId, dateId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const saveDailyRecord = async (userId, dateId, data) => {
  const ref = getRecordRef(userId, dateId);
  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  await setDoc(ref, updateData, { merge: true });
  return updateData;
};

export const submitDailyRecord = async (userId, dateId, data) => {
  const ref = getRecordRef(userId, dateId);
  const updateData = {
    ...data,
    status: 'submitted',
    updatedAt: Timestamp.now(),
  };
  await setDoc(ref, updateData, { merge: true });
  return updateData;
};

export const unlockDailyRecord = async (userId, dateId) => {
  const ref = getRecordRef(userId, dateId);
  await setDoc(ref, { status: 'draft', updatedAt: Timestamp.now() }, { merge: true });
};

export const getRecordsByDateRange = async (userId, startDate, endDate, pageSize = 30, lastDoc = null) => {
  const col = getRecordsCollection(userId);
  let q;
  
  if (lastDoc) {
    q = query(
      col,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  } else {
    q = query(
      col,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      limit(pageSize)
    );
  }
  
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastVisible = snap.docs[snap.docs.length - 1] || null;
  
  return { records, lastVisible, hasMore: snap.docs.length === pageSize };
};

export const getAllRecordsByDateRange = async (userId, startDate, endDate) => {
  const col = getRecordsCollection(userId);
  const q = query(
    col,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
