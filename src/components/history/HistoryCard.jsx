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
      style={{ '--hover-border': 'rgba(255,255,255,0.13)' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">
          {formatDisplayDate(record.date)}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateDailyPDF(record, selectedHotel, selectedHotel === 'ALL');
            }}
            title="Download PDF"
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
            style={{
              background: 'rgba(99,102,241,0.10)',
              border: '1px solid rgba(99,102,241,0.20)',
              color: 'rgba(129,140,248,0.75)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
              e.currentTarget.style.color = '#818CF8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.10)';
              e.currentTarget.style.color = 'rgba(129,140,248,0.75)';
            }}
          >
            PDF
          </button>

          <span className={isSubmitted || selectedHotel === 'ALL' ? 'badge-submitted' : 'badge-draft'}>
            {isSubmitted || selectedHotel === 'ALL' ? (
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
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Income
          </p>
          <p className="text-sm font-bold gradient-text-success currency-display">
            {formatCurrency(record.income?.total || 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Expense
          </p>
          <p className="text-sm font-bold gradient-text-danger currency-display">
            {formatCurrency(record.totalExpense || 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Profit
          </p>
          <p className={`text-sm font-bold currency-display ${isProfit ? 'gradient-text-success' : 'gradient-text-danger'}`}>
            {isProfit ? '' : '−'}{formatCurrency(Math.abs(record.netProfit || 0))}
          </p>
        </div>
      </div>

      {/* Collapsed: top expense preview */}
      {!expanded && record.expenses?.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span>Top:</span>
          {record.expenses
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 3)
            .map((e, i) => (
              <span key={e.id}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.18)' }}>, </span>}
                {e.category || 'Untitled'}
              </span>
            ))}
          <ChevronDown className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: 'rgba(255,255,255,0.22)' }} />
        </div>
      )}
      {!expanded && !record.expenses?.length && (
        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.18)' }} />
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 animate-fade-in space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Income breakdown */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <p className="text-xs font-semibold text-white mb-2">Income Breakdown</p>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>Cash</span>
              <span className="font-semibold text-white currency-display">{formatCurrency(record.income?.cash || 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>Online</span>
              <span className="font-semibold text-white currency-display">{formatCurrency(record.income?.online || 0)}</span>
            </div>
          </div>

          {/* Expense breakdown */}
          {record.expenses?.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}>
              <p className="text-xs font-semibold text-white mb-2">Expense Details</p>
              <div className="space-y-1.5">
                {record.expenses.map((e) => (
                  <div key={e.id} className="flex justify-between text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {e.category || 'Untitled'}
                      {e.note && (
                        <span style={{ color: 'rgba(255,255,255,0.30)' }} className="ml-1">({e.note})</span>
                      )}
                    </span>
                    <span className="font-semibold text-white currency-display ml-4 flex-shrink-0">
                      {formatCurrency(e.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center pt-1">
            <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.22)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryCard;
