import { Trash2, ChevronDown, ChevronUp, StickyNote } from 'lucide-react';
import { useState } from 'react';
import CategoryAutocomplete from './CategoryAutocomplete';

const ExpenseRow = ({ expense, onUpdate, onDelete, searchCategories, readOnly, index }) => {
  const [showNote, setShowNote] = useState(!!expense.note);

  const handleAmountChange = (value) => {
    const cleaned = value.replace(/[^\d]/g, '');
    const paise = cleaned ? parseInt(cleaned) * 100 : 0;
    onUpdate({ ...expense, amount: paise });
  };

  const displayAmount = (paise) => {
    if (paise === 0) return '';
    return (paise / 100).toString();
  };

  return (
    <div className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start gap-2">
        {/* Category */}
        <CategoryAutocomplete
          value={expense.category}
          onChange={(val) => onUpdate({ ...expense, category: val })}
          onSearch={searchCategories}
          disabled={readOnly}
        />

        {/* Amount */}
        <div className="relative w-28 flex-shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">₹</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayAmount(expense.amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="input-field text-sm py-2 pl-7 currency-display"
            disabled={readOnly}
            aria-label={`Amount for ${expense.category || 'expense'}`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-0.5">
          <button
            type="button"
            onClick={() => setShowNote(!showNote)}
            className={`p-2 rounded-lg transition-colors ${
              showNote || expense.note ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-body hover:bg-gray-100'
            }`}
            disabled={readOnly}
            aria-label="Toggle note"
          >
            <StickyNote className="w-4 h-4" />
          </button>
          
          {!readOnly && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              aria-label="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note (collapsible) */}
      {showNote && (
        <div className="mt-2 ml-0 animate-fade-in">
          <input
            type="text"
            value={expense.note || ''}
            onChange={(e) => onUpdate({ ...expense, note: e.target.value })}
            placeholder="Add a note (e.g., 10 kg broiler)"
            className="input-field text-sm py-2 bg-gray-50"
            disabled={readOnly}
            aria-label={`Note for ${expense.category || 'expense'}`}
          />
        </div>
      )}
    </div>
  );
};

export default ExpenseRow;
