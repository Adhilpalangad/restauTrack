import { Plus, Copy, Receipt } from 'lucide-react';
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
    
    // Haptic feedback
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
    <div className="card border-l-4 border-l-accent animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Receipt className="w-4.5 h-4.5 text-accent" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">Expenses</h2>
        </div>
        
        {!readOnly && onCopyFromYesterday && (
          <button
            type="button"
            onClick={onCopyFromYesterday}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-light hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary-light/10"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Yesterday
          </button>
        )}
      </div>

      {/* Expense rows */}
      <div className="space-y-3">
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

      {/* Add button */}
      {!readOnly && (
        <button
          type="button"
          onClick={addExpense}
          className="w-full mt-3 py-2.5 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-accent hover:text-accent transition-all duration-200 flex items-center justify-center gap-1.5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      )}

      {/* Running total */}
      {expenses.length > 0 && (
        <div className="bg-accent/5 rounded-xl p-3 flex items-center justify-between border border-accent/10 mt-3">
          <span className="text-sm font-medium text-text-body">Total Expenses</span>
          <span className="text-lg font-bold text-accent currency-display">
            {formatCurrency(totalExpense)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
