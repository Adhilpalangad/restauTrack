import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const DailySummary = ({ income, totalExpense, netProfit }) => {
  const isProfit = netProfit >= 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 safe-bottom">
      <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-border p-3">
        <div className="grid grid-cols-3 gap-2">
          {/* Income */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Income</span>
            </div>
            <p className="text-base font-bold text-success currency-display">
              {formatCurrency(income)}
            </p>
          </div>

          {/* Expense */}
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Expense</span>
            </div>
            <p className="text-base font-bold text-danger currency-display">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          {/* Profit */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ArrowUpDown className="w-3.5 h-3.5" style={{ color: isProfit ? '#2ECC71' : '#E74C3C' }} />
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Profit</span>
            </div>
            <p className={`text-base font-bold currency-display ${isProfit ? 'text-success' : 'text-danger'}`}>
              {isProfit ? '' : '-'}{formatCurrency(Math.abs(netProfit))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
