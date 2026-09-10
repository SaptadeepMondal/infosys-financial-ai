import React from 'react';
import { FlaskConical } from 'lucide-react';

/** Marks any panel that is currently rendering placeholder values. */
export const MockBadge = ({ label = 'Sample data' }) => (
  <span className="cmp-mock-note">
    <FlaskConical className="w-3 h-3" />
    {label}
  </span>
);

/** Shared chart palette — matches the dashboard blue/purple language. */
export const SERIES_COLORS = ['#2563eb', '#6d4aff', '#60a5fa', '#a78bfa'];
