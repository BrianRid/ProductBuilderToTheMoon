interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="border-b border-line bg-ink px-6 py-3">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher une carte…"
        aria-label="Rechercher une carte"
        className="w-full border border-line bg-panel-raised px-3 py-2 text-sm text-paper transition-colors placeholder:text-paper-dim focus:border-signal focus:outline-none"
      />
    </div>
  );
}
