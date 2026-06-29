import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value?:       string;
  onChange:     (value: string) => void;
  debounce?:    number;
  className?:   string;
  size?:        'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'py-2 text-sm',
  md: 'py-3',
  lg: 'py-4 text-lg',
};

export function SearchBar({
  placeholder = 'Rechercher un produit…',
  value: externalValue,
  onChange,
  debounce: debounceMs = 300,
  className = '',
  size = 'md',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(externalValue ?? '');

  // Synchronise si la valeur externe change
  useEffect(() => {
    if (externalValue !== undefined) setLocalValue(externalValue);
  }, [externalValue]);

  // Debounce sur l'appel onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`input pl-11 pr-10 ${sizeClasses[size]}`}
      />
      {localValue && (
        <button
          type="button"
          title="Effacer la recherche"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
