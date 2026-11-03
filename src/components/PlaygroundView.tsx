/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useHaskellStore } from '../store/haskellStore.ts';
import { ExplanationLevel, getLevelMeta } from '../utils/haskellEngine.ts';
import { 
  Play, 
  Sparkles, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  FastForward, 
  Pause, 
  Code2,
  Sliders
} from 'lucide-react';
import { errorManager } from '../utils/errorManager.ts';

interface PresetSnippet {
  label: string;
  code: string;
}

const PRESET_SNIPPETS: PresetSnippet[] = [
  {
    label: 'Custom Curried Func',
    code: `-- Custom Curried Function
add :: Int -> Int -> Int
add x y = x + y

result = add 5 10`
  },
  {
    label: 'Custom Composition',
    code: `-- Composed Functions
double x = x * 2
quad x = double (double x)

result = quad 3`
  },
  {
    label: 'Maybe Monad Bind',
    code: `-- Safe monadic chaining with >>=
computation = Just 7 >>= \\x -> Just (x * 4)`
  },
  {
    label: 'Maybe Monad Failure',
    code: `-- Monad short-circuit on failure
computation = Nothing >>= \\x -> Just (x * 2)`
  },
  {
    label: 'Foldl Reduction',
    code: `-- Left fold accumulation
result = foldl (+) 0 [1, 2, 3, 4]`
  },
  {
    label: 'Foldr Reduction',
    code: `-- Right fold structure replacement
result = foldr (*) 1 [2, 3, 4]`
  },
  {
    label: 'Lazy Take on List',
    code: `-- Non-strict demand
result = take 3 [10, 20, 30, 40]`
  },
  {
    label: 'Parenthesized AST',
    code: `-- Nested expression rewriting
result = (4 + 6) * (15 - 5)`
  }
];

export const PlaygroundView: React.FC = () => {
  const { 
    editorCode, 
    setEditorCode, 
    evaluateCode, 
    evaluationResult, 
    isEvaluating, 
    setView,
    explanationLevel,
    setExplanationLevel
  } = useHaskellStore();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'stepper' | 'timeline'>('stepper');

  const steps = evaluationResult?.steps || [];
  const totalSteps = steps.length;

  // Keep active step index in bounds when steps change
  useEffect(() => {
    setActiveStepIndex(0);
    setIsPlaying(false);
  }, [evaluationResult]);

  // Auto-play timer for step-by-step scrubber
  useEffect(() => {
    if (!isPlaying || totalSteps <= 1) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev + 1 >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, totalSteps]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editorCode);
    errorManager.notify('Code copied to clipboard!', 'success');
  };

  const handleLoadPreset = (snippet: PresetSnippet) => {
    setEditorCode(snippet.code);
    evaluateCode(snippet.code);
    errorManager.notify(`Loaded preset: ${snippet.label}`, 'info');
  };

  const levelMeta = getLevelMeta(explanationLevel);
  const currentStep = steps[activeStepIndex] || steps[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Code Editor Panel */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Haskell Code Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => evaluateCode()}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 min-h-[40px]"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isEvaluating ? 'Evaluating...' : 'Run & Trace'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-mono shrink-0">Try custom snippet:</span>
          {PRESET_SNIPPETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 text-[11px]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 text-slate-300 font-semibold">CustomScript.hs</span>
            </div>
            <span>Interactive Haskell Engine</span>
          </div>
          <textarea
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            rows={15}
            className="w-full p-5 bg-transparent text-slate-100 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/40"
            placeholder="Type or paste any custom Haskell code here (e.g. add x y = x + y \n add 5 10)..."
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 px-1">
          <span>Type any custom function or equation, then click "Run & Trace".</span>
          <button
            onClick={() => setView('ai-tutor')}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Tutor to review</span>
          </button>
        </div>
      </div>

      {/* Evaluation & Reduction Trace Panel */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Step-by-Step Reduction</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Stepper vs Timeline */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('stepper')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  viewMode === 'stepper' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive Stepper
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Steps
              </button>
            </div>

            {/* Level Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {(['beginner', 'practitioner', 'theoretical'] as ExplanationLevel[]).map((lvl) => {
                const isActive = explanationLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      setExplanationLevel(lvl);
                      evaluateCode();
                    }}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all capitalize ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl === 'theoretical' ? 'Theory' : lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Final Output Summary */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Final Normal Form Result
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${levelMeta.color}`}>
              {levelMeta.badge}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-indigo-200 font-mono text-base font-bold shadow-inner flex items-center justify-between">
            <span>{evaluationResult?.output || 'No evaluation result yet.'}</span>
            <span className="text-xs font-normal text-slate-500 font-sans">
              {totalSteps} reduction {totalSteps === 1 ? 'step' : 'steps'}
            </span>
          </div>

          {/* Explanation Text */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Analysis ({levelMeta.title})
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {evaluationResult?.explanation || 'Run custom code to see step-by-step reduction trace.'}
            </p>
          </div>

          {/* Interactive Stepper Mode */}
          {viewMode === 'stepper' && currentStep && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  Step {activeStepIndex + 1} of {totalSteps}
                </span>

                {/* Scrubber Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveStepIndex(0)}
                    disabled={activeStepIndex === 0}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                    title="Jump to Start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                    disabled={activeStepIndex === 0}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={totalSteps <= 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-40"
                    title={isPlaying ? 'Pause Auto-Play' : 'Auto-Play Steps'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    onClick={() => setActiveStepIndex(Math.min(totalSteps - 1, activeStepIndex + 1))}
                    disabled={activeStepIndex >= totalSteps - 1}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                    title="Next Step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveStepIndex(totalSteps - 1)}
                    disabled={activeStepIndex >= totalSteps - 1}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                    title="Jump to Final Form"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              {totalSteps > 1 && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={totalSteps - 1}
                    value={activeStepIndex}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setActiveStepIndex(Number(e.target.value));
                    }}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                  />
                </div>
              )}

              {/* Active Step Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    STAGE 0{currentStep.stepNumber}
                  </span>
                  {activeStepIndex === totalSteps - 1 && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      Normal Form (Result)
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm sm:text-base text-slate-100 overflow-x-auto">
                  {currentStep.expression}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {currentStep.description}
                </p>
              </div>
            </div>
          )}

          {/* Full Reduction Timeline Mode */}
          {viewMode === 'timeline' && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Complete Reduction Sequence
              </span>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.stepNumber}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setViewMode('stepper');
                    }}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 hover:border-indigo-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-indigo-400 font-semibold">
                      <span>Step 0{step.stepNumber}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-indigo-300">Click to inspect</span>
                    </div>
                    <div className="font-mono text-xs text-slate-200 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
                      {step.expression}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
