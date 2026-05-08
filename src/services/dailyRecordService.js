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

// A record counts as "has data" if income or expenses exist, or if it has been submitted
const hasData = (r) =>
  (r.income?.total || 0) > 0 || (r.totalExpense || 0) > 0 || (r.expenses && r.expenses.length > 0) || r.status === 'submitted';

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
    
    // Add fallback for missing createdAt (e.g., from older app versions or manual DB entry)
    const createdAt = data.createdAt || Timestamp.now();
    
    return { id: snap.id, date: snap.id, hotelId, createdAt, ...data };
  }
  return null;
};

const sanitizeRecord = (data, dateId) => {
  if (!data) return null;

  const sanitized = {
    date: dateId || data.date,
    status: data.status || 'draft',
    totalExpense: typeof data.totalExpense === 'number' ? data.totalExpense : 0,
    netProfit: typeof data.netProfit === 'number' ? data.netProfit : 0,
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (data.income) {
    sanitized.income = {
      cash: typeof data.income.cash === 'number' ? data.income.cash : 0,
      online: typeof data.income.online === 'number' ? data.income.online : 0,
      total: typeof data.income.total === 'number' ? data.income.total : 0,
    };
  } else {
    sanitized.income = { cash: 0, online: 0, total: 0 };
  }

  if (Array.isArray(data.expenses)) {
    sanitized.expenses = data.expenses
      .filter(e => e.category?.trim() || e.amount > 0 || e.note?.trim())
      .map(e => ({
        id: e.id || crypto.randomUUID(),
        category: e.category || '',
        amount: typeof e.amount === 'number' ? e.amount : 0,
        note: e.note || '',
        timestamp: e.timestamp || Timestamp.now(),
      }));
  } else {
    sanitized.expenses = [];
  }

  return sanitized;
};

export const validateRecord = (data) => {
  if (data.expenses && Array.isArray(data.expenses)) {
    for (const e of data.expenses) {
      const hasCategory = e.category && e.category.trim() !== '';
      const hasAmount = e.amount && Number(e.amount) > 0;
      const hasNote = e.note && e.note.trim() !== '';

      // Skip entirely empty rows as they are stripped out safely
      if (!hasCategory && !hasAmount && !hasNote) continue;

      if (!hasCategory || !hasAmount) {
        throw new Error('INCOMPLETE_RECORD');
      }
    }
  }
};

export const saveDailyRecord = async (userId, hotelId, dateId, data) => {
  if (hotelId === 'ALL') throw new Error("Cannot save in ALL mode");
  if (!data) return;
  validateRecord(data);
  const updateData = sanitizeRecord(data, dateId);
  const ref = getRecordRef(userId, hotelId, dateId);
  await setDoc(ref, updateData, { merge: true });
  return updateData;
};

export const submitDailyRecord = async (userId, hotelId, dateId, data) => {
  if (hotelId === 'ALL') throw new Error("Cannot submit in ALL mode");
  if (!data) return;
  validateRecord(data);
  const updateData = sanitizeRecord(data, dateId);
  updateData.status = 'submitted';
  const ref = getRecordRef(userId, hotelId, dateId);
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
    .map((d) => ({ id: d.id, date: d.id, hotelId, ...d.data() }))
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
    .map((d) => ({ id: d.id, date: d.id, hotelId, ...d.data() }))
    .filter(r => !r.deleted && hasData(r));
};
