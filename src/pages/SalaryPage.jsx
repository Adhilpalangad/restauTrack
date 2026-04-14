import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Users, Filter, ChevronDown, Loader2, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  addSalaryEntry,
  getSalaryEntries,
  getSalaryEmployees,
  softDeleteSalaryEntry,
  isExistingEmployee,
} from '../services/salaryService';
import { getToday, getDateRange, formatDisplayDate } from '../utils/dates';
import { formatCurrency } from '../utils/currency';

const DATE_PRESETS = [
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisQuarter', label: 'This Quarter' },
  { key: 'thisYear', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

const SalaryPage = () => {
  const { user } = useAuth();
  const today = getToday();

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [remarks, setRemarks] = useState('');
  const [adding, setAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── Employee autocomplete ─────────────────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [isNew, setIsNew] = useState(false);

  // ── Entries ───────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterName, setFilterName] = useState('');
  const [preset, setPreset] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  const loadEmployees = useCallback(async () => {
    if (!user) return;
    try {
      const emps = await getSalaryEmployees(user.uid);
      setEmployees(emps);
    } catch {
      // non-fatal
    }
  }, [user]);

  const loadEntries = useCallback(async (start, end) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getSalaryEntries(user.uid, { startDate: start, endDate: end });
      setEntries(data);
    } catch {
      toast.error('Failed to load salary entries');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const range = getDateRange('thisMonth');
    setStartDate(range.start);
    setEndDate(range.end);
    loadEmployees();
    loadEntries(range.start, range.end);
  }, [user]);

  // ── Name autocomplete helpers ─────────────────────────────────────────────
  const filteredEmps = employees.filter(
    (e) => name.length > 0 && e.name.toLowerCase().includes(name.toLowerCase())
  );

  const handleNameChange = (val) => {
    setName(val);
    setIsNew(val.trim().length > 0 && !isExistingEmployee(employees, val));
    setShowDropdown(val.length > 0 && filteredEmps.length > 0);
  };

  const selectEmployee = (empName) => {
    setName(empName);
    setIsNew(false);
    setShowDropdown(false);
  };

  // ── Add salary ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Enter employee name'); return; }
    const paise = parseInt(amount) * 100;
    if (!amount || isNaN(paise) || paise <= 0) { toast.error('Enter a valid amount'); return; }

    setAdding(true);
    try {
      const entry = await addSalaryEntry(user.uid, {
        name: name.trim(),
        amount: paise,
        date,
        remarks: remarks.trim(),
      });

      // Only add to visible list if it falls in current date range
      if (entry.date >= startDate && entry.date <= endDate) {
        setEntries((prev) =>
          [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date))
        );
      }

      await loadEmployees();
      setName('');
      setAmount('');
      setRemarks('');
      setDate(today);
      setIsNew(false);
      toast.success(`Salary added for ${entry.name}`);
    } catch {
      toast.error('Failed to add salary entry');
    } finally {
      setAdding(false);
    }
  };

  // ── Preset / date filter ──────────────────────────────────────────────────
  const handlePresetChange = (key) => {
    setPreset(key);
    setShowCustom(key === 'custom');
    setFilterName('');
    if (key !== 'custom') {
      const range = getDateRange(key);
      setStartDate(range.start);
      setEndDate(range.end);
      loadEntries(range.start, range.end);
    }
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate) { toast.error('Select both dates'); return; }
    loadEntries(startDate, endDate);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await softDeleteSalaryEntry(user.uid, deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ── Derived display data ──────────────────────────────────────────────────
  const displayed = filterName ? entries.filter((e) => e.name === filterName) : entries;
  const total = displayed.reduce((sum, e) => sum + (e.amount || 0), 0);
  const uniqueNames = [...new Set(entries.map((e) => e.name))].sort();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4 pb-36">

      {/* ── Add salary form ─────────────────────────────────────────────── */}
      <div className="glass-card p-5 animate-slide-up">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              boxShadow: '0 4px 14px rgba(245,158,11,0.38)',
            }}
          >
            <Banknote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Add Salary</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Staff payment entry</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Name with autocomplete */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Employee Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (name.length > 0 && filteredEmps.length > 0) setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Type name…"
                className="input-field"
                autoComplete="off"
              />

              {/* New employee indicator */}
              {isNew && (
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(245,158,11,0.85)' }}>
                  New employee — will be saved automatically
                </p>
              )}

              {/* Autocomplete dropdown */}
              {showDropdown && filteredEmps.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1.5 rounded-xl z-50 max-h-44 overflow-y-auto scrollbar-glass animate-scale-in"
                  style={{
                    background: 'rgba(13,15,39,0.97)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                  }}
                >
                  {filteredEmps.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onMouseDown={() => selectEmployee(emp.name)}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-all first:rounded-t-xl last:rounded-b-xl"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(245,158,11,0.12)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                      }}
                    >
                      <span>{emp.name}</span>
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {emp.usageCount}×
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Amount
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="0"
                  className="input-field pl-8 currency-display"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Date
              </label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Remarks <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. April salary, advance…"
              className="input-field"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={adding}
            className="btn-accent w-full flex items-center justify-center gap-2"
          >
            {adding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Salary
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Filter section ──────────────────────────────────────────────── */}
      <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4" style={{ color: 'rgba(129,140,248,0.7)' }} />
          <span className="text-sm font-bold text-white">Filter Records</span>
        </div>

        {/* Date preset pills */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePresetChange(p.key)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
              style={
                preset === p.key
                  ? { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', boxShadow: '0 2px 10px rgba(99,102,241,0.35)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.42)' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date pickers */}
        {showCustom && (
          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <button onClick={handleApplyCustom} className="btn-primary w-full py-2.5 text-sm">
              Apply Range
            </button>
          </div>
        )}

        {/* Filter by employee name */}
        {uniqueNames.length > 0 && (
          <div className="relative">
            <select
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="input-field appearance-none pr-9 cursor-pointer"
              style={{ color: filterName ? 'white' : 'rgba(255,255,255,0.38)' }}
            >
              <option value="">All Employees</option>
              {uniqueNames.map((n) => (
                <option key={n} value={n} style={{ background: '#0D0F27', color: 'white' }}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            />
          </div>
        )}
      </div>

      {/* ── Total summary strip ─────────────────────────────────────────── */}
      {displayed.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center justify-between animate-fade-in"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.16)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {filterName ? `Total paid to` : 'Total paid'}
            </p>
            {filterName && <p className="text-xs font-bold text-white">{filterName}</p>}
          </div>
          <p className="text-2xl font-bold gradient-text-accent currency-display">
            {formatCurrency(total)}
          </p>
        </div>
      )}

      {/* ── Salary entries list ─────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 animate-fade-in">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.14)' }}
          >
            <Users className="w-8 h-8" style={{ color: 'rgba(245,158,11,0.4)' }} />
          </div>
          <p className="text-sm font-semibold text-white mb-1">No salary entries</p>
          <p className="text-xs text-center max-w-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {filterName ? `No payments found for ${filterName} in this period` : 'No salary records for this period'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((entry, i) => (
            <div
              key={entry.id}
              className="rounded-xl flex items-center gap-3 p-3.5 animate-slide-in"
              style={{
                animationDelay: `${i * 30}ms`,
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Initial avatar */}
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}
              >
                {entry.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{entry.name}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {formatDisplayDate(entry.date)}
                  {entry.remarks ? ` · ${entry.remarks}` : ''}
                </p>
              </div>

              {/* Amount */}
              <p className="text-base font-bold gradient-text-accent currency-display flex-shrink-0">
                {formatCurrency(entry.amount)}
              </p>

              {/* Delete */}
              <button
                onClick={() => setDeleteTarget(entry)}
                className="p-2 rounded-lg flex-shrink-0 transition-all"
                style={{ color: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F43F5E';
                  e.currentTarget.style.background = 'rgba(244,63,94,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label={`Delete salary entry for ${entry.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirmation modal ───────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Salary Entry?"
        actions={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </>
        }
      >
        <p className="text-sm">
          Delete salary of{' '}
          <span className="text-white font-bold">{deleteTarget ? formatCurrency(deleteTarget.amount) : ''}</span>{' '}
          for <span className="text-white font-bold">{deleteTarget?.name}</span>
          {deleteTarget?.remarks ? ` (${deleteTarget.remarks})` : ''}?
        </p>
      </Modal>
    </div>
  );
};

export default SalaryPage;
