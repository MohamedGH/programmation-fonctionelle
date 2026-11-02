/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the type signature of a curried addition function in Haskell?",
    codeSnippet: "add x y = x + y",
    options: [
      "Int -> Int -> Int",
      "(Int, Int) -> Int",
      "Int, Int -> Int",
      "Int -> Int"
    ],
    correctIndex: 0,
    explanation: "In Haskell, all multi-argument functions are curried. Int -> Int -> Int is equivalent to Int -> (Int -> Int)."
  },
  {
    id: 2,
    question: "Why can Haskell evaluate infinite lists like [1..] without crashing?",
    options: [
      "Because of eager garbage collection",
      "Because of lazy evaluation (non-strict semantics) where elements are computed on demand",
      "Because infinite lists are automatically truncated at 10,000 items",
      "Because the compiler optimizes away loops"
    ],
    correctIndex: 1,
    explanation: "Haskell evaluates expressions only when their values are demanded. Infinite data structures (streams) work seamlessly with functions like take."
  },
  {
    id: 3,
    question: "What does the bind operator (>>=) do in the Maybe monad?",
    codeSnippet: "Just 5 >>= \\x -> Just (x * 2)",
    options: [
      "Throws an exception if the value is null",
      "Unwraps the value, applies a function returning a new monadic value, and propagates Nothing on failure",
      "Converts Maybe into an IO action",
      "Performs bitwise shift on integers"
    ],
    correctIndex: 1,
    explanation: "The bind operator (>>=) chains monadic computations, automatically propagating short-circuit failures like Nothing."
  },
  {
    id: 4,
    question: "What is the key difference between foldl and foldr?",
    options: [
      "foldl is always faster than foldr",
      "foldr associates from the right and can consume infinite lists lazily, whereas foldl builds left-associated thunks",
      "foldr only works on numbers",
      "foldl does not require an initial accumulator"
    ],
    correctIndex: 1,
    explanation: "foldr associates from the right, allowing it to process infinite structures if the combining function is lazy in its second argument."
  }
];

export const QuizView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const q = QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === q.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUESTIONS.length) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-600/20 border border-indigo-500/40 rounded-3xl mx-auto flex items-center justify-center text-indigo-400">
          <HelpCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Quiz Completed!</h2>
          <p className="text-slate-400">You scored {score} out of {QUESTIONS.length} correct.</p>
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Haskell Mastery Quiz</h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Question {currentIndex + 1} of {QUESTIONS.length}
        </span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl space-y-6">
        <h3 className="text-lg font-bold text-white leading-relaxed">
          {q.question}
        </h3>

        {q.codeSnippet && (
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200">
            <code>{q.codeSnippet}</code>
          </pre>
        )}

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === q.correctIndex;
            let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700';
            if (isAnswered) {
              if (isCorrect) btnStyle = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200';
              else if (isSelected) btnStyle = 'bg-rose-950/80 border-rose-500/50 text-rose-200';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all font-medium text-sm flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400">Explanation</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
              >
                {currentIndex + 1 < QUESTIONS.length ? 'Next Question' : 'View Results'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
