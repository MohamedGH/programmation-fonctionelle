/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHaskellStore } from './store/haskellStore.ts';
import { Navbar } from './components/Navbar.tsx';
import { ErrorToast } from './components/ErrorToast.tsx';
import { LearnView } from './components/LearnView.tsx';
import { PlaygroundView } from './components/PlaygroundView.tsx';
import { VisualizerView } from './components/VisualizerView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { AiTutorView } from './components/AiTutorView.tsx';

export default function App() {
  const { currentView } = useHaskellStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-16">
        {currentView === 'learn' && <LearnView />}
        {currentView === 'playground' && <PlaygroundView />}
        {currentView === 'visualizer' && <VisualizerView />}
        {currentView === 'quiz' && <QuizView />}
        {currentView === 'ai-tutor' && <AiTutorView />}
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        LambdaLens: Interactive Haskell Studio · Powered by Functional Programming & Gemini AI
      </footer>

      <ErrorToast />
    </div>
  );
}
