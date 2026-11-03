/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  useHaskellStore, 
  CHAPTERS, 
  Chapter 
} from '../store/haskellStore.ts';
import { 
  ExplanationLevel, 
  getLevelMeta 
} from '../utils/haskellEngine.ts';
import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Lightbulb, 
  Code2, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  Info, 
  Check, 
  X,
  Columns
} from 'lucide-react';

export const LearnView: React.FC = () => {
  const { 
    selectedChapterId, 
    selectChapter, 
    explanationLevel, 
    setExplanationLevel, 
    setView, 
    evaluateCode 
  } = useHaskellStore();

  const [showComparison, setShowComparison] = useState(false);

  const currentChapter: Chapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0];
  const activeExplanation = currentChapter.explanations[explanationLevel];
  const activeLevelMeta = getLevelMeta(explanationLevel);

  const levels: { id: ExplanationLevel; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: 'beginner', 
      label: 'Beginner / ELI5', 
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      desc: 'Analogy & everyday intuition'
    },
    { 
      id: 'practitioner', 
      label: 'Practitioner', 
      icon: <Code2 className="w-4 h-4 text-indigo-400" />,
      desc: 'Idiomatic code & patterns'
    },
    { 
      id: 'theoretical', 
      label: 'Under The Hood', 
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      desc: 'GHC STG & Category Theory'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Chapters */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Haskell Curriculum</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {CHAPTERS.length} Concepts
          </span>
        </div>

        <div className="space-y-2.5">
          {CHAPTERS.map((chapter, idx) => {
            const isSelected = chapter.id === selectedChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => selectChapter(chapter.id)}
                className={`w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-950/70 to-purple-950/50 border-indigo-500/50 shadow-xl shadow-indigo-950/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                )}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-semibold text-indigo-400">
                    Chapter 0{idx + 1}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                  {chapter.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {chapter.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-8 space-y-6">
        {/* Multi-Level Depth Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3 sm:p-4 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-1">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">Explanation Depth:</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 flex-1">
            {levels.map((lvl) => {
              const isActive = explanationLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setExplanationLevel(lvl.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[44px] ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  aria-pressed={isActive}
                >
                  {lvl.icon}
                  <span className="text-center">{lvl.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all shrink-0 min-h-[44px]"
            title="Compare all 3 levels side-by-side"
          >
            <Columns className="w-4 h-4 text-indigo-400" />
            <span>{showComparison ? 'Close Comparison' : 'Compare 3 Levels'}</span>
          </button>
        </div>

        {/* Level Comparison View (Optional Expandable Mode) */}
        {showComparison && (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Three-Tier Concept Comparison</h3>
                <p className="text-xs text-slate-400">See how "{currentChapter.title}" is conceptualized at each depth level.</p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {levels.map((lvl) => {
                const exp = currentChapter.explanations[lvl.id];
                return (
                  <div
                    key={lvl.id}
                    onClick={() => {
                      setExplanationLevel(lvl.id);
                      setShowComparison(false);
                    }}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all space-y-3 ${
                      explanationLevel === lvl.id
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {lvl.icon}
                        <span className="text-xs font-bold text-white">{lvl.label}</span>
                      </div>
                      {explanationLevel === lvl.id && (
                        <span className="text-[10px] font-mono bg-indigo-500 text-white px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-snug">
                      {exp.tagline}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      {exp.analogy}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-indigo-300">
                      Click to switch to this level →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Explanation Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Level Info */}
          <div className="space-y-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-indigo-400">
              <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${activeLevelMeta.color}`}>
                {activeLevelMeta.badge}
              </span>
              <span>·</span>
              <span className="text-slate-400">{activeExplanation.audience}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {currentChapter.title}
            </h1>
            <p className="text-sm font-medium text-indigo-300/90 leading-relaxed">
              {activeExplanation.tagline}
            </p>
          </div>

          {/* Section 1: Intuitive Analogy / Mental Model */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 relative z-10 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>
                {explanationLevel === 'beginner' 
                  ? 'Real-World Mental Model & Analogy' 
                  : explanationLevel === 'theoretical' 
                  ? 'Mathematical Formalism & Analogy' 
                  : 'Practical Architecture Model'}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {activeExplanation.analogy}
            </p>
          </div>

          {/* Section 2: Core Concept Deep Dive */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 relative z-10 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Core Mechanism</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {activeExplanation.coreConcept}
            </p>
          </div>

          {/* Section 3: Level Code Breakdown with Annotations */}
          {activeExplanation.codeBreakdown && (
            <div className="space-y-3 relative z-10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Level-Specific Code Representation</span>
              </h4>
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                <pre className="p-4 sm:p-5 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                  <code>{activeExplanation.codeBreakdown.code}</code>
                </pre>
                {activeExplanation.codeBreakdown.annotations.length > 0 && (
                  <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 space-y-1.5">
                    {activeExplanation.codeBreakdown.annotations.map((ann: { line: string; note: string }, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                        <span className="font-mono text-indigo-400 shrink-0 font-semibold">{ann.line}:</span>
                        <span>{ann.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Pitfalls or Deep Dive Notes */}
          {activeExplanation.commonPitfalls && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Common Traps to Avoid</span>
              </div>
              <ul className="space-y-1.5">
                {activeExplanation.commonPitfalls.map((pitfall: string, idx: number) => (
                  <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-2">
                    <span className="text-amber-400">·</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeExplanation.deepDiveNotes && (
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>GHC Runtime & Compiler Notes</span>
              </div>
              <ul className="space-y-1.5">
                {activeExplanation.deepDiveNotes.map((note: string, idx: number) => (
                  <li key={idx} className="text-xs text-purple-200/90 flex items-start gap-2">
                    <span className="text-purple-400">·</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 5: Key Takeaway Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 relative z-10">
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">
                Key Rule of Thumb
              </span>
              <p className="text-xs sm:text-sm font-medium text-emerald-200">
                {activeExplanation.keyTakeaway}
              </p>
            </div>
          </div>

          {/* Section 6: Canonical Snippet & Launch Playground */}
          <div className="space-y-3 relative z-10 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Interactive Playground Snippet
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
                <span>Main.hs</span>
                <span>GHC 9.8</span>
              </div>
              <pre className="p-4 sm:p-5 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                <code>{currentChapter.defaultCode}</code>
              </pre>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-800 relative z-10">
            <span className="text-xs text-slate-400">
              Ready to test reduction steps with the interactive simulator?
            </span>
            <button
              onClick={() => {
                setView('playground');
                evaluateCode();
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/30 group min-h-[44px]"
            >
              <span>Launch Playground Trace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
