import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Check, Loader2, Lock, Unlock, CalendarDays, CheckCircle2, ChevronDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import IncomeCard from '../components/income/IncomeCard';
import ExpenseCard from '../components/expenses/ExpenseCard';
import DailySummary from '../components/summary/DailySummary';
import Modal from '../components/common/Modal';
import Skeleton from '../components/common/Skeleton';
import SalaryPage from './SalaryPage';

import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { useCategories } from '../hooks/useCategories';
import {
  getDailyRecord,
  submitDailyRecord,
  unlockDailyRecord,
  softDeleteRecord,
  createEmptyRecord,
} from '../services/dailyRecordService';
import { incrementCategoryUsage } from '../services/categoryService';
import { generateDailyPDF } from '../services/pdfService';
import { getToday, formatDisplayDate, getPreviousDate } from '../utils/dates';

const TodayPage = () => {
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const today = getToday();

  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const isSalary = selectedHotel === 'SALARY';

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hooks always called unconditionally (React rules)
  const { triggerAutoSave, saveStatus } = useAutoSave(
    user?.uid,
    isSalary ? null : selectedHotel,
    selectedDate
  );
  const { searchCategories, refreshCategories } = useCategories(user?.uid);

  // Load record — skip when SALARY tab is active
  useEffect(() => {
    if (isSalary) {
      setLoading(false);
      return;
    }

    setRecord(null);
    setLoading(true);

    const loadRecord = async () => {
      if (!user) return;
      try {
        let rec = await getDailyRecord(user.uid, selectedHotel, selectedDate);
        if (!rec) {
          rec = createEmptyRecord(selectedDate);
        }
        setRecord(rec);
      } catch (err) {
        console.error('Failed to load record:', err);
        toast.error('Failed to load record');
      } finally {
        setLoading(false);
      }
    };
    loadRecord();
  }, [user, selectedHotel, selectedDate, isSalary]);

  const isReadOnly = record?.status === 'submitted';

  const totalExpense = record?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const totalIncome = record?.income?.total || 0;
  const netProfit = totalIncome - totalExpense;
  const hasData = totalIncome > 0 || totalExpense > 0;

  const updateRecord = useCallback((updates) => {
    setRecord((prev) => {
      const updated = { ...prev, ...updates };
      updated.totalExpense = (updated.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      updated.netProfit = (updated.income?.total || 0) - updated.totalExpense;
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const handleIncomeChange = (income) => updateRecord({ income });
  const handleExpensesChange = (expenses) => updateRecord({ expenses });

  const handleCopyFromPrevious = async () => {
    try {
      const prevDate = getPreviousDate(selectedDate);
      const prevRecord = await getDailyRecord(user.uid, selectedHotel, prevDate);
      if (!prevRecord || !prevRecord.expenses?.length) {
        toast.error('No expenses found from the previous day');
        return;
      }
      const copied = prevRecord.expenses.map((e) => ({
        id: crypto.randomUUID(),
        category: e.category,
        amount: 0,
        note: '',
        timestamp: Timestamp.now(),
      }));
      handleExpensesChange([...(record?.expenses || []), ...copied]);
      toast.success(`Copied ${copied.length} categories from previous day`);
    } catch {
      toast.error('Failed to copy from previous day');
    }
  };

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      const finalData = { ...record, totalExpense, netProfit, status: 'submitted' };
      await submitDailyRecord(user.uid, selectedHotel, selectedDate, finalData);
      setRecord(finalData);
      const categories = record.expenses.map((e) => e.category).filter((c) => c?.trim());
      for (const cat of [...new Set(categories)]) {
        await incrementCategoryUsage(user.uid, cat);
      }
      await refreshCategories();
      toast.success('Record submitted!');
      if (navigator.vibrate) navigator.vibrate(10);
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async () => {
    setShowUnlockModal(false);
    try {
      await unlockDailyRecord(user.uid, selectedHotel, selectedDate);
      setRecord((prev) => ({ ...prev, status: 'draft' }));
      toast.success('Record unlocked for editing');
    } catch {
      toast.error('Failed to unlock record');
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      if (record?.id) {
        await softDeleteRecord(user.uid, selectedHotel, selectedDate);
      }
      setRecord(createEmptyRecord(selectedDate));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const SaveIndicator = () => {
    if (saveStatus === 'saving') {
      return (
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving…</span>
        </div>
      );
    }
    if (saveStatus === 'saved') {
      return (
        <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(52,211,153,0.85)' }}>
          <Check className="w-3 h-3" />
          <span>Saved</span>
        </div>
      );
    }
    return null;
  };

  // ── Salary tab — render salary management UI ──────────────────────────────
  if (isSalary) {
    return (
      <>
        <Header title="RestauTrack" />
        <SalaryPage />
      </>
    );
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header title="RestauTrack" />
        <div className="p-4 space-y-4">
          <div className="skeleton h-12 w-full rounded-2xl" />
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </>
    );
  }

  // ── Normal daily entry view ───────────────────────────────────────────────
  return (
    <>
      <Header title="RestauTrack" rightContent={<SaveIndicator />} />

      <div className="p-4 space-y-4 pb-56">

        {/* Date bar */}
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: 'var(--date-bar-bg)', border: '1px solid var(--date-bar-border)' }}
        >
          {/* Clickable date picker */}
          <div className="relative flex items-center gap-2.5">
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Select date"
            />
            <CalendarDays className="w-4 h-4 pointer-events-none" style={{ color: 'rgba(129,140,248,0.8)' }} />
            <span className="text-sm font-bold pointer-events-none" style={{ color: 'var(--text)' }}>
              {formatDisplayDate(selectedDate)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={() => setSelectedDate(today)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
                style={{ background: 'var(--today-btn-bg)', border: '1px solid var(--today-btn-border)', color: 'var(--today-btn-color)' }}
              >
                Today
              </button>
            )}

            {hasData && (
              <button
                onClick={() => generateDailyPDF(record, selectedHotel, false)}
                title="Download PDF"
                className="text-xs font-semibold px-3 py-1 rounded-lg transition-all active:scale-95"
                style={{ background: 'var(--pdf-btn-bg)', border: '1px solid var(--pdf-btn-border)', color: 'var(--pdf-btn-color)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.20)'; e.currentTarget.style.color = '#6366F1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pdf-btn-bg)'; e.currentTarget.style.color = 'var(--pdf-btn-color)'; }}
              >
                PDF
              </button>
            )}

            <span className={record?.status === 'submitted' ? 'badge-submitted' : 'badge-draft'}>
              {record?.status === 'submitted' ? (
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Submitted</span>
              ) : 'Draft'}
            </span>
          </div>
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
          onCopyFromYesterday={handleCopyFromPrevious}
          totalExpense={totalExpense}
        />

        {/* Actions */}
        <div className="space-y-2">
          {isReadOnly ? (
            <button
              onClick={() => setShowUnlockModal(true)}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              Unlock & Edit
            </button>
          ) : (
            hasData && (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Submitting…</>
                ) : (
                  <><Lock className="w-4 h-4" />{isToday ? 'Submit Day' : `Submit ${formatDisplayDate(selectedDate)}`}</>
                )}
              </button>
            )
          )}

          {hasData && !isReadOnly && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: 'rgba(244,63,94,0.55)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(244,63,94,0.55)')}
            >
              <Trash2 className="w-4 h-4" />
              Delete Record
            </button>
          )}
        </div>
      </div>

      <DailySummary income={totalIncome} totalExpense={totalExpense} netProfit={netProfit} />

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Record?"
        actions={
          <>
            <button onClick={() => setShowSubmitModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Submit</button>
          </>
        }
      >
        <p className="text-sm">
          Submit the record for <span className="font-semibold" style={{ color: 'var(--text)' }}>{formatDisplayDate(selectedDate)}</span>?
          You can unlock it later if needed.
        </p>
      </Modal>

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
        <p className="text-sm">
          Unlock <span className="font-semibold" style={{ color: 'var(--text)' }}>{formatDisplayDate(selectedDate)}</span> for editing?
        </p>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Record?"
        actions={
          <>
            <button onClick={() => setShowDeleteModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </>
        }
      >
        <p className="text-sm">
          Delete the record for <span className="font-semibold" style={{ color: 'var(--text)' }}>{formatDisplayDate(selectedDate)}</span>?
          This is recoverable by the admin if needed.
        </p>
      </Modal>
    </>
  );
};

export default TodayPage;
