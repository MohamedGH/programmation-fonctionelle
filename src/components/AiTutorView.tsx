/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useHaskellStore } from '../store/haskellStore.ts';
import { ExplanationLevel, getLevelMeta } from '../utils/haskellEngine.ts';
import { Sparkles, Send, RefreshCw, Bot, User, Lightbulb, Code2, Cpu } from 'lucide-react';

export const AiTutorView: React.FC = () => {
  const { 
    aiMessages, 
    sendAiMessage, 
    isAiLoading, 
    resetAiChat, 
    explanationLevel, 
    setExplanationLevel 
  } = useHaskellStore();

  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;
    sendAiMessage(input);
    setInput('');
  };

  const levelMeta = getLevelMeta(explanationLevel);

  const quickPrompts = [
    {
      level: 'beginner' as ExplanationLevel,
      text: 'Explain currying using a simple real-world analogy.'
    },
    {
      level: 'beginner' as ExplanationLevel,
      text: 'What is a Monad in plain English without math jargon?'
    },
    {
      level: 'practitioner' as ExplanationLevel,
      text: 'Why does foldl leak space and how does foldl\' prevent it?'
    },
    {
      level: 'theoretical' as ExplanationLevel,
      text: 'Explain how GHC compiles thunks into STG and evaluates WHNF.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Haskell AI Tutor</h1>
            <p className="text-xs text-slate-400">Multi-level tutoring powered by Gemini AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Switcher in Tutor Header */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'beginner' as const, label: 'ELI5', icon: <Lightbulb className="w-3.5 h-3.5" /> },
              { id: 'practitioner' as const, label: 'Code', icon: <Code2 className="w-3.5 h-3.5" /> },
              { id: 'theoretical' as const, label: 'Theory', icon: <Cpu className="w-3.5 h-3.5" /> },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setExplanationLevel(lvl.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  explanationLevel === lvl.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl.icon}
                <span>{lvl.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={resetAiChat}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono shrink-0">Quick prompts:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setExplanationLevel(qp.level);
              sendAiMessage(qp.text);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span className="font-mono text-[10px] text-indigo-400 uppercase">[{qp.level}]</span>
            <span>{qp.text}</span>
          </button>
        ))}
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {aiMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-xl p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-950 text-slate-200 border border-slate-800/80 rounded-tl-none font-sans'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
              </div>
            );
          })}
          {isAiLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-400 border border-slate-800 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>AI Tutor is formulating a {levelMeta.title} response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${levelMeta.title} mode (e.g. why is foldr lazy?)...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            type="submit"
            disabled={isAiLoading || !input.trim()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0 min-h-[44px]"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
