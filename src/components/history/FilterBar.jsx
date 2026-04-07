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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
              activePreset === preset.key
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white text-text-body border border-border hover:border-primary-light'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {activePreset === 'custom' && (
        <div className="flex items-end gap-2 animate-fade-in">
          <div className="flex-1">
            <label className="text-xs text-text-muted mb-1 block">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-text-muted mb-1 block">To</label>
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
