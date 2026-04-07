import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Check, Loader2, Lock, Unlock, CalendarDays, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import IncomeCard from '../components/income/IncomeCard';
import ExpenseCard from '../components/expenses/ExpenseCard';
import DailySummary from '../components/summary/DailySummary';
import Modal from '../components/common/Modal';
import Skeleton from '../components/common/Skeleton';

import { useAuth } from '../context/AuthContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { useCategories } from '../hooks/useCategories';
import { getDailyRecord, saveDailyRecord, submitDailyRecord, unlockDailyRecord, createEmptyRecord } from '../services/dailyRecordService';
import { incrementCategoryUsage } from '../services/categoryService';
import { getToday, getYesterday, formatDisplayDate } from '../utils/dates';

const TodayPage = () => {
  const { user } = useAuth();
  const today = getToday();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  const { triggerAutoSave, saveStatus } = useAutoSave(user?.uid, today);
  const { searchCategories, refreshCategories } = useCategories(user?.uid);

  // Load today's record
  useEffect(() => {
    const loadRecord = async () => {
      if (!user) return;
      try {
        let rec = await getDailyRecord(user.uid, today);
        if (!rec) {
          rec = createEmptyRecord(today);
          await saveDailyRecord(user.uid, today, rec);
        }
        setRecord(rec);
      } catch (err) {
        console.error('Failed to load record:', err);
        toast.error('Failed to load today\'s record');
      } finally {
        setLoading(false);
      }
    };
    loadRecord();
  }, [user, today]);

  const isReadOnly = record?.status === 'submitted';

  // Compute totals
  const totalExpense = record?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const totalIncome = record?.income?.total || 0;
  const netProfit = totalIncome - totalExpense;

  // Update & auto-save
  const updateRecord = useCallback((updates) => {
    setRecord((prev) => {
      const updated = { ...prev, ...updates };
      // Recalculate totals
      const expenses = updated.expenses || [];
      updated.totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      updated.netProfit = (updated.income?.total || 0) - updated.totalExpense;
      
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const handleIncomeChange = (income) => {
    updateRecord({ income });
  };

  const handleExpensesChange = (expenses) => {
    updateRecord({ expenses });
  };

  // Copy from yesterday
  const handleCopyFromYesterday = async () => {
    try {
      const yesterday = getYesterday();
      const yesterdayRecord = await getDailyRecord(user.uid, yesterday);
      if (!yesterdayRecord || !yesterdayRecord.expenses?.length) {
        toast.error('No expenses found from yesterday');
        return;
      }
      
      const copiedExpenses = yesterdayRecord.expenses.map((e) => ({
        id: crypto.randomUUID(),
        category: e.category,
        amount: 0, // Clear amounts
        note: '',
        timestamp: Timestamp.now(),
      }));
      
      handleExpensesChange([...(record?.expenses || []), ...copiedExpenses]);
      toast.success(`Copied ${copiedExpenses.length} categories from yesterday`);
    } catch (err) {
      toast.error('Failed to copy from yesterday');
    }
  };

  // Submit
  const handleSubmit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      const finalData = {
        ...record,
        totalExpense,
        netProfit,
        status: 'submitted',
      };
      await submitDailyRecord(user.uid, today, finalData);
      setRecord(finalData);
      
      // Update category usage counts
      const categories = record.expenses
        .map((e) => e.category)
        .filter((c) => c && c.trim());
      
      for (const cat of [...new Set(categories)]) {
        await incrementCategoryUsage(user.uid, cat);
      }
      await refreshCategories();
      
      toast.success('Day submitted successfully!');
      if (navigator.vibrate) navigator.vibrate(10);
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Unlock
  const handleUnlock = async () => {
    setShowUnlockModal(false);
    try {
      await unlockDailyRecord(user.uid, today);
      setRecord((prev) => ({ ...prev, status: 'draft' }));
      toast.success('Record unlocked for editing');
    } catch (err) {
      toast.error('Failed to unlock record');
    }
  };

  // Save status indicator
  const SaveIndicator = () => {
    if (saveStatus === 'saving') {
      return (
        <div className="flex items-center gap-1 text-xs text-white/70">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </div>
      );
    }
    if (saveStatus === 'saved') {
      return (
        <div className="flex items-center gap-1 text-xs text-success">
          <Check className="w-3 h-3" />
          <span>Saved</span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Header title="RestauTrack" />
        <div className="p-4 space-y-4">
          <Skeleton variant="title" className="w-48" />
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-64" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="RestauTrack" 
        rightContent={<SaveIndicator />}
      />
      
      <div className="p-4 space-y-4 pb-36">
        {/* Date & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold text-text-primary">
              {formatDisplayDate(today)}
            </span>
          </div>
          <span className={record?.status === 'submitted' ? 'badge-submitted' : 'badge-draft'}>
            {record?.status === 'submitted' ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted</span>
            ) : 'Draft'}
          </span>
        </div>

        {/* Income */}
        <IncomeCard 
          income={record?.income || { cash: 0, online: 0, total: 0 }}
          onChange={handleIncomeChange}
          readOnly={isReadOnly}
        />

        {/* Expenses */}
        <ExpenseCard
          expenses={record?.expenses || []}
          onChange={handleExpensesChange}
          searchCategories={searchCategories}
          readOnly={isReadOnly}
          onCopyFromYesterday={handleCopyFromYesterday}
          totalExpense={totalExpense}
        />

        {/* Submit / Unlock Button */}
        {isReadOnly ? (
          <button
            onClick={() => setShowUnlockModal(true)}
            className="btn-ghost w-full flex items-center justify-center gap-2 border border-border"
          >
            <Unlock className="w-4 h-4" />
            Unlock & Edit
          </button>
        ) : (
          (totalIncome > 0 || totalExpense > 0) && (
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Submit Day
                </>
              )}
            </button>
          )
        )}
      </div>

      {/* Summary */}
      <DailySummary
        income={totalIncome}
        totalExpense={totalExpense}
        netProfit={netProfit}
      />

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Today's Record?"
        actions={
          <>
            <button onClick={() => setShowSubmitModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Submit</button>
          </>
        }
      >
        <p className="text-sm text-text-body">
          Submit today's record? You won't be able to edit after this. You can unlock it later if needed.
        </p>
      </Modal>

      {/* Unlock Confirmation Modal */}
      <Modal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        title="Unlock Record?"
        actions={
          <>
            <button onClick={() => setShowUnlockModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleUnlock} className="btn-accent flex-1">Unlock</button>
          </>
        }
      >
        <p className="text-sm text-text-body">
          This will unlock the submitted record for editing. Are you sure?
        </p>
      </Modal>
    </>
  );
};

export default TodayPage;
