import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Quote,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { CardHead } from './ui';

/* Light-theme research chat for the authenticated Research Workspace.
   Logic (chatService history + query) is identical to the original panel. */
export const ResearchChat = ({ workspaceId, onCitations }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const bottomRef = useRef(null);

  const suggestedQueries = [
    'What was Infosys operating margin in FY24?',
    'Are there any debt or auditor red flags?',
    'Compare Infosys EBIT against TCS and Wipro',
  ];

  const fetchHistory = async () => {
    if (!workspaceId) return;
    try {
      const res = await chatService.getHistory(workspaceId);
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        setMessages([
          {
            id: 'sys_001',
            role: 'assistant',
            content:
              'Welcome to the Conversational Research Agent. Filings indexed in this workspace are ready — ask multi-part financial questions and every answer comes back with step-by-step reasoning and exact source citations.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Could not fetch chat history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!onCitations) return;
    const cites = [];
    messages.forEach((m) => (m.citations || []).forEach((c) => cites.push(c)));
    onCitations(cites);
  }, [messages]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || !workspaceId || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.query(textToSend, workspaceId);
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content:
            'The Research Agent could not reach the vector database right now. Please try again in a moment.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="dash-card dash-reveal app-chat">
      <CardHead
        title="Conversational Research"
        subtitle="Grounded answers with step-by-step multi-agent reasoning"
        right={<span className="dash-badge badge-ok">Source grounded</span>}
      />

      <div className="px-4 pt-3.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" /> Suggested
        </span>
        {suggestedQueries.map((sq) => (
          <button key={sq} type="button" onClick={() => handleSend(sq)} className="app-chip">
            {sq}
          </button>
        ))}
      </div>

      <div className="app-chat-scroll">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasReasoning = msg.reasoning_steps && msg.reasoning_steps.length > 0;
          const isExpanded = expanded[msg.id] || false;

          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <span className="dash-row-icon shrink-0" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                  <Bot className="w-[17px] h-[17px]" />
                </span>
              )}

              <div className={`app-bubble ${isUser ? 'app-bubble-user' : 'app-bubble-ai'}`}>
                {!isUser && hasReasoning && (
                  <div className="mb-3 pb-2.5 border-b border-[#EDF2FB]">
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => ({ ...p, [msg.id]: !p[msg.id] }))}
                      className="flex items-center justify-between w-full text-left text-[12px] font-semibold text-[#2563EB]"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Multi-agent reasoning ({msg.reasoning_steps.length} steps)
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isExpanded && (
                      <div className="mt-2.5 space-y-1.5 pl-3 border-l-2 border-[#DCE5F2] text-[12px] text-slate-500">
                        {msg.reasoning_steps.map((step, i) => (
                          <p key={i} className="leading-snug">
                            {step}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.content}</div>

                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#EDF2FB] space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                      <Quote className="w-3 h-3 text-[#6D4AFF]" /> Source citations
                    </p>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#F7F9FF] border border-[#E4EBF7] space-y-1">
                        <div className="flex items-center justify-between text-[12px] font-semibold text-[#2563EB]">
                          <span className="flex items-center gap-1.5 min-w-0 truncate">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            {cite.source}
                          </span>
                          <span className="text-slate-400 shrink-0">{cite.page}</span>
                        </div>
                        {cite.quote && <p className="text-[12px] text-slate-500 italic">"{cite.quote}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <span
                  className="dash-row-icon shrink-0 font-semibold"
                  style={{ background: '#F2EEFF', color: '#6D4AFF' }}
                >
                  U
                </span>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 text-[12.5px] text-slate-500">
            <span className="dash-status-dot status-active" />
            Agents are researching your filings…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2.5 p-4 border-t border-[#EDF2FB]"
      >
        <input
          className="app-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about revenue, margins, risks, peers…"
          disabled={!workspaceId || loading}
        />
        <button type="submit" className="dash-btn dash-btn-primary" disabled={!workspaceId || loading}>
          <Send className="w-4 h-4" />
          Ask
        </button>
      </form>
    </article>
  );
};
