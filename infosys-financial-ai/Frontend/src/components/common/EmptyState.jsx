import React from 'react';

/**
 * Premium empty state — purely presentational.
 * Never renders fake data; it only frames a genuinely empty section.
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="empty-state flex flex-col items-center justify-center text-center px-6 py-10 rounded-xl">
      {Icon && (
        <div className="empty-state-icon w-11 h-11 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-5 h-5" />
        </div>
      )}
      {title && (
        <p className="text-[13px] font-semibold text-slate-200 tracking-tight">{title}</p>
      )}
      {description && (
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
