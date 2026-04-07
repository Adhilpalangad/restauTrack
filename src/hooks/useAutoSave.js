import { useRef, useCallback, useEffect, useState } from 'react';
import { saveDailyRecord } from '../services/dailyRecordService';
import { AUTO_SAVE_DELAY } from '../utils/constants';

export const useAutoSave = (userId, dateId) => {
  const timerRef = useRef(null);
  const pendingDataRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

  const flushPendingWrites = useCallback(async () => {
    if (pendingDataRef.current && userId && dateId) {
      try {
        setSaveStatus('saving');
        await saveDailyRecord(userId, dateId, pendingDataRef.current);
        pendingDataRef.current = null;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Auto-save flush failed:', err);
        setSaveStatus('error');
      }
    }
  }, [userId, dateId]);

  const triggerAutoSave = useCallback((data) => {
    pendingDataRef.current = data;
    setSaveStatus('idle');
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      if (pendingDataRef.current && userId && dateId) {
        try {
          setSaveStatus('saving');
          await saveDailyRecord(userId, dateId, pendingDataRef.current);
          pendingDataRef.current = null;
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
          console.error('Auto-save failed:', err);
          setSaveStatus('error');
        }
      }
    }, AUTO_SAVE_DELAY);
  }, [userId, dateId]);

  // Flush on beforeunload and visibilitychange
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingDataRef.current && userId && dateId) {
        // Use sync approach for beforeunload
        saveDailyRecord(userId, dateId, pendingDataRef.current).catch(() => {});
        pendingDataRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingWrites();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearTimeout(timerRef.current);
      // Flush on unmount
      flushPendingWrites();
    };
  }, [flushPendingWrites, userId, dateId]);

  return { triggerAutoSave, flushPendingWrites, saveStatus };
};
