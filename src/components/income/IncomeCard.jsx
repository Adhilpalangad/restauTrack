import { DollarSign, CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const IncomeCard = ({ income, onChange, readOnly }) => {
  const handleChange = (field, value) => {
    // Only allow digits
    const cleaned = value.replace(/[^\d]/g, '');
    const paise = cleaned ? parseInt(cleaned) * 100 : 0;
    
    const updated = {
      ...income,
      [field]: paise,
    };
    updated.total = updated.cash + updated.online;
    onChange(updated);
  };

  const displayValue = (paise) => {
    if (paise === 0) return '';
    return (paise / 100).toString();
  };

  return (
    <div className="card border-l-4 border-l-success animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
          <DollarSign className="w-4.5 h-4.5 text-success" />
        </div>
        <h2 className="text-base font-semibold text-text-primary">Income</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="income-cash" className="flex items-center gap-1.5 text-sm text-text-body mb-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Cash Received
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium">₹</span>
            <input
              id="income-cash"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={displayValue(income.cash)}
              onChange={(e) => handleChange('cash', e.target.value)}
              placeholder="0"
              className="input-field pl-8 currency-display"
              disabled={readOnly}
              aria-label="Cash income amount"
            />
          </div>
        </div>

        <div>
          <label htmlFor="income-online" className="flex items-center gap-1.5 text-sm text-text-body mb-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Online Payments
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium">₹</span>
            <input
              id="income-online"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={displayValue(income.online)}
              onChange={(e) => handleChange('online', e.target.value)}
              placeholder="0"
              className="input-field pl-8 currency-display"
              disabled={readOnly}
              aria-label="Online income amount"
            />
          </div>
        </div>

        {/* Total */}
        <div className="bg-success/5 rounded-xl p-3 flex items-center justify-between border border-success/10">
          <span className="text-sm font-medium text-text-body">Total Income</span>
          <span className="text-lg font-bold text-success currency-display">
            {formatCurrency(income.total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncomeCard;
