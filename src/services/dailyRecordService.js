import { doc, getDoc, setDoc, query, collection, where, orderBy, getDocs, limit, startAfter, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const ALL_HOTELS = ['AWH', 'MEDICAL COLLEGE', 'STARCARE'];

const getRecordRef = (userId, hotelId, dateId) => {
  return doc(db, 'users', userId, 'hotels', hotelId, 'dailyRecords', dateId);
};

const getRecordsCollection = (userId, hotelId) => {
  return collection(db, 'users', userId, 'hotels', hotelId, 'dailyRecords');
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

// A record counts as "has data" if income or expenses exist
const hasData = (r) =>
  (r.income?.total || 0) > 0 || (r.totalExpense || 0) > 0;

const aggregateRecordsList = (recordsList) => {
  const map = {};
  recordsList.forEach(r => {
    if (!map[r.date]) {
      map[r.date] = createEmptyRecord(r.date);
    }
    const acc = map[r.date];
    acc.income.cash += r.income?.cash || 0;
    acc.income.online += r.income?.online || 0;
    acc.income.total += r.income?.total || 0;
    acc.totalExpense += r.totalExpense || 0;
    acc.netProfit += r.netProfit || 0;
    if (r.expenses && r.expenses.length > 0) {
      acc.expenses.push(...r.expenses.map(e => ({ ...e, hotelSource: r.hotelId })));
    }
    acc.status = 'submitted';
  });
  return Object.values(map)
    .filter(hasData)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getDailyRecord = async (userId, hotelId, dateId) => {
  if (hotelId === 'ALL') {
    const promises = ALL_HOTELS.map(h => getDailyRecord(userId, h, dateId));
    const results = await Promise.all(promises);
    const valid = results.filter(Boolean);
    if (valid.length === 0) return null;
    return aggregateRecordsList(valid)[0] || null;
  }

  const ref = getRecordRef(userId, hotelId, dateId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    // Treat soft-deleted records as non-existent for editing
    if (data.deleted) return null;
    return { id: snap.id, hotelId, ...data };
  }
  return null;
};

export const saveDailyRecord = async (userId, hotelId, dateId, data) => {
  if (hotelId === 'ALL') throw new Error("Cannot save in ALL mode");
  const ref = getRecordRef(userId, hotelId, dateId);
  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  await setDoc(ref, updateData, { merge: true });
  return updateData;
};

export const submitDailyRecord = async (userId, hotelId, dateId, data) => {
  if (hotelId === 'ALL') throw new Error("Cannot submit in ALL mode");
  const ref = getRecordRef(userId, hotelId, dateId);
  const updateData = {
    ...data,
    status: 'submitted',
    updatedAt: Timestamp.now(),
  };
  await setDoc(ref, updateData, { merge: true });
  return updateData;
};

export const unlockDailyRecord = async (userId, hotelId, dateId) => {
  if (hotelId === 'ALL') throw new Error("Cannot unlock in ALL mode");
  const ref = getRecordRef(userId, hotelId, dateId);
  await setDoc(ref, { status: 'draft', updatedAt: Timestamp.now() }, { merge: true });
};

export const softDeleteRecord = async (userId, hotelId, dateId) => {
  if (hotelId === 'ALL') throw new Error("Cannot delete in ALL mode");
  const ref = getRecordRef(userId, hotelId, dateId);
  await setDoc(ref, {
    deleted: true,
    deletedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });
};

export const getRecordsByDateRange = async (userId, hotelId, startDate, endDate, pageSize = 30, lastDoc = null) => {
  if (hotelId === 'ALL') {
    const all = await getAllRecordsByDateRange(userId, 'ALL', startDate, endDate);
    return { records: all, lastVisible: null, hasMore: false };
  }

  const col = getRecordsCollection(userId, hotelId);
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
  const records = snap.docs
    .map((d) => ({ id: d.id, hotelId, ...d.data() }))
    .filter(r => !r.deleted && hasData(r));

  const lastVisible = snap.docs[snap.docs.length - 1] || null;

  return { records, lastVisible, hasMore: snap.docs.length === pageSize };
};

export const getAllRecordsByDateRange = async (userId, hotelId, startDate, endDate) => {
  if (hotelId === 'ALL') {
    const promises = ALL_HOTELS.map(h => getAllRecordsByDateRange(userId, h, startDate, endDate));
    const results = await Promise.all(promises);
    return aggregateRecordsList(results.flat());
  }

  const col = getRecordsCollection(userId, hotelId);
  const q = query(
    col,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, hotelId, ...d.data() }))
    .filter(r => !r.deleted && hasData(r));
};
