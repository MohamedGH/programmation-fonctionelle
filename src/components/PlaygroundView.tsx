/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHaskellStore } from '../store/haskellStore.ts';
import { Play, Sparkles, RefreshCw, Terminal, CheckCircle2, Copy } from 'lucide-react';
import { errorManager } from '../utils/errorManager.ts';

export const PlaygroundView: React.FC = () => {
  const { editorCode, setEditorCode, evaluateCode, evaluationResult, isEvaluating, setView } = useHaskellStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(editorCode);
    errorManager.notify('Code copied to clipboard!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isEvaluating ? 'Evaluating...' : 'Run & Trace'}</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 text-slate-300 font-semibold">Main.hs</span>
            </div>
            <span>GHC 9.8 / Haskell 2010</span>
          </div>
          <textarea
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            rows={16}
            className="w-full p-5 bg-transparent text-slate-100 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/40"
            placeholder="Type or paste Haskell code here..."
            spellCheck={false}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Tip: Modify expressions or functions to test evaluation steps.</span>
          <button
            onClick={() => setView('ai-tutor')}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Tutor to explain</span>
          </button>
        </div>
      </div>

      {/* Evaluation & Reduction Trace Panel */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Reduction Trace & Output</h2>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Evaluated Result
            </span>
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-indigo-200 font-mono text-sm shadow-inner">
              {evaluationResult?.output || 'No evaluation result yet.'}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Explanation
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {evaluationResult?.explanation || 'Run code to see step-by-step trace.'}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Step-by-Step Reduction Tree
            </span>
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2">
              {evaluationResult?.steps?.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-indigo-400 font-semibold">
                    <span>Step 0{step.stepNumber}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-200 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
                    {step.expression}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
