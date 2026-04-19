import { useState, useRef, useEffect } from 'react';
import { AUTOCOMPLETE_DEBOUNCE } from '../../utils/constants';

const CategoryAutocomplete = ({ value, onChange, onSearch, disabled }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        const results = onSearch(val);
        setFilteredSuggestions(results);
        setShowDropdown(results.length > 0 && val.length > 0);
      }
    }, AUTOCOMPLETE_DEBOUNCE);
  };

  const handleFocus = () => {
    if (onSearch) {
      const results = onSearch(value);
      setFilteredSuggestions(results);
      setShowDropdown(results.length > 0);
    }
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion.name);
    setShowDropdown(false);
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={(e) => {
          handleFocus();
          e.target.style.borderColor = 'rgba(99, 102, 241, 0.45)';
          e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.10)';
        }}
        placeholder="Category"
        className="w-full py-2.5 px-3 rounded-lg text-sm font-medium focus:outline-none transition-all"
        style={{
          background: 'var(--category-input-bg)',
          border: '1px solid var(--category-input-border)',
          color: 'var(--text)',
          caretColor: '#6366F1',
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--category-input-border)';
          e.target.style.boxShadow = 'none';
        }}
        disabled={disabled}
        aria-label="Expense category"
        autoComplete="off"
      />

      {showDropdown && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl z-50 max-h-40 overflow-y-auto scrollbar-glass animate-scale-in"
          style={{
            background: 'var(--category-dropdown-bg)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid var(--category-dropdown-border)',
            boxShadow: 'var(--category-dropdown-shadow)',
          }}
        >
          {filteredSuggestions.map((s, i) => (
            <button
              key={s.id || i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-all first:rounded-t-xl last:rounded-b-xl"
              style={{ color: 'var(--category-item-color)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--category-item-hover-bg)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--category-item-color)';
              }}
            >
              <span>{s.name}</span>
              <span
                className="text-xs ml-2 flex-shrink-0"
                style={{ color: 'var(--category-count-color)' }}
              >
                {s.usageCount}×
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryAutocomplete;
