import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

function normalizeOptions(options = []) {
  return options.map((opt) =>
    typeof opt === "string"
      ? { value: opt, label: opt }
      : { value: String(opt.value ?? ""), label: String(opt.label ?? opt.value ?? "") },
  );
}

export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  onSelectOption,
  placeholder = "Select…",
  required = false,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const normalized = useMemo(() => normalizeOptions(options), [options]);

  const selected = normalized.find((o) => o.value === value);
  const displayLabel = selected?.label || placeholder;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalized, query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 disabled:bg-slate-100"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {required && (
        <input
          tabIndex={-1}
          className="sr-only"
          value={value}
          required
          onChange={() => {}}
        />
      )}

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full text-sm outline-none"
              autoFocus
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                      opt.value === value
                        ? "bg-orange-50 font-medium text-orange-700"
                        : "text-slate-700"
                    }`}
                    onClick={() => {
                      onChange?.(opt.value);
                      onSelectOption?.(opt);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
