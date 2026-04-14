import { Plus, Copy, TrendingDown } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import ExpenseRow from './ExpenseRow';
import { formatCurrency } from '../../utils/currency';

const ExpenseCard = ({ expenses, onChange, searchCategories, readOnly, onCopyFromYesterday, totalExpense }) => {

  const addExpense = () => {
    const newExpense = {
      id: crypto.randomUUID(),
      category: '',
      amount: 0,
      note: '',
      timestamp: Timestamp.now(),
    };
    onChange([...expenses, newExpense]);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const updateExpense = (index, updated) => {
    const newExpenses = [...expenses];
    newExpenses[index] = updated;
    onChange(newExpenses);
  };

  const deleteExpense = (index) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    onChange(newExpenses);
  };

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.38)',
            }}
          >
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Expenses</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {expenses.length > 0 && (
            <p className="text-xl font-bold gradient-text-danger currency-display">
              {formatCurrency(totalExpense)}
            </p>
          )}
          {!readOnly && onCopyFromYesterday && (
            <button
              type="button"
              onClick={onCopyFromYesterday}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          )}
        </div>
      </div>

      {/* Expense rows */}
      <div className="space-y-2">
        {expenses.map((expense, index) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            onUpdate={(updated) => updateExpense(index, updated)}
            onDelete={() => deleteExpense(index)}
            searchCategories={searchCategories}
            readOnly={readOnly}
            index={index}
          />
        ))}
      </div>

      {/* Add expense button */}
      {!readOnly && (
        <button
          type="button"
          onClick={addExpense}
          className="w-full mt-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1.5px dashed rgba(99, 102, 241, 0.28)',
            color: 'rgba(129, 140, 248, 0.75)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.13)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.45)';
            e.currentTarget.style.color = '#818CF8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.28)';
            e.currentTarget.style.color = 'rgba(129, 140, 248, 0.75)';
          }}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      )}
    </div>
  );
};

export default ExpenseCard;
