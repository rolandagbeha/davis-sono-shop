import { useState, useEffect, useRef } from 'react';
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

  // onChange est souvent une closure inline recreee a chaque rendu du parent
  // (ex: onChange={v => setParam('search', v)}). La stocker dans une ref
  // evite que l'effet de debounce ci-dessous ne depende de son identite : sans
  // ca, tout re-rendu du parent (meme sans rapport avec la recherche, comme un
  // clic de pagination) redeclenchait ce timer, qui rappelait onChange(valeur
  // inchangee) 300ms plus tard — et setParam() reinitialise systematiquement
  // la page a 1, ce qui annulait silencieusement la pagination.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Ne pas appeler onChange au montage (localValue == externalValue initial,
  // rien n'a change) — seulement quand l'utilisateur tape reellement.
  const isFirstRun = useRef(true);

  // Debounce sur l'appel onChange — ne depend que de la valeur locale.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onChangeRef.current(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

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
