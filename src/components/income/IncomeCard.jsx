import { TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const IncomeCard = ({ income, onChange, readOnly }) => {
  const handleChange = (field, value) => {
    const cleaned = value.replace(/[^\d]/g, '');
    const paise = cleaned ? parseInt(cleaned) * 100 : 0;
    const updated = { ...income, [field]: paise };
    updated.total = updated.cash + updated.online;
    onChange(updated);
  };

  const displayValue = (paise) => {
    if (paise === 0) return '';
    return (paise / 100).toString();
  };

  return (
    <div className="glass-card p-5 animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.38)',
            }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Revenue</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Today's income
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold gradient-text-success currency-display">
            {formatCurrency(income.total)}
          </p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
            total
          </p>
        </div>
      </div>

      {/* Two input panels */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cash */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(16, 185, 129, 0.07)',
            border: '1px solid rgba(16, 185, 129, 0.14)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Wallet className="w-3.5 h-3.5" style={{ color: 'rgba(52,211,153,0.7)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(52,211,153,0.6)' }}>
              Cash
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>₹</span>
            <input
              id="income-cash"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={displayValue(income.cash)}
              onChange={(e) => handleChange('cash', e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white currency-display min-w-0"
              style={{ caretColor: '#10B981' }}
              disabled={readOnly}
              aria-label="Cash income amount"
            />
          </div>
        </div>

        {/* Online */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(99, 102, 241, 0.07)',
            border: '1px solid rgba(99, 102, 241, 0.14)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <CreditCard className="w-3.5 h-3.5" style={{ color: 'rgba(129,140,248,0.7)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(129,140,248,0.6)' }}>
              Online
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>₹</span>
            <input
              id="income-online"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={displayValue(income.online)}
              onChange={(e) => handleChange('online', e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white currency-display min-w-0"
              style={{ caretColor: '#6366F1' }}
              disabled={readOnly}
              aria-label="Online income amount"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeCard;
