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
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-4 sm:px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        {/* Zone 1: Brand Wordmark */}
        <button 
          onClick={() => setView('learn')}
          className="flex items-center gap-3 cursor-pointer shrink-0 group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-mono font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            λ
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            LambdaLens
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
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
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Code2 className="w-4 h-4" />
            <span>{isEvaluating ? 'Evaluating...' : 'Run & Trace'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around py-2 px-1 shadow-2xl">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-all min-h-[44px] min-w-[54px] ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-600/20' : ''}`}>
                {item.icon}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
