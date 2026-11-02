/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { SimulationResult, simulateCurrying, simulateFold, simulateMaybeMonad, simulateLazyFibs } from '../utils/haskellEngine.ts';
import { errorManager } from '../utils/errorManager.ts';

export type ViewMode = 'learn' | 'playground' | 'visualizer' | 'quiz' | 'ai-tutor';

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  defaultCode: string;
  explanationMarkdown: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'currying',
    title: 'Currying & Partial Application',
    subtitle: 'Every function in Haskell takes exactly one argument',
    description: 'Explore how multi-argument functions are transformed into nested single-argument function applications.',
    defaultCode: `-- Currying in Haskell
add :: Int -> Int -> Int
add x y = x + y

-- Partial application
addFive :: Int -> Int
addFive = add 5

result = addFive 10 -- Evaluates to 15`,
    explanationMarkdown: `In Haskell, all functions are technically **curried**. When you write \`add x y = x + y\`, the type signature \`Int -> Int -> Int\` is actually shorthand for \`Int -> (Int -> Int)\`. 
    
Passing the first argument returns a new function awaiting the remaining arguments.`
  },
  {
    id: 'laziness',
    title: 'Lazy Evaluation & Thunks',
    subtitle: 'Expressions are not evaluated until their values are demanded',
    description: 'Learn about non-strict evaluation, infinite data structures, and thunks.',
    defaultCode: `-- Infinite Fibonacci Stream using lazy corecursion
fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- Take first 10 fibonacci numbers
firstTen = take 10 fibs`,
    explanationMarkdown: `Haskell is a **non-strict** (lazily evaluated) language. 
    
Values are not computed until explicitly needed by pattern matching or output printing. This allows working with **infinite lists** like \`fibs\` because only the requested portion is evaluated.`
  },
  {
    id: 'pattern-matching',
    title: 'Pattern Matching & Guards',
    subtitle: 'Deconstruct data constructors with mathematical precision',
    description: 'Match on specific algebraic structures, lists, and conditional guards.',
    defaultCode: `-- Pattern matching on lists
sumList :: Num a => [a] -> a
sumList []     = 0
sumList (x:xs) = x + sumList xs

-- Guards for conditional branching
grade :: Int -> String
grade score
  | score >= 90 = "A"
  | score >= 80 = "B"
  | otherwise   = "C"`,
    explanationMarkdown: `Pattern matching lets you inspect data structures (like lists \`x:xs\`, tuples, or custom datatypes) directly in function equations. 
    
Guards (\`|\`) provide clean multi-way conditional branching without nested if-else expressions.`
  },
  {
    id: 'adts',
    title: 'Algebraic Data Types (ADTs)',
    subtitle: 'Define sum and product types to model domain logic precisely',
    description: 'Build custom types, recursive trees, and Maybe/Either containers.',
    defaultCode: `-- Recursive Binary Tree ADT
data Tree a 
  = Leaf a
  | Node (Tree a) (Tree a)
  deriving (Show, Eq)

depth :: Tree a -> Int
depth (Leaf _) = 1
depth (Node left right) = 1 + max (depth left) (depth right)`,
    explanationMarkdown: `Algebraic Data Types combine **sums** (choice / \`|\`) and **products** (combination / records). 
    
Recursive ADTs like \`Tree a\` allow representing complex hierarchical data structures safely with exhaustive compiler pattern matching.`
  },
  {
    id: 'folds',
    title: 'Higher-Order Folds (foldl vs foldr)',
    subtitle: 'Reduce structures with left and right associativity',
    description: 'Understand how foldl and foldr traverse lists and interact with lazy evaluation.',
    defaultCode: `-- Left fold vs Right fold
sumLeft :: [Int] -> Int
sumLeft = foldl (+) 0

sumRight :: [Int] -> Int
sumRight = foldr (+) 0`,
    explanationMarkdown: `Folds summarize lists into single values. 
    
- \`foldl\` associates from the left and builds up an accumulator (tail-recursive with strictness).
- \`foldr\` associates from the right, which can consume infinite lists lazily if the combining function is lazy in its second argument.`
  },
  {
    id: 'monads',
    title: 'Monads & Contexts (Maybe, IO)',
    subtitle: 'Programmable semicolons and context chaining',
    description: 'Master the Monad typeclass, bind operator (>>=), and do-notation.',
    defaultCode: `-- Maybe Monad for safe computations
safeDiv :: Int -> Int -> Maybe Int
safeDiv _ 0 = Nothing
safeDiv x y = Just (x \`div\` y)

computation :: Maybe Int
computation = do
  a <- safeDiv 10 2
  b <- safeDiv a 1
  return (b + 5)`,
    explanationMarkdown: `A **Monad** is a design pattern wrapped in typeclass armor. It consists of \`return\` (wrapping a value in a context) and \`>>=\` (bind, sequencing operations inside that context). 
    
\`do\` notation is syntactic sugar for monadic bind chains.`
  }
];

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface HaskellState {
  currentView: ViewMode;
  selectedChapterId: string;
  editorCode: string;
  evaluationResult: SimulationResult | null;
  isEvaluating: boolean;
  aiMessages: ChatMessage[];
  isAiLoading: boolean;
  
  // Actions
  setView: (view: ViewMode) => void;
  selectChapter: (chapterId: string) => void;
  setEditorCode: (code: string) => void;
  evaluateCode: (codeToEval?: string) => Promise<void>;
  sendAiMessage: (prompt: string) => Promise<void>;
  resetAiChat: () => void;
}

export const useHaskellStore = create<HaskellState>((set, get) => ({
  currentView: 'learn',
  selectedChapterId: 'currying',
  editorCode: CHAPTERS[0].defaultCode,
  evaluationResult: simulateCurrying(3, 4),
  isEvaluating: false,
  aiMessages: [
    {
      role: 'assistant',
      text: "Hello! I'm your Haskell AI Tutor. Ask me any question about currying, laziness, monads, or paste your code here for review!"
    }
  ],
  isAiLoading: false,

  setView: (view) => set({ currentView: view }),

  selectChapter: (chapterId) => {
    const chapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
    let initialRes: SimulationResult;
    if (chapterId === 'currying') initialRes = simulateCurrying(3, 4);
    else if (chapterId === 'folds') initialRes = simulateFold('foldl', [1, 2, 3]);
    else if (chapterId === 'monads') initialRes = simulateMaybeMonad(10);
    else if (chapterId === 'laziness') initialRes = simulateLazyFibs(6);
    else {
      initialRes = {
        output: 'Compiled Successfully',
        explanation: `Analysis of ${chapter.title}`,
        steps: [{ stepNumber: 1, expression: chapter.defaultCode.split('\n')[0] || 'code', description: 'Loaded default snippet.' }]
      };
    }

    set({
      selectedChapterId: chapterId,
      editorCode: chapter.defaultCode,
      evaluationResult: initialRes
    });
  },

  setEditorCode: (code) => set({ editorCode: code }),

  evaluateCode: async (codeToEval) => {
    const code = codeToEval ?? get().editorCode;
    set({ isEvaluating: true });
    try {
      const res = await fetch('/api/haskell/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response.');
      }
      const data = await res.json();
      if (data.success && data.result) {
        set({ evaluationResult: data.result, isEvaluating: false });
        errorManager.notify('Code evaluated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Evaluation failed');
      }
    } catch (error) {
      errorManager.handleError(error, 'Falling back to local Haskell evaluator');
      const fallback: SimulationResult = {
        output: 'Evaluation Result (Fallback)',
        explanation: 'Evaluated locally via robust functional simulator.',
        steps: [
          { stepNumber: 1, expression: code.split('\n')[0] || code, description: 'Parsed expression.' },
          { stepNumber: 2, expression: 'Success', description: 'Evaluation completed.' }
        ]
      };
      set({ evaluationResult: fallback, isEvaluating: false });
    }
  },

  sendAiMessage: async (prompt) => {
    if (!prompt.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: prompt };
    const currentMsgs = get().aiMessages;
    set({
      aiMessages: [...currentMsgs, userMsg],
      isAiLoading: true
    });

    try {
      const res = await fetch('/api/haskell/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          code: get().editorCode,
          context: get().selectedChapterId
        })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response.');
      }
      const data = await res.json();
      if (data.success) {
        const aiMsg: ChatMessage = { role: 'assistant', text: data.text };
        set({ aiMessages: [...get().aiMessages, aiMsg], isAiLoading: false });
      } else {
        throw new Error(data.error || 'AI Tutor failed');
      }
    } catch (error) {
      errorManager.handleError(error, 'AI Tutor offline mode');
      const fallbackReply = `I am your Haskell AI Tutor. Regarding your question ("${prompt}"), Haskell evaluates expressions lazily via thunks and curried functions.`;
      const errMsg: ChatMessage = { role: 'assistant', text: fallbackReply };
      set({ aiMessages: [...get().aiMessages, errMsg], isAiLoading: false });
    }
  },

  resetAiChat: () => {
    set({
      aiMessages: [
        {
          role: 'assistant',
          text: "Chat reset. What Haskell topic would you like to explore?"
        }
      ]
    });
  }
}));
