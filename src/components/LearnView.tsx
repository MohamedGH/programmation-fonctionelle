/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHaskellStore, CHAPTERS, Chapter } from '../store/haskellStore.ts';
import { BookOpen, ArrowRight, CheckCircle2, Play, Terminal, Sparkles } from 'lucide-react';

export const LearnView: React.FC = () => {
  const { selectedChapterId, selectChapter, setView, evaluateCode } = useHaskellStore();
  const currentChapter: Chapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Chapters */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Haskell Curriculum</h2>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-500/30">
            {CHAPTERS.length} Chapters
          </span>
        </div>
        <div className="space-y-2.5">
          {CHAPTERS.map((chapter, idx) => {
            const isSelected = chapter.id === selectedChapterId;
            return (
              <div
                key={chapter.id}
                onClick={() => selectChapter(chapter.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left group relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border-indigo-500/50 shadow-xl shadow-indigo-950/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-semibold text-indigo-400">
                    Chapter 0{idx + 1}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                  {chapter.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                  {chapter.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Core Functional Concept</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight">
              {currentChapter.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {currentChapter.description}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 relative z-10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Conceptual Breakdown</span>
            </h4>
            <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line font-sans">
              {currentChapter.explanationMarkdown}
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Canonical Code Snippet
              </h4>
              <button
                onClick={() => {
                  setView('playground');
                  evaluateCode();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 rounded-xl transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-300" />
                <span>Open in Playground</span>
              </button>
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Haskell Source</span>
                <span>Strict / Lazy Evaluator</span>
              </div>
              <pre className="p-5 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                <code>{currentChapter.defaultCode}</code>
              </pre>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800 relative z-10">
            <span className="text-xs text-slate-400">
              Ready to trace execution steps & reduction graphs?
            </span>
            <button
              onClick={() => {
                setView('playground');
                evaluateCode();
              }}
              className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/30 group"
            >
              <span>Launch Playground</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
