import React from 'react';

/**
 * Premium tab strip for the Comparison Agent results.
 * Presentation only — parent owns the active tab state.
 */
export const ComparisonTabs = ({ tabs = [], active, onChange }) => (
  <div className="cmp-tabs" role="tablist">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = tab.id === active;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={`cmp-tab ${isActive ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {tab.label}
        </button>
      );
    })}
  </div>
);
