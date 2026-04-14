import { Trash2, StickyNote } from 'lucide-react';
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
    <div
      className="rounded-xl overflow-hidden animate-slide-in"
      style={{
        animationDelay: `${index * 40}ms`,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center gap-2 p-2.5">
        {/* Index badge */}
        <div
          className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.28)' }}
        >
          {index + 1}
        </div>

        {/* Category */}
        <CategoryAutocomplete
          value={expense.category}
          onChange={(val) => onUpdate({ ...expense, category: val })}
          onSearch={searchCategories}
          disabled={readOnly}
        />

        {/* Amount */}
        <div className="relative w-28 flex-shrink-0">
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
            value={displayAmount(expense.amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="w-full py-2.5 pl-8 pr-3 rounded-lg text-sm font-bold text-white currency-display focus:outline-none transition-all"
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.16)',
              caretColor: '#F43F5E',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(244, 63, 94, 0.45)';
              e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(244, 63, 94, 0.16)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={readOnly}
            aria-label={`Amount for ${expense.category || 'expense'}`}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setShowNote(!showNote)}
            className="p-2 rounded-lg transition-all"
            style={
              showNote || expense.note
                ? { color: '#FBBF24', background: 'rgba(245,158,11,0.12)' }
                : { color: 'rgba(255,255,255,0.22)' }
            }
            onMouseEnter={(e) => {
              if (!showNote && !expense.note) e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              if (!showNote && !expense.note) e.currentTarget.style.color = 'rgba(255,255,255,0.22)';
            }}
            disabled={readOnly}
            aria-label="Toggle note"
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(255,255,255,0.22)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F43F5E';
                e.currentTarget.style.background = 'rgba(244,63,94,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.22)';
                e.currentTarget.style.background = 'transparent';
              }}
              aria-label="Delete expense"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible note */}
      {showNote && (
        <div className="px-2.5 pb-2.5 animate-fade-in">
          <input
            type="text"
            value={expense.note || ''}
            onChange={(e) => onUpdate({ ...expense, note: e.target.value })}
            placeholder="Add a note (e.g. 10 kg broiler)..."
            className="w-full py-2 px-3 rounded-lg text-xs focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.65)',
              caretColor: '#F59E0B',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(245,158,11,0.3)';
              e.target.style.boxShadow = '0 0 0 2px rgba(245,158,11,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.07)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={readOnly}
            aria-label={`Note for ${expense.category || 'expense'}`}
          />
        </div>
      )}
    </div>
  );
};

export default ExpenseRow;
