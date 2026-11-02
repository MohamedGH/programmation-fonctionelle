/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHaskellStore, ViewMode } from '../store/haskellStore.ts';
import { Code2, BookOpen, Cpu, Sparkles, HelpCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setView, evaluateCode, isEvaluating } = useHaskellStore();

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'Learn', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'playground', label: 'Playground', icon: <Code2 className="w-4 h-4" /> },
    { id: 'visualizer', label: 'Visualizer', icon: <Cpu className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'ai-tutor', label: 'AI Tutor', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark */}
      <div 
        onClick={() => setView('learn')}
        className="flex items-center gap-3 cursor-pointer shrink-0 group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-mono font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          λ
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          LambdaLens
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            setView('playground');
            evaluateCode();
          }}
          disabled={isEvaluating}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Code2 className="w-4 h-4" />
          <span>{isEvaluating ? 'Evaluating...' : 'Run & Trace'}</span>
        </button>
      </div>
    </header>
  );
};
