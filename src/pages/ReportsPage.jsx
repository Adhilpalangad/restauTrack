import { useState, useEffect } from 'react';
import { BarChart3, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { getAllRecordsByDateRange } from '../services/dailyRecordService';
import { exportToExcel } from '../services/exportService';
import { getDateRange, formatShortDate } from '../utils/dates';
import { formatCurrency } from '../utils/currency';
import { REPORT_PERIODS } from '../utils/constants';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';

const CHART_COLORS = ['#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

const ReportsPage = () => {
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setRecords([]);
    const range = getDateRange('thisMonth');
    setStartDate(range.start);
    setEndDate(range.end);
    fetchRecords(range.start, range.end);
  }, [user, selectedHotel]);

  const fetchRecords = async (start, end) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAllRecordsByDateRange(user.uid, selectedHotel, start, end);
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (key) => {
    setActivePeriod(key);
    if (key !== 'custom') {
      const range = getDateRange(key);
      setStartDate(range.start);
      setEndDate(range.end);
      fetchRecords(range.start, range.end);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      exportToExcel(records, startDate, endDate);
      toast.success('Report exported successfully!');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const totalIncome = records.reduce((s, r) => s + (r.income?.total || 0), 0);
  const totalExpense = records.reduce((s, r) => s + (r.totalExpense || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const avgDailyProfit = records.length > 0 ? Math.round(netProfit / records.length) : 0;

  const trendData = [...records].reverse().map((r) => ({
    date: formatShortDate(r.date),
    income: (r.income?.total || 0) / 100,
    expense: (r.totalExpense || 0) / 100,
  }));

  const profitData = [...records].reverse().map((r) => ({
    date: formatShortDate(r.date),
    profit: (r.netProfit || 0) / 100,
  }));

  const categoryMap = {};
  records.forEach((r) => {
    (r.expenses || []).forEach((e) => {
      const cat = e.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
      categoryMap[cat].total += e.amount || 0;
      categoryMap[cat].count += 1;
    });
  });

  const categoryData = Object.entries(categoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, data], i) => ({
      name,
      value: data.total / 100,
      count: data.count,
      paise: data.total,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const totalCatExpense = categoryData.reduce((s, c) => s + c.paise, 0);

  const cashOnlineData = [...records].reverse().map((r) => ({
    date: formatShortDate(r.date),
    cash: (r.income?.cash || 0) / 100,
    online: (r.income?.online || 0) / 100,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div
        className="rounded-xl p-2.5 text-xs"
        style={{
          background: 'var(--modal-bg)',
          border: '1px solid var(--modal-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}:</span>
            <span className="font-medium">₹{p.value?.toLocaleString('en-IN')}</span>
          </p>
        ))}
      </div>
    );
  };

  const StatCard = ({ label, value, positive }) => (
    <div className="glass-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p
        className="text-lg font-bold currency-display"
        style={{ color: positive === undefined ? 'var(--text)' : positive ? '#10B981' : '#F43F5E' }}
      >
        {value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header title="Reports" />
        <div className="p-4 space-y-4">
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-60" />
          <Skeleton variant="card" className="h-60" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Reports"
        rightContent={
          records.length > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)', color: 'var(--text-muted)' }}
              aria-label="Export to Excel"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Period selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1">
          {REPORT_PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePeriodChange(p.key)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-[0.97]"
              style={
                activePeriod === p.key
                  ? { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', boxShadow: '0 2px 10px rgba(99,102,241,0.35)' }
                  : { background: 'var(--hotel-tab-inactive-bg)', border: '1px solid var(--hotel-tab-inactive-border)', color: 'var(--hotel-tab-inactive-color)' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {activePeriod === 'custom' && (
          <div className="flex gap-2 items-end animate-fade-in">
            <div className="flex-1">
              <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm py-2" />
            </div>
            <div className="flex-1">
              <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm py-2" />
            </div>
            <button onClick={() => fetchRecords(startDate, endDate)} className="btn-primary py-2 px-4 text-sm">Go</button>
          </div>
        )}

        {records.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Start tracking to see reports and insights."
          />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Income" value={formatCurrency(totalIncome)} positive={true} />
              <StatCard label="Total Expense" value={formatCurrency(totalExpense)} positive={false} />
              <StatCard label="Net Profit" value={(netProfit >= 0 ? '' : '−') + formatCurrency(Math.abs(netProfit))} positive={netProfit >= 0} />
              <StatCard label="Avg Daily Profit" value={(avgDailyProfit >= 0 ? '' : '−') + formatCurrency(Math.abs(avgDailyProfit))} positive={avgDailyProfit >= 0} />
            </div>

            {/* Income vs Expense Trend */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Income vs Expense</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="var(--divider)" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="var(--divider)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Category Breakdown */}
            {categoryData.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Expense Categories</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {categoryData.slice(0, 6).map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate" style={{ color: 'var(--text-muted)' }}>{c.name}</span>
                      <span className="font-medium ml-auto" style={{ color: 'var(--text-secondary)' }}>
                        {totalCatExpense > 0 ? ((c.paise / totalCatExpense) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Profit Chart */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Daily Profit</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="var(--divider)" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="var(--divider)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
                    {profitData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? '#10B981' : '#F43F5E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cash vs Online */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Cash vs Online Income</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cashOnlineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="var(--divider)" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="var(--divider)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
                  <Bar dataKey="cash" name="Cash" stackId="income" fill="#10B981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="online" name="Online" stackId="income" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Table */}
            {categoryData.length > 0 && (
              <div className="glass-card p-4 overflow-x-auto">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Category Details</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left" style={{ borderBottom: '1px solid var(--divider)' }}>
                      <th className="pb-2 pr-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Category</th>
                      <th className="pb-2 pr-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Spent</th>
                      <th className="pb-2 pr-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>%</th>
                      <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((c) => (
                      <tr key={c.name} style={{ borderBottom: '1px solid var(--divider)' }}>
                        <td className="py-2 pr-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{c.name}</td>
                        <td className="py-2 pr-2 text-right currency-display" style={{ color: 'var(--text)' }}>{formatCurrency(c.paise)}</td>
                        <td className="py-2 pr-2 text-right" style={{ color: 'var(--text-muted)' }}>
                          {totalCatExpense > 0 ? ((c.paise / totalCatExpense) * 100).toFixed(1) : 0}%
                        </td>
                        <td className="py-2 text-right" style={{ color: 'var(--text-muted)' }}>{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ReportsPage;
