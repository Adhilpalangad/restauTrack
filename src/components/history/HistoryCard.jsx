import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { formatDisplayDate, formatShortDate } from '../../utils/dates';
import { generateDailyPDF } from '../../services/pdfService';
import { useHotel } from '../../context/HotelContext';
import { formatCurrency, formatCompact } from '../../utils/currency';

const HistoryCard = ({ record }) => {
  const { selectedHotel } = useHotel();
  const [expanded, setExpanded] = useState(false);
  const isSubmitted = record.status === 'submitted';
  const isProfit = (record.netProfit || 0) >= 0;

  return (
    <div 
      className="card cursor-pointer animate-fade-in transition-all duration-200 hover:shadow-md"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">
          {formatDisplayDate(record.date)}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateDailyPDF(record, selectedHotel, selectedHotel === 'ALL');
            }}
            className="p-1 rounded hover:bg-gray-100 text-primary border border-transparent hover:border-border transition-colors"
            title="Download PDF"
          >
            <span className="text-[10px] font-medium mr-1 uppercase">PDF</span>
          </button>
          <span className={isSubmitted || selectedHotel === 'ALL' ? 'badge-submitted' : 'badge-draft'}>
            {isSubmitted || selectedHotel === 'ALL' ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {selectedHotel === 'ALL' ? 'Done' : 'Done'}</span>
            ) : (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>
            )}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Income</p>
          <p className="text-sm font-bold text-success currency-display">
            {formatCurrency(record.income?.total || 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Expense</p>
          <p className="text-sm font-bold text-danger currency-display">
            {formatCurrency(record.totalExpense || 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Profit</p>
          <p className={`text-sm font-bold currency-display ${isProfit ? 'text-success' : 'text-danger'}`}>
            {isProfit ? '' : '-'}{formatCurrency(Math.abs(record.netProfit || 0))}
          </p>
        </div>
      </div>

      {/* Top expenses (compact view) */}
      {!expanded && record.expenses?.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <span>Top: </span>
          {record.expenses
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 3)
            .map((e, i) => (
              <span key={e.id}>
                {i > 0 && ', '}
                {e.category || 'Untitled'}
              </span>
            ))}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border animate-fade-in space-y-3">
          {/* Income breakdown */}
          <div className="bg-success/5 rounded-lg p-2.5">
            <p className="text-xs font-medium text-text-body mb-1.5">Income Breakdown</p>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Cash</span>
              <span className="font-medium currency-display">{formatCurrency(record.income?.cash || 0)}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-text-muted">Online</span>
              <span className="font-medium currency-display">{formatCurrency(record.income?.online || 0)}</span>
            </div>
          </div>

          {/* Expense breakdown */}
          {record.expenses?.length > 0 && (
            <div className="bg-accent/5 rounded-lg p-2.5">
              <p className="text-xs font-medium text-text-body mb-1.5">Expense Details</p>
              <div className="space-y-1">
                {record.expenses.map((e) => (
                  <div key={e.id} className="flex justify-between text-xs">
                    <span className="text-text-muted">
                      {e.category || 'Untitled'}
                      {e.note && <span className="text-text-muted/70 ml-1">({e.note})</span>}
                    </span>
                    <span className="font-medium currency-display">{formatCurrency(e.amount || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center">
            <ChevronUp className="w-4 h-4 text-text-muted" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryCard;
