import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

/**
 * Source-grounded reference chip.
 * `onView` will later open the underlying filing at the cited page.
 */
export const SourceCitation = ({ source, page, onView }) => (
  <button type="button" className="cmp-source" onClick={onView} title="View source">
    <FileText className="w-3.5 h-3.5" />
    <span className="truncate max-w-[190px]">{source}</span>
    {page && <span className="text-slate-400">• {page}</span>}
    <ExternalLink className="w-3 h-3" />
  </button>
);
