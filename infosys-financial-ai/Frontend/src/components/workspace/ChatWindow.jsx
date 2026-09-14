import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, CheckCircle2, ChevronDown, ChevronUp, FileText, Quote } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { Badge } from '../common/Badge';

export const ChatWindow = ({ workspaceId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState({});
  const bottomRef = useRef(null);

  const suggestedQueries = [
    "What was Infosys operating margin in FY24?",
    "Are there any debt or auditor red flags?",
    "Compare Infosys EBIT against TCS and Wipro",
  ];

  const fetchHistory = async () => {
    if (!workspaceId) return;
    try {
      const res = await chatService.getHistory(workspaceId);
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        // Initial system welcome message
        setMessages([
          {
            id: 'sys_001',
            role: 'assistant',
            content:
              "Welcome to the **Conversational Research Agent**. I have indexed your company filings in this workspace. " +
              "Ask me multi-part financial questions, and I will answer with **step-by-step reasoning** and **exact source citations**.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Could not fetch chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "Sorry, the Research Agent encountered an error querying the vector database. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReasoning = (msgId) => {
    setExpandedReasoning((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-[600px] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.03]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Conversational Research Agent</h3>
            <p className="text-[11px] text-emerald-400 font-mono">0 Hallucination • Exact Source Citations</p>
          </div>
        </div>
        <Badge variant="emerald">MULTI-STEP REASONING</Badge>
      </div>

      {/* Suggested queries bar */}
      <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.02] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" /> SUGGESTED:
        </span>
        {suggestedQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 transition-colors shrink-0 text-left"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasReasoning = msg.reasoning_steps && msg.reasoning_steps.length > 0;
          const isExpanded = expandedReasoning[msg.id] || false;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed animate-fadeUp ${
                  isUser
                    ? 'bg-gradient-to-br from-brand-500 to-accent-600 text-white font-medium rounded-tr-md border border-brand-300/30 shadow-[0_14px_34px_-18px_rgba(99,102,241,0.95),inset_0_1px_0_0_rgba(255,255,255,0.18)]'
                    : 'glass-inset text-slate-200 rounded-tl-md'
                }`}
              >

                {/* Step-by-Step Reasoning Dropdown */}
                {!isUser && hasReasoning && (
                  <div className="mb-3 border-b border-white/[0.07] pb-2.5">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="flex items-center justify-between w-full text-left text-[11px] font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Step-by-Step Multi-Agent Reasoning ({msg.reasoning_steps.length} steps)</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-emerald-500/30 text-[11px] font-mono text-slate-400">
                        {msg.reasoning_steps.map((step, sIdx) => (
                          <p key={sIdx} className="leading-snug">
                            {step}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content */}
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Citations Box */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.07] space-y-2">
                    <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Quote className="w-3 h-3 text-emerald-400" />
                      Strict Source Grounding Citations:
                    </p>
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2 rounded bg-white/[0.05] border border-emerald-500/20 text-[11px] space-y-1 font-mono"
                      >
                        <div className="flex items-center justify-between text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {cite.source}
                          </span>
                          <span>{cite.page}</span>
                        </div>
                        {cite.quote && (
                          <p className="text-slate-300 italic text-[11px]">
                            "{cite.quote}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1 font-bold text-xs">
                  U
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="glass-inset rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Research Agent reasoning across vector DB embeddings...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3.5 border-t border-white/10 bg-[#070B16]/70 backdrop-blur-xl flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any multi-part financial research question..."
          className="field flex-1 h-11 px-4 text-xs"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-11 w-11 shrink-0 grid place-items-center rounded-xl text-white bg-gradient-to-b from-brand-500 to-brand-600 border border-brand-400/40 shadow-[0_10px_26px_-14px_rgba(99,102,241,0.95),inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all duration-200 ease-premium hover:from-brand-400 hover:to-brand-500 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none"
        >

          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
