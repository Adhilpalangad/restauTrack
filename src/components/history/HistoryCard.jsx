import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dates';
import { generateDailyPDF } from '../../services/pdfService';
import { useHotel } from '../../context/HotelContext';
import { formatCurrency } from '../../utils/currency';

const HistoryCard = ({ record }) => {
  const { selectedHotel } = useHotel();
  const [expanded, setExpanded] = useState(false);
  const isSubmitted = record.status === 'submitted';
  const isProfit = (record.netProfit || 0) >= 0;

  return (
    <div
      className="glass-card p-4 cursor-pointer animate-fade-in transition-all duration-200"
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--history-card-border-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
          {formatDisplayDate(record.date)}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateDailyPDF(record, selectedHotel, false);
            }}
            title="Download PDF"
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
            style={{
              background: 'var(--pdf-btn-bg)',
              border: '1px solid var(--pdf-btn-border)',
              color: 'var(--pdf-btn-color)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
              e.currentTarget.style.color = '#6366F1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--pdf-btn-bg)';
              e.currentTarget.style.color = 'var(--pdf-btn-color)';
            }}
          >
            PDF
          </button>

          <span className={isSubmitted ? 'badge-submitted' : 'badge-draft'}>
            {isSubmitted ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Draft
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--history-label-color)' }}>
            Income
          </p>
          <p className="text-sm font-bold gradient-text-success currency-display">
            {formatCurrency(record.income?.total || 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--history-label-color)' }}>
            Expense
          </p>
          <p className="text-sm font-bold gradient-text-danger currency-display">
            {formatCurrency(record.totalExpense || 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--history-label-color)' }}>
            Profit
          </p>
          <p className={`text-sm font-bold currency-display ${isProfit ? 'gradient-text-success' : 'gradient-text-danger'}`}>
            {isProfit ? '' : '−'}{formatCurrency(Math.abs(record.netProfit || 0))}
          </p>
        </div>
      </div>

      {/* Collapsed: top expense preview */}
      {!expanded && record.expenses?.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Top:</span>
          {record.expenses
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 3)
            .map((e, i) => (
              <span key={e.id}>
                {i > 0 && <span style={{ color: 'var(--text-faint)' }}>, </span>}
                {e.category || 'Untitled'}
              </span>
            ))}
          <ChevronDown className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: 'var(--history-chevron-color)' }} />
        </div>
      )}
      {!expanded && !record.expenses?.length && (
        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--history-chevron-color)' }} />
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 animate-fade-in space-y-3" style={{ borderTop: '1px solid var(--history-divider)' }}>
          {/* Income breakdown */}
          <div className="rounded-xl p-3" style={{ background: 'var(--history-income-bg)', border: '1px solid var(--history-income-border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Income Breakdown</p>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--history-detail-color)' }}>Cash</span>
              <span className="font-semibold currency-display" style={{ color: 'var(--text)' }}>{formatCurrency(record.income?.cash || 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--history-detail-color)' }}>Online</span>
              <span className="font-semibold currency-display" style={{ color: 'var(--text)' }}>{formatCurrency(record.income?.online || 0)}</span>
            </div>
          </div>

          {/* Expense breakdown */}
          {record.expenses?.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'var(--history-expense-bg)', border: '1px solid var(--history-expense-border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Expense Details</p>
              <div className="space-y-1.5">
                {record.expenses.map((e) => (
                  <div key={e.id} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--history-detail-color)' }}>
                      {e.category || 'Untitled'}
                      {e.note && (
                        <span style={{ color: 'var(--text-muted)' }} className="ml-1">({e.note})</span>
                      )}
                    </span>
                    <span className="font-semibold currency-display ml-4 flex-shrink-0" style={{ color: 'var(--text)' }}>
                      {formatCurrency(e.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center pt-1">
            <ChevronUp className="w-4 h-4" style={{ color: 'var(--history-chevron-color)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryCard;
