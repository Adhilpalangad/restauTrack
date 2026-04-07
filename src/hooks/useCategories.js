import { useState, useEffect } from 'react';
import { getCategories } from '../services/categoryService';

export const useCategories = (userId) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchCategories = async () => {
      try {
        const cats = await getCategories(userId);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [userId]);

  const searchCategories = (searchTerm) => {
    if (!searchTerm) return categories.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return categories
      .filter((c) => c.name.toLowerCase().includes(term))
      .slice(0, 8);
  };

  const refreshCategories = async () => {
    if (!userId) return;
    try {
      const cats = await getCategories(userId);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to refresh categories:', err);
    }
  };

  return { categories, loading, searchCategories, refreshCategories };
};
