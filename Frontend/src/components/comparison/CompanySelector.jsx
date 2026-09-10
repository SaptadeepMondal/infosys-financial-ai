import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown, X, Building2 } from 'lucide-react';

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const CompanyLogo = ({ company, small }) => (
  <span className={`cmp-logo ${small ? 'cmp-logo-sm' : ''} ${company ? '' : 'is-empty'}`}>
    {company ? initials(company.name) : <Building2 className="w-4 h-4" />}
  </span>
);

/**
 * Searchable company selector for one comparison slot.
 * Purely presentational — `companies` comes from the caller (mock today, API later).
 */
export const CompanySelector = ({
  index,
  company,
  companies,
  disabledIds = [],
  onSelect,
  onRemove,
  removable,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ticker || '').toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q)
    );
  }, [companies, query]);

  return (
    <div className="cmp-slot" ref={ref}>
      <p className="cmp-slot-label">
        Company {index + 1}
        {index >= 3 && <span className="text-slate-400 font-medium"> (Optional)</span>}
      </p>


      {removable && (
        <button type="button" className="cmp-remove" onClick={onRemove} title="Remove company">
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        type="button"
        className={`cmp-slot-btn ${open ? 'is-open' : ''}`}
        onClick={() => {
          setOpen((v) => !v);
          setQuery('');
        }}
      >
        <CompanyLogo company={company} />
        <span className="min-w-0 flex-1">
          <span className="cmp-name block truncate">{company ? company.name : 'Select company'}</span>
          <span className="cmp-meta block truncate">
            {company ? `${company.ticker} • ${company.industry}` : 'Search by name, ticker or industry'}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="cmp-drop">
          <div className="cmp-drop-search">
            <Search className="w-4 h-4" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company..."
            />
          </div>
          <div className="cmp-drop-list">
            {results.length === 0 ? (
              <p className="cmp-drop-empty">No companies match “{query}”.</p>
            ) : (
              results.map((c) => {
                const taken = disabledIds.includes(c.id) && c.id !== company?.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="cmp-opt"
                    disabled={taken}
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                    }}
                  >
                    <CompanyLogo company={c} small />
                    <span className="min-w-0">
                      <span className="cmp-name block truncate">{c.name}</span>
                      <span className="cmp-meta block truncate">
                        {c.ticker} • {c.industry}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
