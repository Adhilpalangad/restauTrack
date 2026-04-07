import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const getCategoriesCollection = (userId) => {
  return collection(db, 'users', userId, 'categories');
};

export const getCategories = async (userId) => {
  const col = getCategoriesCollection(userId);
  const q = query(col, orderBy('usageCount', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateCategoryUsage = async (userId, categoryName) => {
  const normalizedName = categoryName.trim().toLowerCase();
  const ref = doc(db, 'users', userId, 'categories', normalizedName);
  
  await setDoc(ref, {
    name: categoryName.trim(),
    usageCount: 1, // Will be incremented via a custom merge
    lastUsed: Timestamp.now(),
  }, { merge: true });
};

export const incrementCategoryUsage = async (userId, categoryName) => {
  const normalizedName = categoryName.trim().toLowerCase();
  const ref = doc(db, 'users', userId, 'categories', normalizedName);
  
  // Get current count first
  const { getDoc } = await import('firebase/firestore');
  const snap = await getDoc(ref);
  const currentCount = snap.exists() ? (snap.data().usageCount || 0) : 0;
  
  await setDoc(ref, {
    name: categoryName.trim(),
    usageCount: currentCount + 1,
    lastUsed: Timestamp.now(),
  }, { merge: true });
};

export const deleteCategory = async (userId, categoryId) => {
  const ref = doc(db, 'users', userId, 'categories', categoryId);
  await deleteDoc(ref);
};
