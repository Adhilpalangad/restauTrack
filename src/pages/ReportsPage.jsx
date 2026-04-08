import { useState, useEffect } from 'react';
import { BarChart3, Download, Loader2, TrendingUp } from 'lucide-react';
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
  Area, AreaChart
} from 'recharts';

const CHART_COLORS = ['#F18F01', '#2E86AB', '#E74C3C', '#2ECC71', '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB'];

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
    // Clear out to avoid cross-hotel data bleeding
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

  // Compute stats
  const totalIncome = records.reduce((s, r) => s + (r.income?.total || 0), 0);
  const totalExpense = records.reduce((s, r) => s + (r.totalExpense || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const avgDailyProfit = records.length > 0 ? Math.round(netProfit / records.length) : 0;

  // Chart data
  const trendData = [...records].reverse().map((r) => ({
    date: formatShortDate(r.date),
    income: (r.income?.total || 0) / 100,
    expense: (r.totalExpense || 0) / 100,
  }));

  const profitData = [...records].reverse().map((r) => ({
    date: formatShortDate(r.date),
    profit: (r.netProfit || 0) / 100,
  }));

  // Category breakdown
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

  // Cash vs Online data
  const cashOnlineData = [...records].reverse().map((r) => ({
    date: formatShortDate(r.date),
    cash: (r.income?.cash || 0) / 100,
    online: (r.income?.online || 0) / 100,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-white rounded-lg shadow-lg border border-border p-2.5 text-xs">
        <p className="font-semibold text-text-primary mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}:</span>
            <span className="font-medium">₹{p.value?.toLocaleString('en-IN')}</span>
          </p>
        ))}
      </div>
    );
  };

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
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Export to Excel"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-[0.97] ${
                activePeriod === p.key
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white text-text-body border border-border'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {activePeriod === 'custom' && (
          <div className="flex gap-2 items-end animate-fade-in">
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm py-2" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">To</label>
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
              <div className="card p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Total Income</p>
                <p className="text-lg font-bold text-success currency-display">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="card p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Total Expense</p>
                <p className="text-lg font-bold text-danger currency-display">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="card p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Net Profit</p>
                <p className={`text-lg font-bold currency-display ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(netProfit))}
                </p>
              </div>
              <div className="card p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Avg Daily Profit</p>
                <p className={`text-lg font-bold currency-display ${avgDailyProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {avgDailyProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(avgDailyProfit))}
                </p>
              </div>
            </div>

            {/* Income vs Expense Trend */}
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Income vs Expense</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9A9ABF" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9A9ABF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#2ECC71" fill="#2ECC71" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Category Breakdown */}
            {categoryData.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Expense Categories</h3>
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
                      <span className="text-text-muted truncate">{c.name}</span>
                      <span className="font-medium text-text-body ml-auto">{totalCatExpense > 0 ? ((c.paise / totalCatExpense) * 100).toFixed(0) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Profit Chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Daily Profit</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9A9ABF" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9A9ABF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
                    {profitData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? '#2ECC71' : '#E74C3C'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cash vs Online */}
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Cash vs Online Income</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cashOnlineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9A9ABF" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9A9ABF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="cash" name="Cash" stackId="income" fill="#2E86AB" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="online" name="Online" stackId="income" fill="#F18F01" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Table */}
            {categoryData.length > 0 && (
              <div className="card overflow-x-auto">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Category Details</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-text-muted border-b border-border">
                      <th className="pb-2 pr-2">Category</th>
                      <th className="pb-2 pr-2 text-right">Spent</th>
                      <th className="pb-2 pr-2 text-right">%</th>
                      <th className="pb-2 text-right">Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((c) => (
                      <tr key={c.name} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-2 text-text-body font-medium">{c.name}</td>
                        <td className="py-2 pr-2 text-right currency-display">{formatCurrency(c.paise)}</td>
                        <td className="py-2 pr-2 text-right text-text-muted">
                          {totalCatExpense > 0 ? ((c.paise / totalCatExpense) * 100).toFixed(1) : 0}%
                        </td>
                        <td className="py-2 text-right text-text-muted">{c.count}</td>
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
