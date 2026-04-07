import { useState, useRef, useEffect } from 'react';
import { AUTOCOMPLETE_DEBOUNCE } from '../../utils/constants';

const CategoryAutocomplete = ({ value, onChange, suggestions, onSearch, disabled }) => {
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
        onFocus={handleFocus}
        placeholder="Category"
        className="input-field text-sm py-2"
        disabled={disabled}
        aria-label="Expense category"
        autoComplete="off"
      />
      
      {showDropdown && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-border z-50 max-h-40 overflow-y-auto animate-scale-in"
        >
          {filteredSuggestions.map((s, i) => (
            <button
              key={s.id || i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors text-sm text-text-body first:rounded-t-xl last:rounded-b-xl flex items-center justify-between"
            >
              <span>{s.name}</span>
              <span className="text-xs text-text-muted">{s.usageCount}×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryAutocomplete;
