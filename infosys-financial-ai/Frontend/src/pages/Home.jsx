import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Shield, Zap, Terminal } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-terminal-dark flex flex-col relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="max-w-4xl w-full text-center space-y-8 mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-mono mb-4">
            <Terminal className="w-4 h-4" />
            <span>Infosys Multi-Agent Research</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Financial Intelligence <br />
            <span className="text-gradient-emerald">Reimagined.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Deploy autonomous AI agents to research company filings, analyze financial ratios, and uncover actionable market insights at terminal velocity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-glow-emerald transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>Launch Terminal</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-terminal-card border border-terminal-border hover:border-emerald-500/40 hover:text-emerald-400 text-white font-semibold rounded-lg transition-all w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24 mb-12 z-10">
          <div className="glass-card p-6 text-left">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Agentic Processing</h3>
            <p className="text-sm text-slate-400">
              Multi-agent orchestration to read, analyze, and extract SEC filings with zero hallucination mechanisms.
            </p>
          </div>
          <div className="glass-card p-6 text-left">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Real-time Analytics</h3>
            <p className="text-sm text-slate-400">
              Live quantitative metric extraction and automated peer comparisons for instant strategic insights.
            </p>
          </div>
          <div className="glass-card p-6 text-left">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Enterprise Grade</h3>
            <p className="text-sm text-slate-400">
              Built for institutional analysts with role-based access, audit trails, and strict data privacy guardrails.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
