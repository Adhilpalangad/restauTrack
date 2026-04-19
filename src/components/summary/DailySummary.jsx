import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const DailySummary = ({ income, totalExpense, netProfit }) => {
  const isProfit = netProfit >= 0;

  return (
    <div className="fixed bottom-[88px] left-0 right-0 z-30 px-4">
      <div
        className="max-w-lg mx-auto rounded-2xl p-4"
        style={{
          background: 'var(--summary-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid var(--summary-border)',
          boxShadow: 'var(--summary-shadow)',
        }}
      >
        {/* Top accent strip */}
        <div
          className="h-px w-full rounded-full mb-3"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 30%, rgba(139,92,246,0.4) 70%, transparent 100%)',
          }}
        />

        <div className="grid grid-cols-3 gap-2">
          {/* Income */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3" style={{ color: 'rgba(52,211,153,0.6)' }} />
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Income
              </span>
            </div>
            <p className="text-base font-bold gradient-text-success currency-display leading-tight">
              {formatCurrency(income)}
            </p>
          </div>

          {/* Expense */}
          <div
            className="text-center border-x"
            style={{ borderColor: 'var(--summary-divider)' }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-3 h-3" style={{ color: 'rgba(251,113,133,0.6)' }} />
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Expense
              </span>
            </div>
            <p className="text-base font-bold gradient-text-danger currency-display leading-tight">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          {/* Profit */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Minus className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Profit
              </span>
            </div>
            <p
              className={`text-base font-bold currency-display leading-tight ${
                isProfit ? 'gradient-text-success' : 'gradient-text-danger'
              }`}
            >
              {isProfit ? '' : '−'}{formatCurrency(Math.abs(netProfit))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
