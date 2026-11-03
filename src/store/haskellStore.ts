/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  SimulationResult, 
  ExplanationLevel,
  Chapter,
  simulateCurrying, 
  simulateFold, 
  simulateMaybeMonad, 
  simulateLazyFibs 
} from '../utils/haskellEngine.ts';
import { reduceCustomHaskell } from '../utils/haskellReducer.ts';
import { errorManager } from '../utils/errorManager.ts';

export type { Chapter } from '../utils/haskellEngine.ts';
export type ViewMode = 'learn' | 'playground' | 'visualizer' | 'quiz' | 'ai-tutor';

export const CHAPTERS: Chapter[] = [
  {
    id: 'currying',
    title: 'Currying & Partial Application',
    subtitle: 'Every function in Haskell takes exactly one argument',
    description: 'Explore how multi-argument functions are transformed into chains of single-argument functions.',
    defaultCode: `-- Currying & Partial Application
add :: Int -> Int -> Int
add x y = x + y

-- Partially applied function
addFive :: Int -> Int
addFive = add 5

result :: Int
result = addFive 10  -- Evaluates to 15`,
    explanations: {
      beginner: {
        tagline: 'Assembly Line with Single-Ingredient Stations',
        audience: 'Intuitive / Everyday Analogy',
        badge: 'Level 1 · Intuition',
        analogy: 'Imagine ordering a customized sandwich. You do not shout all 5 ingredients at once. Instead, Station 1 takes your bread choice and hands you a specialized station that only asks for your cheese. When you give the final cheese, the sandwich is made!',
        coreConcept: 'In Haskell, there is no such thing as a function that accepts two inputs at the same instant. A function takes ONE input, and hands back another function ready for the next input.',
        keyTakeaway: 'add x y is secretly (add x) y. You can stop halfway to make custom tools!',
        codeBreakdown: {
          code: `add 5 10  ==>  (add 5) 10  ==>  15`,
          annotations: [
            { line: 'add 5', note: 'Creates a brand new function that adds 5 to anything.' },
            { line: '10', note: 'Supplies the final missing argument.' }
          ]
        },
        commonPitfalls: [
          'Thinking functions take comma-separated lists of arguments like add(5, 10).',
          'Forgetting that parentheses associate to the left in function calls: f x y is (f x) y.'
        ]
      },
      practitioner: {
        tagline: 'First-Class Functions, Composition & Eta-Reduction',
        audience: 'Idiomatic Haskell Developer',
        badge: 'Level 2 · Practitioner',
        analogy: 'Think of currying as factory configuration. You configure reusable pipeline components like `filter (> 0)` or `map (* 2)` without needing cumbersome anonymous lambda declarations everywhere.',
        coreConcept: 'The type arrow `->` associates to the right: `Int -> Int -> Int` is actually `Int -> (Int -> Int)`. Function application associates to the left: `add 5 10` is `(add 5) 10`. This makes partial application seamless.',
        keyTakeaway: 'Currying enables point-free programming and clean higher-order pipelines: `map (add 5) [1,2,3]`.',
        codeBreakdown: {
          code: `-- Explicit lambda vs curried form
addExplicit = \\x -> (\\y -> x + y)

-- Eta-reduced point-free form
multiplyByTwo = (* 2)`,
          annotations: [
            { line: '\\x -> (\\y -> ...)', note: 'Exact desugared lambda representation.' },
            { line: '(* 2)', note: 'Operator section, idiomatic partial application.' }
          ]
        },
        commonPitfalls: [
          'Overusing point-free style when it hurts code readability (point-pointless).',
          'Accidental uncurrying when working with tuples: (Int, Int) -> Int cannot be partially applied.'
        ]
      },
      theoretical: {
        tagline: 'Cartesian Closed Categories, β-Reduction & GHC STG PAPs',
        audience: 'Type Theory & GHC Compiler Internals',
        badge: 'Level 3 · Under The Hood',
        analogy: 'In category theory, the exponential object C^B represents the function space. Currying establishes a natural isomorphism between the product bifunctor and the internal hom-functor.',
        coreConcept: 'Currying is the adjunction Hom(A × B, C) ≅ Hom(A, C^B) in Cartesian Closed Categories. In untyped and typed λ-calculus (System F), multi-ary abstractions do not exist; multi-argument functions are nested abstractions λx. λy. e evaluated via β-reduction.',
        keyTakeaway: 'At runtime, GHC allocates a PAP (Partial Application) closure on the heap with pointers to the original code and supplied arguments until saturation.',
        codeBreakdown: {
          code: `-- GHC Core representation
add = \\ (x :: Int) (y :: Int) ->
  case x of { I# x# ->
  case y of { I# y# ->
  case +# x# y# of { r# -> I# r# } } }`,
          annotations: [
            { line: 'I# x#', note: 'Unboxing boxed Int to primitive unboxed machine integer Int#.' },
            { line: '+# x# y#', note: 'Direct GHC primitive addition instruction.' }
          ]
        },
        deepDiveNotes: [
          'PAP (Partial Application) objects hold up to 7 arguments before spilling to heap arrays.',
          'GHC performs strictness analysis (worker-wrapper transformation) to eliminate boxing overhead on saturated calls.'
        ]
      }
    }
  },
  {
    id: 'laziness',
    title: 'Lazy Evaluation & Thunks',
    subtitle: 'Expressions are not evaluated until their values are demanded',
    description: 'Learn about non-strict evaluation, infinite data structures, and graph reduction.',
    defaultCode: `-- Infinite Fibonacci Stream using lazy corecursion
fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- Demand first 8 numbers
firstEight :: [Integer]
firstEight = take 8 fibs`,
    explanations: {
      beginner: {
        tagline: 'The Cook with an Infinite Recipe Book',
        audience: 'Intuitive / Everyday Analogy',
        badge: 'Level 1 · Intuition',
        analogy: 'Imagine a restaurant with an endless cookbook. A wasteful chef would cook all 1,000,000 recipes before opening the doors! A smart Haskell chef keeps the book closed and only starts chopping carrots when a customer orders soup.',
        coreConcept: 'Haskell will never compute anything until the result is required to produce real output on screen or in a file. If you create an infinite list, it consumes almost zero memory!',
        keyTakeaway: 'Laziness lets you define infinite things without running out of memory.',
        codeBreakdown: {
          code: `ones = 1 : ones
take 3 ones  ==>  [1, 1, 1]`,
          annotations: [
            { line: 'ones = 1 : ones', note: 'Self-referencing infinite stream of ones.' },
            { line: 'take 3', note: 'Only forces the first 3 items; rest never exists.' }
          ]
        },
        commonPitfalls: [
          'Assuming infinite loops crash immediately. In Haskell, [1..] is completely safe unless you ask for the end!'
        ]
      },
      practitioner: {
        tagline: 'Separation of Generation and Consumption & Space Leaks',
        audience: 'Idiomatic Haskell Developer',
        badge: 'Level 2 · Practitioner',
        analogy: 'Think of laziness as decoupled pipelines. A producer generates data freely (even infinite logs or coordinates), while the consumer controls when and how much is evaluated.',
        coreConcept: 'Haskell evaluation is non-strict: functions can return results even if some arguments would fail or loop (e.g. `const 42 undefined == 42`). Beware of space leaks when accumulator thunks build up instead of being evaluated.',
        keyTakeaway: 'Use lazy evaluation for streams and circular structures; use strict evaluation (`seq`, `$!`, `BangPatterns`) for numerical accumulators.',
        codeBreakdown: {
          code: `-- Space leak risk: foldl builds giant thunk chains
badSum = foldl (+) 0 [1..1000000]

-- Safe strict accumulator
goodSum = foldl' (+) 0 [1..1000000]`,
          annotations: [
            { line: 'foldl', note: 'Allocates millions of unevaluated (+ 1 (+ 2 ...)) thunks.' },
            { line: 'foldl\'', note: 'Forces accumulator to Weak Head Normal Form at each step.' }
          ]
        },
        commonPitfalls: [
          'Using lazy `foldl` on large lists leading to OutOfMemory stack overflows.',
          'Over-using BangPatterns (`!x`) when laziness is beneficial.'
        ]
      },
      theoretical: {
        tagline: 'Graph Reduction, Weak Head Normal Form (WHNF) & STG Thunks',
        audience: 'Type Theory & GHC Compiler Internals',
        badge: 'Level 3 · Under The Hood',
        analogy: 'Graph reduction treats the program as an acyclic directed graph of thunks. When an edge is demanded, the node is evaluated and overwritten with an indirection to memoize the result.',
        coreConcept: 'A Thunk is a heap object containing a code pointer and free variables. GHC evaluates expressions to Weak Head Normal Form (WHNF): the outermost constructor (like `:` or `Just`) or lambda abstraction is exposed, but sub-expressions remain thunks.',
        keyTakeaway: 'Graph reduction provides sharing: once a thunk is forced, GHC overwrites its header with an IND (indirection) pointer so it is never recomputed.',
        codeBreakdown: {
          code: `-- STG heap node lifecycle
-- 1. Allocated as THUNK
-- 2. Entered by consumer thread
-- 3. Overwritten with BLACKHOLE (detects deadlocks)
-- 4. Overwritten with IND (indirection to evaluated value)`,
          annotations: [
            { line: 'BLACKHOLE', note: 'Prevents multiple threads from duplicating work.' },
            { line: 'IND', note: 'Pointer indirection removed during subsequent GC sweeps.' }
          ]
        },
        deepDiveNotes: [
          'GHC uses Pointer Tagging: the lowest bits of heap pointers encode constructor tags, avoiding indirect jumps.',
          'Coinductive definitions like fibs represent greatest fixed points νX. F(X) of list functors.'
        ]
      }
    }
  },
  {
    id: 'pattern-matching',
    title: 'Pattern Matching & Guards',
    subtitle: 'Deconstruct data constructors with mathematical precision',
    description: 'Match on specific algebraic structures, lists, tuples, and conditional guards.',
    defaultCode: `-- Pattern matching on recursive lists
sumList :: Num a => [a] -> a
sumList []     = 0
sumList (x:xs) = x + sumList xs

-- Guards for multi-way conditional equations
grade :: Int -> String
grade score
  | score >= 90 = "A"
  | score >= 80 = "B"
  | otherwise   = "C"`,
    explanations: {
      beginner: {
        tagline: 'Toddler Shape Sorter Toy',
        audience: 'Intuitive / Everyday Analogy',
        badge: 'Level 1 · Intuition',
        analogy: 'Remember the plastic cube toy with star, triangle, and circle holes? You pick up a shape, and you drop it through the matching hole. Pattern matching works exactly the same: Haskell checks what shape your data is and runs the equation that matches.',
        coreConcept: 'Instead of writing long if-else-if chains, you state how your function handles an empty list `[]` versus a list with a head and tail `(x:xs)`.',
        keyTakeaway: 'You define functions by describing what the data looks like, piece by piece.',
        codeBreakdown: {
          code: `sumList []     = 0          -- Base case
sumList (x:xs) = x + rest   -- Recursive step`,
          annotations: [
            { line: '[]', note: 'Matches an empty list.' },
            { line: '(x:xs)', note: 'x is the first element, xs is the remainder.' }
          ]
        },
        commonPitfalls: [
          'Forgetting parentheses around `(x:xs)`; writing `x:xs` directly causes syntax errors.'
        ]
      },
      practitioner: {
        tagline: 'Exhaustiveness Checking, As-Patterns & View Patterns',
        audience: 'Idiomatic Haskell Developer',
        badge: 'Level 2 · Practitioner',
        analogy: 'Pattern matching is an exhaustive structural contract. The GHC compiler will alert you with `-Wincomplete-patterns` whenever you fail to cover a variant.',
        coreConcept: 'Pattern matching decomposes constructors, binds variables, and allows conditional guards (`|`). Use `@` as-patterns (`list@(x:xs)`) to keep a reference to the whole structure while destructuring.',
        keyTakeaway: 'Always enable `-Wall` to let GHC prove your pattern matches are exhaustive.',
        codeBreakdown: {
          code: `-- As-pattern preserving full list
compress list@(x:y:xs)
  | x == y    = compress (y:xs)
  | otherwise = x : compress (y:xs)
compress singleOrEmpty = singleOrEmpty`,
          annotations: [
            { line: 'list@(x:y:xs)', note: 'Binds x, y, xs, and keeps list for the whole structure.' },
            { line: '| x == y', note: 'Guard condition evaluated before body.' }
          ]
        },
        commonPitfalls: [
          'Writing non-exhaustive pattern matches that crash at runtime with pattern match failure exceptions.',
          'Relying on `head` or `tail` instead of pattern matching directly.'
        ]
      },
      theoretical: {
        tagline: 'Constructor Decomposition, Decision Trees & GHC Core Case',
        audience: 'Type Theory & GHC Compiler Internals',
        badge: 'Level 3 · Under The Hood',
        analogy: 'In System F_C, pattern matching desugars into primitive strict `case` expressions that force evaluation to Weak Head Normal Form.',
        coreConcept: 'GHC compiles pattern matching equations into optimal Decision Trees (or Decision DAGs) to minimize constructor inspections and eliminate redundant checks. Pattern matching is the sole mechanism that forces evaluation of a thunk.',
        keyTakeaway: 'In GHC Core, `case` is the fundamental strict primitive: `case expr of { Con a b -> ... }` forces `expr` to WHNF.',
        codeBreakdown: {
          code: `-- Desugared GHC Core case expression
sumList = \\ @a ($dNum :: Num a) (ds :: [a]) ->
  case ds of {
    []     -> fromInteger @a $dNum 0;
    : x xs -> + @a $dNum x (sumList @a $dNum xs)
  }`,
          annotations: [
            { line: 'case ds of', note: 'Strict WHNF evaluation of the list spine.' },
            { line: '[] / :', note: 'Direct jump table based on constructor tag.' }
          ]
        },
        deepDiveNotes: [
          'Constructor tags are stored in the low bits of heap pointers (Pointer Tagging), skipping memory loads.',
          'Redundant pattern warnings use the GADTs/pattern-match coverage algorithm (Karachalias et al.).'
        ]
      }
    }
  },
  {
    id: 'adts',
    title: 'Algebraic Data Types (ADTs)',
    subtitle: 'Define sum and product types to model domain logic precisely',
    description: 'Build custom types, recursive trees, and Maybe/Either containers.',
    defaultCode: `-- Recursive Binary Tree Algebraic Data Type
data Tree a 
  = Leaf a
  | Node (Tree a) (Tree a)
  deriving (Show, Eq)

depth :: Tree a -> Int
depth (Leaf _) = 1
depth (Node left right) = 1 + max (depth left) (depth right)`,
    explanations: {
      beginner: {
        tagline: 'Custom Lego Blocks: Choose (OR) and Combine (AND)',
        audience: 'Intuitive / Everyday Analogy',
        badge: 'Level 1 · Intuition',
        analogy: 'Imagine building a toy kit. You can make an OR choice (a traffic light is Red OR Yellow OR Green). Or you can make an AND combination (a User has a Name AND an Age). ADTs allow you to combine both effortlessly.',
        coreConcept: 'Haskell lets you invent your own types without complicated object-oriented classes. You list all the valid shapes your data can ever take, making illegal states impossible.',
        keyTakeaway: 'If you model your domain using ADTs, the compiler prevents invalid data states at compile time.',
        codeBreakdown: {
          code: `data TrafficLight = Red | Yellow | Green
data Person = Person String Int`,
          annotations: [
            { line: 'Red | Yellow | Green', note: 'Sum type (choice between variants).' },
            { line: 'Person String Int', note: 'Product type (combines String and Int).' }
          ]
        },
        commonPitfalls: [
          'Confusing Type Constructors (like `Tree a`) with Data Constructors (like `Leaf` and `Node`).'
        ]
      },
      practitioner: {
        tagline: 'Make Illegal States Unrepresentable with Sums & Records',
        audience: 'Idiomatic Haskell Developer',
        badge: 'Level 2 · Practitioner',
        analogy: 'Think of ADTs as type-level architecture. In OOP, you might use null pointers or boolean flags (isVerified, isPending, isFailed) that allow impossible combinations. In Haskell, you declare exactly the valid variants.',
        coreConcept: 'Sum types (`|`) model mutually exclusive states; product types (`Record { ... }`) combine data. Use `newtype` for single-constructor product types with zero runtime memory overhead.',
        keyTakeaway: 'Parse, don\'t validate: encode business rules directly into ADT structure.',
        codeBreakdown: {
          code: `data PaymentStatus
  = Unpaid
  | Processing TxId
  | Succeeded Receipt
  | Failed ErrorCode`,
          annotations: [
            { line: 'Processing TxId', note: 'Only exists when a TxId is actually present.' },
            { line: 'Failed ErrorCode', note: 'No null pointer errors possible.' }
          ]
        },
        commonPitfalls: [
          'Using primitive types (`String`, `Int`) everywhere instead of newtype wrappers for type safety.',
          'Partial record field selectors causing runtime exceptions.'
        ]
      },
      theoretical: {
        tagline: 'Polynomial Functors, Scott Encoding & Heap Layout',
        audience: 'Type Theory & GHC Compiler Internals',
        badge: 'Level 3 · Under The Hood',
        analogy: 'ADTs are called "Algebraic" because they form a semiring: Sum types correspond to addition (+), Product types correspond to multiplication (×), Void is 0, and Unit () is 1.',
        coreConcept: 'Types are initial algebras for polynomial endofunctors. A binary tree `Tree a` satisfies the recursive type isomorphism `T ≅ A + T × T`. In type theory, types can even be differentiated (giving rise to Zippers)!',
        keyTakeaway: 'The cardinality of an ADT is mathematically computed from sum choices and product combinations.',
        codeBreakdown: {
          code: `-- GHC memory layout of Tree a
-- Data Constructor Node:
-- [ Info Pointer | Pointer to Left | Pointer to Right ]
-- Data Constructor Leaf:
-- [ Info Pointer | Pointer to a ]`,
          annotations: [
            { line: 'Info Pointer', note: 'Contains garbage collector layout and entry code.' },
            { line: 'Pointers', note: 'Payload pointers tagged with low-bit constructor index.' }
          ]
        },
        deepDiveNotes: [
          'The derivative of a type T with respect to a type variable X yields the type of one-hole contexts (Huet\'s Zipper).',
          '`newtype` is compiled to an identity coercion in System F_C with zero runtime indirection.'
        ]
      }
    }
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
sumRight = foldr (+) 0

-- Short-circuiting with foldr on infinite lists
hasZero :: [Int] -> Bool
hasZero = foldr (\\x acc -> x == 0 || acc) False`,
    explanations: {
      beginner: {
        tagline: 'Rolling a Snowball vs Unhooking a Chain',
        audience: 'Intuitive / Everyday Analogy',
        badge: 'Level 1 · Intuition',
        analogy: 'Imagine rolling a snowball down a hill: you roll it forward, gathering more snow with every step (Left Fold). Now imagine unhooking a chain necklace link by link from the clasp at the end (Right Fold).',
        coreConcept: 'Folds take a list of many items and fold them up into a single final answer, such as finding the sum, product, or maximum.',
        keyTakeaway: 'foldr starts combining from the right; foldl starts from the left.',
        codeBreakdown: {
          code: `foldl (+) 0 [1, 2, 3]  ==>  ((0 + 1) + 2) + 3
foldr (+) 0 [1, 2, 3]  ==>  1 + (2 + (3 + 0))`,
          annotations: [
            { line: '((0 + 1) + 2) + 3', note: 'Associates to the left.' },
            { line: '1 + (2 + (3 + 0))', note: 'Associates to the right (replaces : with + and [] with 0).' }
          ]
        },
        commonPitfalls: [
          'Assuming foldl is always faster. In Haskell, foldr can terminate early on infinite lists, while lazy foldl causes space leaks!'
        ]
      },
      practitioner: {
        tagline: 'Foldl\' for Strict Aggregates, Foldr for Corecursion & Short-Circuiting',
        audience: 'Idiomatic Haskell Developer',
        badge: 'Level 2 · Practitioner',
        analogy: 'Think of foldr as a structural transformer that replaces `(:)` with your combining function `f` and `[]` with base value `z`.',
        coreConcept: '`foldr` can consume infinite lists if `f` does not always inspect its second argument (e.g. `(||)` or `(:)`). Conversely, for strict numerical totals, standard `foldl` builds thunk towers—always use `Data.List.foldl\'` instead!',
        keyTakeaway: 'Golden Rule: Use `foldl\'` for strict scalar numbers; use `foldr` for transforming structures or lazy processing.',
        codeBreakdown: {
          code: `import Data.List (foldl')

-- Strict accumulator (O(1) memory)
total = foldl' (+) 0 [1..1000000]

-- Lazy short-circuiting on infinite list!
checkAny = foldr (||) False (True : repeat False)`,
          annotations: [
            { line: 'foldl\'', note: 'Forces accumulator with seq at each element.' },
            { line: 'repeat False', note: 'Terminates in O(1) time because True || _ is True.' }
          ]
        },
        commonPitfalls: [
          'Using naive lazy `foldl` on lists with more than 10,000 items.',
          'Using `foldr` for simple totals like sum or product.'
        ]
      },
      theoretical: {
        tagline: 'Universal Catamorphism & Shortcut Fusion (build/foldr)',
        audience: 'Type Theory & GHC Compiler Internals',
        badge: 'Level 3 · Under The Hood',
        analogy: 'In category theory, foldr is the unique homomorphism from the initial algebra of lists to any other F-algebra (a Catamorphism).',
        coreConcept: 'List catamorphism: For the list functor F(X) = 1 + A × X, the initial algebra is (μF, [nil, cons]). foldr f z is the unique catamorphism cata([z, f]). GHC leverages this via rewrite rules: `foldr k z (build g) = g k z` (deforestation).',
        keyTakeaway: 'GHC rewrites pipelines of maps and filters into a single tight loop without allocating intermediate lists on the heap.',
        codeBreakdown: {
          code: `{-# RULES
"foldr/build" forall k z (g::forall b. (a->b->b) -> b -> b) .
              foldr k z (build g) = g k z
#-}`,
          annotations: [
            { line: 'foldr/build', note: 'GHC\'s famous deforestation rewrite rule.' },
            { line: 'g k z', note: 'Fuses producer and consumer into zero intermediate allocations.' }
          ]
        },
        deepDiveNotes: [
          'The initial algebra property guarantees that foldr preserves structural invariants.',
          '`foldl` is not a primitive catamorphism; it is derived as `foldr (\\x k acc -> k (acc + x)) id xs 0`.'
        ]
      }
    }
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
    explanations: {
      beginner: {
        tagline: 'Bubble-Wrapped Postal Package Pipeline',
        audience: 'Intuitive / Everyday Analogy',
        badge: 'Level 1 · Intuition',
        analogy: 'Imagine shipping fragile glassware. You place it in a padded box (`Just glass`). At each shipping depot, the postal worker inspects the box. If it is already marked broken (`Nothing`), they do not bother processing it—they simply forward the notice. If it is intact, they work on it and re-seal it.',
        coreConcept: 'A Monad is simply a way to chain actions together while automatically taking care of backstage complications (like nulls, failures, state, or logging).',
        keyTakeaway: 'Monads allow you to write normal sequential code while safely handling failures behind the scenes.',
        codeBreakdown: {
          code: `Just 10 >>= (\\x -> Just (x * 2))  ==>  Just 20
Nothing >>= (\\x -> Just (x * 2))  ==>  Nothing`,
          annotations: [
            { line: '>>=', note: 'The bind operator: unpacks the box and applies the function.' },
            { line: 'Nothing', note: 'Automatically stops the computation safely.' }
          ]
        },
        commonPitfalls: [
          'Thinking Monads are scary or mysterious because of the academic name "Monad".',
          'Believing IO breaks functional purity; IO is just a recipe for pure actions.'
        ]
      },
      practitioner: {
        tagline: 'Programmable Semicolons, Do-Notation & Monad Transformers',
        audience: 'Idiomatic Haskell Developer',
        badge: 'Level 2 · Practitioner',
        analogy: 'Think of Monads as customizable semicolons. Between every line of code, the monad decides whether to continue, short-circuit, write logs, or pass an implicit environment.',
        coreConcept: 'The Monad typeclass extends `Applicative` with `>>=` (bind): `m a -> (a -> m b) -> m b`. `do` notation is syntactic sugar: `x <- mx; my` desugars into `mx >>= (\\x -> my)`.',
        keyTakeaway: 'Use `Maybe` for optionality, `Either` for error messages, and `State` for pure mutable simulations.',
        codeBreakdown: {
          code: `-- Do-notation desugaring
do { x <- mx; y <- my; return (x + y) }

-- Desugars to explicit binds:
mx >>= (\\x -> my >>= (\\y -> return (x + y)))`,
          annotations: [
            { line: 'x <- mx', note: 'Monadic extraction without leaving the context.' },
            { line: 'return', note: 'Lifts a pure value back into the monadic context (pure).' }
          ]
        },
        commonPitfalls: [
          'Confusing `return` with an imperative return keyword; in Haskell `return` does not exit early!',
          'Trying to "escape" or "extract" a value out of the `IO` monad.'
        ]
      },
      theoretical: {
        tagline: 'Endofunctor Monoids, Kleisli Categories & Monad Laws',
        audience: 'Type Theory & GHC Compiler Internals',
        badge: 'Level 3 · Under The Hood',
        analogy: 'Saunders Mac Lane: "A monad in X is just a monoid in the category of endofunctors of X, with product × replaced by composition of endofunctors and unit set by the identity endofunctor."',
        coreConcept: 'A Monad is a triple (T, η, μ) where T: C → C is an endofunctor, η: Id → T is the unit natural transformation, and μ: T² → T is multiplication (join), satisfying pentagon (associativity) and triangle (unit) coherence diagrams.',
        keyTakeaway: 'Every valid Monad must satisfy the 3 Monad Laws: Left Identity, Right Identity, and Associativity.',
        codeBreakdown: {
          code: `-- The 3 Mathematical Monad Laws
return a >>= k                  ≡ k a
m >>= return                     ≡ m
m >>= (\\x -> k x >>= h)          ≡ (m >>= k) >>= h`,
          annotations: [
            { line: 'Left Identity', note: 'return does not alter computation.' },
            { line: 'Right Identity', note: 'Binding return is a no-op.' },
            { line: 'Associativity', note: 'Sequencing nesting order does not change semantics.' }
          ]
        },
        deepDiveNotes: [
          'The Kleisli category of a monad T has the same objects as C, but morphisms A → T B with composition (g ∘_K f) = μ ∘ T g ∘ f.',
          'GHC optimizes monadic binds through inlining and join points in Core.'
        ]
      }
    }
  }
];

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface HaskellState {
  currentView: ViewMode;
  selectedChapterId: string;
  explanationLevel: ExplanationLevel;
  editorCode: string;
  evaluationResult: SimulationResult | null;
  isEvaluating: boolean;
  aiMessages: ChatMessage[];
  isAiLoading: boolean;
  
  // Actions
  setView: (view: ViewMode) => void;
  selectChapter: (chapterId: string) => void;
  setExplanationLevel: (level: ExplanationLevel) => void;
  setEditorCode: (code: string) => void;
  evaluateCode: (codeToEval?: string) => Promise<void>;
  sendAiMessage: (prompt: string) => Promise<void>;
  resetAiChat: () => void;
}

export const useHaskellStore = create<HaskellState>((set, get) => ({
  currentView: 'learn',
  selectedChapterId: 'currying',
  explanationLevel: 'practitioner',
  editorCode: CHAPTERS[0].defaultCode,
  evaluationResult: simulateCurrying(3, 4, 'practitioner'),
  isEvaluating: false,
  aiMessages: [
    {
      role: 'assistant',
      text: "Hello! I'm your Haskell AI Tutor. I can explain any concept across 3 depth levels: Beginner (Analogy), Practitioner (Code), or Under The Hood (GHC STG & Theory). Ask me anything!"
    }
  ],
  isAiLoading: false,

  setView: (view) => set({ currentView: view }),

  setExplanationLevel: (level) => {
    set({ explanationLevel: level });
    const { selectedChapterId } = get();
    let updatedRes: SimulationResult;
    if (selectedChapterId === 'currying') updatedRes = simulateCurrying(3, 4, level);
    else if (selectedChapterId === 'folds') updatedRes = simulateFold('foldl', [1, 2, 3], level);
    else if (selectedChapterId === 'monads') updatedRes = simulateMaybeMonad(10, level);
    else if (selectedChapterId === 'laziness') updatedRes = simulateLazyFibs(6, level);
    else {
      updatedRes = {
        output: 'Compiled Successfully',
        explanation: `Concept analysis at ${level} level.`,
        steps: [{ stepNumber: 1, expression: 'Haskell expression', description: `Inspected at ${level} depth.` }],
        level
      };
    }
    set({ evaluationResult: updatedRes });
  },

  selectChapter: (chapterId) => {
    const chapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
    const level = get().explanationLevel;
    let initialRes: SimulationResult;
    if (chapterId === 'currying') initialRes = simulateCurrying(3, 4, level);
    else if (chapterId === 'folds') initialRes = simulateFold('foldl', [1, 2, 3], level);
    else if (chapterId === 'monads') initialRes = simulateMaybeMonad(10, level);
    else if (chapterId === 'laziness') initialRes = simulateLazyFibs(6, level);
    else {
      initialRes = {
        output: 'Compiled Successfully',
        explanation: `Analysis of ${chapter.title} at ${level} level.`,
        steps: [{ stepNumber: 1, expression: chapter.defaultCode.split('\n')[0] || 'code', description: 'Loaded default snippet.' }],
        level
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
    const level = get().explanationLevel;
    
    // Instantly compute pure functional step-by-step reduction of custom code
    const immediateTrace = reduceCustomHaskell(code, level);
    set({ evaluationResult: immediateTrace, isEvaluating: true });

    try {
      const res = await fetch('/api/haskell/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, level })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response.');
      }
      const data = await res.json();
      if (data.success && data.result) {
        set({ evaluationResult: data.result, isEvaluating: false });
        errorManager.notify(`Code evaluated at ${level} level!`, 'success');
      } else {
        set({ isEvaluating: false });
      }
    } catch (error) {
      // Keep immediateTrace and finish evaluating
      set({ isEvaluating: false });
    }
  },

  sendAiMessage: async (prompt) => {
    if (!prompt.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: prompt };
    const currentMsgs = get().aiMessages;
    const level = get().explanationLevel;

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
          context: get().selectedChapterId,
          level
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
      const fallbackReply = `[${level.toUpperCase()} LEVEL] Regarding your question ("${prompt}"), Haskell approaches functional programming through curried equations, non-strict evaluation (thunks), and algebraic types.`;
      const errMsg: ChatMessage = { role: 'assistant', text: fallbackReply };
      set({ aiMessages: [...get().aiMessages, errMsg], isAiLoading: false });
    }
  },

  resetAiChat: () => {
    set({
      aiMessages: [
        {
          role: 'assistant',
          text: "Chat reset. Select a depth level (Beginner, Practitioner, or Under The Hood) and ask any Haskell question!"
        }
      ]
    });
  }
}));
