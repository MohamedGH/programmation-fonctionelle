/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, GitBranch, Layers, Box, Sparkles } from 'lucide-react';
import { simulateLazyFibs, simulateMaybeMonad, simulateFold } from '../utils/haskellEngine.ts';

export const VisualizerView: React.FC = () => {
  const [activeVisualizer, setActiveVisualizer] = useState<'adt' | 'laziness' | 'monads' | 'folds'>('adt');
  const [treeDepth, setTreeDepth] = useState<number>(3);
  const [fibCount, setFibCount] = useState<number>(6);
  const [maybeVal, setMaybeVal] = useState<number | null>(10);
  const [foldType, setFoldType] = useState<'foldl' | 'foldr'>('foldl');

  const lazyRes = simulateLazyFibs(fibCount);
  const maybeRes = simulateMaybeMonad(maybeVal);
  const foldRes = simulateFold(foldType, [1, 2, 3, 4]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Mental Models</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Real-Time Visual Diagrams</h1>
          <p className="text-sm text-slate-400 mt-1">Visualize data structures, lazy evaluation streams, and monad containers.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          {[
            { id: 'adt', label: 'ADTs & Trees', icon: <GitBranch className="w-4 h-4" /> },
            { id: 'laziness', label: 'Lazy Streams', icon: <Cpu className="w-4 h-4" /> },
            { id: 'monads', label: 'Monad Boxes', icon: <Box className="w-4 h-4" /> },
            { id: 'folds', label: 'Fold Reductions', icon: <Layers className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveVisualizer(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                activeVisualizer === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Content Container */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl min-h-[500px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {activeVisualizer === 'adt' && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Algebraic Data Type: Recursive Binary Tree</h3>
                <p className="text-xs font-mono text-indigo-400 mt-1">data Tree a = Leaf a | Node (Tree a) (Tree a)</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Tree Depth: {treeDepth}</span>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={treeDepth}
                  onChange={(e) => setTreeDepth(Number(e.target.value))}
                  className="accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-12 bg-slate-950/80 rounded-3xl border border-slate-800 gap-8 overflow-x-auto shadow-inner">
              <div className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-600/40 animate-in fade-in">
                Node (Root)
              </div>
              <div className="w-px h-8 bg-indigo-500/50"></div>
              <div className="flex gap-20">
                <div className="flex flex-col items-center gap-6">
                  <div className="px-5 py-2.5 rounded-xl bg-purple-600/90 text-white font-mono text-xs shadow-md">
                    Node (Left)
                  </div>
                  {treeDepth >= 3 && (
                    <>
                      <div className="w-px h-6 bg-purple-500/50"></div>
                      <div className="flex gap-8">
                        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs shadow">Leaf 4</div>
                        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs shadow">Leaf 2</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-6">
                  <div className="px-5 py-2.5 rounded-xl bg-purple-600/90 text-white font-mono text-xs shadow-md">
                    Node (Right)
                  </div>
                  {treeDepth >= 3 && (
                    <>
                      <div className="w-px h-6 bg-purple-500/50"></div>
                      <div className="flex gap-8">
                        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs shadow">Leaf 7</div>
                        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs shadow">Leaf 9</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeVisualizer === 'laziness' && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Lazy Infinite Stream (Corecursion)</h3>
                <p className="text-xs font-mono text-indigo-400 mt-1">fibs = 0 : 1 : zipWith (+) fibs (tail fibs)</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Demand (take n): {fibCount}</span>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={fibCount}
                  onChange={(e) => setFibCount(Number(e.target.value))}
                  className="accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-10 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-8 flex flex-col items-center justify-center shadow-inner">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {lazyRes.output.slice(1, -1).split(', ').map((num, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-500/40 flex items-center justify-center font-mono text-indigo-200 font-extrabold text-lg shadow-xl group-hover:scale-105 transition-transform">
                      {num}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Thunk #{i}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center max-w-lg leading-relaxed">
                Haskell constructs a lazy thunk network. Values are evaluated strictly on demand up to <span className="font-mono text-indigo-400">take {fibCount}</span>.
              </p>
            </div>
          </div>
        )}

        {activeVisualizer === 'monads' && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Maybe Monad & Context Chaining</h3>
                <p className="text-xs font-mono text-indigo-400 mt-1">Computations wrapped in Just or Nothing context</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setMaybeVal(10)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${maybeVal !== null ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Just 10
                </button>
                <button
                  onClick={() => setMaybeVal(null)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${maybeVal === null ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Nothing (Fail)
                </button>
              </div>
            </div>

            <div className="p-12 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-6 flex flex-col items-center justify-center shadow-inner">
              <div className="p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl flex items-center gap-6">
                <div className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold">
                  Monad Context
                </div>
                <div className="font-mono text-xl text-indigo-200 font-extrabold">
                  {maybeRes.output}
                </div>
              </div>
              <p className="text-xs text-slate-300 text-center max-w-md leading-relaxed">
                {maybeRes.explanation}
              </p>
            </div>
          </div>
        )}

        {activeVisualizer === 'folds' && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">FoldL vs FoldR Reduction Flow</h3>
                <p className="text-xs font-mono text-indigo-400 mt-1">Associativity comparison on list [1, 2, 3, 4]</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setFoldType('foldl')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${foldType === 'foldl' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  foldl (Left)
                </button>
                <button
                  onClick={() => setFoldType('foldr')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${foldType === 'foldr' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  foldr (Right)
                </button>
              </div>
            </div>

            <div className="p-8 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-3 shadow-inner">
              {foldRes.steps.map((step) => (
                <div key={step.stepNumber} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span className="text-indigo-400 font-bold shrink-0">Step 0{step.stepNumber}</span>
                  <span className="text-slate-200 font-semibold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">{step.expression}</span>
                  <span className="text-slate-400 text-right">{step.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>Interactive Diagram Engine</span>
          <span>LambdaLens Studio</span>
        </div>
      </div>
    </div>
  );
};
