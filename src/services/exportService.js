import * as XLSX from 'xlsx';
import { formatCurrencyDetailed } from '../utils/currency';

export const exportToExcel = (records, startDate, endDate) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Daily Records
  const dailyData = records.map((r) => ({
    'Date': r.date,
    'Cash Income (₹)': (r.income?.cash || 0) / 100,
    'Online Income (₹)': (r.income?.online || 0) / 100,
    'Total Income (₹)': (r.income?.total || 0) / 100,
    'Total Expense (₹)': (r.totalExpense || 0) / 100,
    'Net Profit (₹)': (r.netProfit || 0) / 100,
    'Status': r.status || 'draft',
  }));
  const ws1 = XLSX.utils.json_to_sheet(dailyData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Daily Records');

  // Sheet 2: Category Summary
  const categoryMap = {};
  records.forEach((r) => {
    (r.expenses || []).forEach((e) => {
      const cat = e.category || 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0 };
      }
      categoryMap[cat].total += e.amount || 0;
      categoryMap[cat].count += 1;
    });
  });

  const totalExpenseAll = Object.values(categoryMap).reduce((s, c) => s + c.total, 0);
  const categoryData = Object.entries(categoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, data]) => ({
      'Category': name,
      'Total Spent (₹)': data.total / 100,
      '% of Total': totalExpenseAll > 0 ? ((data.total / totalExpenseAll) * 100).toFixed(1) + '%' : '0%',
      'Entries': data.count,
    }));
  const ws2 = XLSX.utils.json_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Category Summary');

  // Sheet 3: Income Summary
  const totalCash = records.reduce((s, r) => s + (r.income?.cash || 0), 0);
  const totalOnline = records.reduce((s, r) => s + (r.income?.online || 0), 0);
  const incomeData = [
    { 'Type': 'Cash Income', 'Total (₹)': totalCash / 100 },
    { 'Type': 'Online Income', 'Total (₹)': totalOnline / 100 },
    { 'Type': 'Total Income', 'Total (₹)': (totalCash + totalOnline) / 100 },
  ];
  const ws3 = XLSX.utils.json_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Income Summary');

  // Download
  const fileName = `RestauTrack_Report_${startDate}_to_${endDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportAllData = (records) => {
  const data = JSON.stringify(records, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RestauTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
