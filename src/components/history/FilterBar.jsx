import { FILTER_PRESETS } from '../../utils/constants';

const FilterBar = ({ activePreset, onPresetChange, startDate, endDate, onStartDateChange, onEndDateChange, onApplyCustom }) => {
  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => onPresetChange(preset.key)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97]"
            style={
              activePreset === preset.key
                ? {
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: 'white',
                    boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
                  }
                : {
                    background: 'var(--hotel-tab-inactive-bg)',
                    border: '1px solid var(--hotel-tab-inactive-border)',
                    color: 'var(--hotel-tab-inactive-color)',
                  }
            }
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {activePreset === 'custom' && (
        <div className="flex items-end gap-2 animate-fade-in">
          <div className="flex-1">
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>
          <button
            onClick={onApplyCustom}
            className="btn-primary py-2 px-4 text-sm"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
