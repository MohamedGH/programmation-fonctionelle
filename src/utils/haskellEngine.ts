/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExplanationLevel = 'beginner' | 'practitioner' | 'theoretical';

export interface EvaluationStep {
  stepNumber: number;
  expression: string;
  description: string;
}

export interface SimulationResult {
  output: string;
  explanation: string;
  steps: EvaluationStep[];
  level?: ExplanationLevel;
}

export interface LevelExplanation {
  tagline: string;
  audience: string;
  badge: string;
  analogy: string;
  coreConcept: string;
  keyTakeaway: string;
  codeBreakdown?: {
    code: string;
    annotations: { line: string; note: string }[];
  };
  deepDiveNotes?: string[];
  commonPitfalls?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  defaultCode: string;
  explanations: {
    beginner: LevelExplanation;
    practitioner: LevelExplanation;
    theoretical: LevelExplanation;
  };
}

/**
 * Pure function: Simulate currying and partial application with multi-level support
 */
export const simulateCurrying = (x: number, y: number, level: ExplanationLevel = 'practitioner'): SimulationResult => {
  let steps: EvaluationStep[] = [];
  let explanation = '';

  if (level === 'beginner') {
    steps = [
      {
        stepNumber: 1,
        expression: 'Order: Coffee Machine Station',
        description: 'Think of a drink order. Step 1: You choose the size (e.g. Size 3). The barista hands you a specialized machine that now only needs your flavor choice.'
      },
      {
        stepNumber: 2,
        expression: `add ${x} -> Waiting for second ingredient`,
        description: `Passing argument ${x} does not calculate the sum yet. It gives you a customized worker programmed to add ${x} to whatever you give it next.`
      },
      {
        stepNumber: 3,
        expression: `specializedWorker ${y}`,
        description: `You finally hand in ${y}. The specialized worker completes the job!`
      },
      {
        stepNumber: 4,
        expression: `${x + y}`,
        description: `Delivered final result: ${x + y}.`
      }
    ];
    explanation = `Beginner Intuition: In Haskell, there are no functions that take two things at once! Every function is a one-at-a-time machine that hands you another machine until you give the final piece.`;
  } else if (level === 'theoretical') {
    steps = [
      {
        stepNumber: 1,
        expression: 'λx. λy. (+ x y) ∈ A → (B → C)',
        description: 'Isomorphism between (A × B → C) and (A → (B → C)) in Cartesian Closed Categories (CCC).'
      },
      {
        stepNumber: 2,
        expression: `(λx. λy. + x y) ${x}  ⟹β  [x ↦ ${x}](λy. + x y) = (λy. + ${x} y)`,
        description: 'β-reduction on the outer lambda abstraction yielding an unsaturated closure on the GHC heap.'
      },
      {
        stepNumber: 3,
        expression: `(λy. + ${x} y) ${y}  ⟹β  (+ ${x} ${y})`,
        description: 'Final application enters the STG PAP (Partial Application Object) and invokes primitive GHC (+#) unboxed integer addition.'
      },
      {
        stepNumber: 4,
        expression: `${x + y}# wrapped into I# constructor`,
        description: 'Evaluated to Normal Form (NF). Unboxed Int# boxed back to data Int = I# Int#.'
      }
    ];
    explanation = `Category Theory & Type Theory: In Cartesian Closed Categories (CCC), currying is the natural bijection Hom(A × B, C) ≅ Hom(A, C^B). In GHC, partially applied functions create PAP closures allocated on the nursery heap until saturated.`;
  } else {
    // Practitioner
    steps = [
      {
        stepNumber: 1,
        expression: `add :: Int -> (Int -> Int)`,
        description: 'Function type arrows associate to the right: Int -> Int -> Int is Int -> (Int -> Int).'
      },
      {
        stepNumber: 2,
        expression: `addFive = add ${x}   -- Type: Int -> Int`,
        description: `Partial application: passing ${x} creates a reusable first-class function awaiting the remaining argument.`
      },
      {
        stepNumber: 3,
        expression: `addFive ${y}  ==>  (${x} + ${y})`,
        description: `Passing second argument ${y} to the partially applied function.`
      },
      {
        stepNumber: 4,
        expression: `${x + y}`,
        description: 'Saturated function evaluation complete.'
      }
    ];
    explanation = `Practitioner Guide: Currying makes functions highly composable. You can pre-configure functions (like map (add 5) [1,2,3]) without writing explicit lambda boilerplate.`;
  }

  return {
    output: `${x + y}`,
    explanation,
    steps,
    level
  };
};

/**
 * Pure function: Simulate foldl vs foldr reduction steps with multi-level support
 */
export const simulateFold = (type: 'foldl' | 'foldr', list: number[], level: ExplanationLevel = 'practitioner'): SimulationResult => {
  const steps: EvaluationStep[] = [];
  let result = 0;
  let explanation = '';

  if (type === 'foldl') {
    result = list.reduce((acc, n) => acc + n, 0);
    if (level === 'beginner') {
      steps.push({ stepNumber: 1, expression: `Start box = 0`, description: 'Left fold walks left-to-right holding a piggy bank (accumulator).' });
      let acc = 0;
      list.forEach((n, idx) => {
        const prev = acc;
        acc = acc + n;
        steps.push({
          stepNumber: idx + 2,
          expression: `Bank (${prev}) + coin ${n} = ${acc}`,
          description: `Add item ${n} into the accumulator piggy bank.`
        });
      });
      explanation = 'ELI5: foldl walks through the list from left to right like someone carrying a running total in a backpack.';
    } else if (level === 'theoretical') {
      steps.push({
        stepNumber: 1,
        expression: `foldl (+) z [${list.join(',')}] ⟹ (((0 + ${list[0]}) + ...) + ${list[list.length - 1]})`,
        description: 'Left-nested application spine. Because Haskell is lazy, (+) is not forced immediately, creating a chain of thunks.'
      });
      steps.push({
        stepNumber: 2,
        expression: `Space Leak Hazard: O(N) Thunk Allocation on GHC Heap`,
        description: 'Standard foldl consumes O(N) stack/heap space before evaluating! Idiomatic code uses strict foldl\' (Data.List) which forces WHNF with seq.'
      });
      steps.push({
        stepNumber: 3,
        expression: `STG Reduction: ${result}`,
        description: 'Forced to Normal Form.'
      });
      explanation = 'GHC Runtime & Category Theory: foldl builds left-nested thunks. In GHC, foldl\' uses seq/$! to force the accumulator to Weak Head Normal Form (WHNF) at each step to prevent stack overflows.';
    } else {
      steps.push({ stepNumber: 1, expression: `foldl (+) 0 [${list.join(', ')}]`, description: 'Initial left fold starting with accumulator 0.' });
      let acc = 0;
      list.forEach((n, idx) => {
        const prevAcc = acc;
        acc = acc + n;
        steps.push({
          stepNumber: idx + 2,
          expression: `(+) ${prevAcc} ${n} = ${acc}`,
          description: `Combine accumulator (${prevAcc}) with list element (${n}) from the left.`
        });
      });
      explanation = 'Practitioner Note: foldl processes elements left-to-right. For non-lazy accumulators, always prefer Data.List.foldl\' to avoid space leaks!';
    }
  } else {
    result = list.reduceRight((acc, n) => acc + n, 0);
    if (level === 'beginner') {
      steps.push({ stepNumber: 1, expression: `Base Case: 0 at the end`, description: 'Right fold replaces the list constructor (:) with (+) and [] with 0.' });
      steps.push({
        stepNumber: 2,
        expression: `1 : 2 : 3 : []  ==>  1 + (2 + (3 + 0))`,
        description: 'Notice how it associates like natural parentheses from right to left.'
      });
      steps.push({
        stepNumber: 3,
        expression: `Result = ${result}`,
        description: 'Final sum evaluated.'
      });
      explanation = 'ELI5: foldr replaces the empty list [] with 0, and replaces every colon (:) with your operation (+).';
    } else if (level === 'theoretical') {
      steps.push({
        stepNumber: 1,
        expression: `foldr f z xs: Universal Catamorphism on List Functor F(X) = 1 + A × X`,
        description: 'foldr is the initial algebra morphism in the category of F-algebras.'
      });
      steps.push({
        stepNumber: 2,
        expression: `Lazy Short-Circuiting: f x (foldr f z xs)`,
        description: 'If f is non-strict in its 2nd parameter (e.g. (||), (&&), or (:)), foldr terminates on infinite lists without evaluating the tail!'
      });
      steps.push({
        stepNumber: 3,
        expression: `Final Normal Form: ${result}`,
        description: 'Full reduction achieved.'
      });
      explanation = 'Category Theory: foldr is the list catamorphism. Crucially, non-strict operations like (x : foldr f z xs) can produce infinite streams on-demand via corecursion.';
    } else {
      steps.push({ stepNumber: 1, expression: `foldr (+) 0 [${list.join(', ')}]`, description: 'Right fold replacing (:) with (+).' });
      let acc = 0;
      const rev = [...list].reverse();
      rev.forEach((n, idx) => {
        const prevAcc = acc;
        acc = acc + n;
        steps.push({
          stepNumber: idx + 2,
          expression: `${n} + (${prevAcc}) = ${acc}`,
          description: `Combine element (${n}) with right accumulator (${prevAcc}).`
        });
      });
      explanation = 'Practitioner Rule: Use foldr when constructing lazy structures or working with potentially infinite lists, and foldl\' for calculating strict scalar aggregates.';
    }
  }

  return {
    output: `${result}`,
    explanation,
    steps,
    level
  };
};

/**
 * Pure function: Simulate Maybe monad chaining (>>=) with multi-level support
 */
export const simulateMaybeMonad = (val: number | null, level: ExplanationLevel = 'practitioner'): SimulationResult => {
  const steps: EvaluationStep[] = [];
  if (val === null) {
    if (level === 'beginner') {
      steps.push({
        stepNumber: 1,
        expression: 'Empty Gift Box (Nothing)',
        description: 'You open the box, and there is nothing inside. Every subsequent worker in the pipeline politely skips work because there is nothing to process.'
      });
    } else if (level === 'theoretical') {
      steps.push({
        stepNumber: 1,
        expression: 'Nothing >>= k = Nothing  (Monad Zero / Left Zero Law)',
        description: 'Failure propagates monadically without branching or exception frames in the GHC runtime.'
      });
    } else {
      steps.push({
        stepNumber: 1,
        expression: `Nothing >>= safeDiv 10`,
        description: 'Input is Nothing. Short-circuiting due to Maybe Monad bind implementation.'
      });
    }

    return {
      output: 'Nothing',
      explanation: level === 'beginner'
        ? 'ELI5: Nothing is like an empty container. The whole chain safely passes the empty container along without crashing.'
        : level === 'theoretical'
        ? 'Theory: Maybe is the Maybe monad (Kleisli category over the Maybe functor). Nothing is the absorbing element under bind.'
        : 'Maybe monad short-circuits on Nothing, propagating failure safely without null pointer exceptions.',
      steps,
      level
    };
  }

  if (level === 'beginner') {
    steps.push({ stepNumber: 1, expression: `Wrapped Parcel: Just ${val}`, description: `A safe box containing the number ${val}.` });
    const step2Val = val * 2;
    steps.push({ stepNumber: 2, expression: `Unwrap -> Double -> Re-wrap: Just ${step2Val}`, description: `The machine safely opens the box, doubles ${val} into ${step2Val}, and places it in a new box.` });
    const finalVal = step2Val + 10;
    steps.push({ stepNumber: 3, expression: `Unwrap -> Add 10 -> Re-wrap: Just ${finalVal}`, description: `Second machine adds 10 to produce ${finalVal} safely.` });

    return {
      output: `Just ${finalVal}`,
      explanation: 'ELI5: Monads are like secure bubble-wrapped shipping containers. You can run operations on the item inside without risking shipping damage.',
      steps,
      level
    };
  } else if (level === 'theoretical') {
    steps.push({ stepNumber: 1, expression: `η(val) = return ${val} = Just ${val}`, description: 'Unit / return natural transformation η: Id ⇒ T.' });
    const step2Val = val * 2;
    steps.push({ stepNumber: 2, expression: `Just ${val} >>= (\\x -> Just (x * 2))  [μ ∘ T(f)]`, description: 'Monadic bind is Kleisli composition: fmap f followed by join (flattening T(T a) → T a).' });
    const finalVal = step2Val + 10;
    steps.push({ stepNumber: 3, expression: `Just ${finalVal} ∈ Normal Form`, description: 'Satisfies Monad Associativity: (m >>= f) >>= g ≡ m >>= (\\x -> f x >>= g).' });

    return {
      output: `Just ${finalVal}`,
      explanation: 'Type Theory: A Monad is an endofunctor T with two natural transformations: unit η: Id → T and multiplication μ: T² → T satisfying associativity and identity laws.',
      steps,
      level
    };
  } else {
    steps.push({ stepNumber: 1, expression: `Just ${val}`, description: `Wrapped initial value in Maybe context.` });
    const step2Val = val * 2;
    steps.push({ stepNumber: 2, expression: `Just ${val} >>= (\\x -> Just (x * 2))`, description: `Bound value through fmap/bind. Result: Just ${step2Val}` });
    const finalVal = step2Val + 10;
    steps.push({ stepNumber: 3, expression: `Just ${step2Val} >>= (\\x -> Just (x + 10))`, description: `Final bound computation. Result: Just ${finalVal}` });

    return {
      output: `Just ${finalVal}`,
      explanation: 'Practitioner Guide: Maybe eliminates NullPointerExceptions entirely. Use do-notation or the bind operator (>>=) to chain nullable steps seamlessly.',
      steps,
      level
    };
  }
};

/**
 * Pure function: Simulate infinite list with take & fibs with multi-level support
 */
export const simulateLazyFibs = (n: number, level: ExplanationLevel = 'practitioner'): SimulationResult => {
  const fib = (count: number): number[] => {
    const res: number[] = [0, 1];
    for (let i = 2; i < count; i++) {
      res.push(res[i - 1] + res[i - 2]);
    }
    return res.slice(0, count);
  };

  const clamped = Math.max(1, Math.min(n, 10));
  const fibsList = fib(clamped);

  let steps: EvaluationStep[] = [];
  let explanation = '';

  if (level === 'beginner') {
    steps = [
      {
        stepNumber: 1,
        expression: 'A chef with an endless recipe book',
        description: 'The chef does NOT cook all million dishes in advance. They stand ready with the recipe.'
      },
      {
        stepNumber: 2,
        expression: `You order: "Give me the first ${clamped} dishes please!"`,
        description: `Your "take ${clamped}" command creates demand. The chef only cooks exactly ${clamped} items.`
      },
      {
        stepNumber: 3,
        expression: `Delivered: [${fibsList.join(', ')}]`,
        description: 'Remaining infinite dishes remain uncomputed in recipe form without using any memory.'
      }
    ];
    explanation = 'ELI5: Laziness means "procrastinate until you are forced to answer". Infinite lists cost zero memory until you ask for specific elements!';
  } else if (level === 'theoretical') {
    steps = [
      {
        stepNumber: 1,
        expression: 'fibs = 0 : 1 : zipWith (+) fibs (tail fibs)  [Greatest Fixed Point νX. F(X)]',
        description: 'Corecursion and coinductive stream generation over the terminal coalgebra.'
      },
      {
        stepNumber: 2,
        expression: `WHNF (Weak Head Normal Form): Cons Cell (:), Heap Thunk for Tail`,
        description: 'GHC allocates a constructor cell on the heap containing an evaluated head and an unevaluated suspension pointer (Thunk).'
      },
      {
        stepNumber: 3,
        expression: `take ${clamped} unwinds ${clamped} thunks into WHNF`,
        description: 'Each demand step enters the thunk closure, evaluates it, updates the heap node with an indirection to avoid re-evaluation.'
      }
    ];
    explanation = 'GHC STG Engine: Haskell uses Graph Reduction. Thunks are heap-allocated closures. Once forced, GHC overwrites the thunk with an indirection object to share the evaluated result (memoization).';
  } else {
    steps = [
      { stepNumber: 1, expression: `fibs = 0 : 1 : zipWith (+) fibs (tail fibs)`, description: 'Infinite list definition using corecursion and lazy thunks.' },
      { stepNumber: 2, expression: `take ${clamped} fibs`, description: `Demand first ${clamped} elements from the lazy infinite stream.` },
      { stepNumber: 3, expression: `[${fibsList.join(', ')}]`, description: 'Evaluated lazily up to the demanded demand point.' }
    ];
    explanation = 'Practitioner Guide: Non-strict evaluation allows clean separation between data generation (infinite streams) and consumption (take n, filter, etc.).';
  }

  return {
    output: `[${fibsList.join(', ')}]`,
    explanation,
    steps,
    level
  };
};

/**
 * Pure function to format level description text
 */
export const getLevelMeta = (level: ExplanationLevel) => {
  switch (level) {
    case 'beginner':
      return {
        id: 'beginner' as const,
        title: 'Beginner / ELI5',
        subtitle: 'Everyday analogies, mental models & zero jargon',
        badge: 'Level 1 · Intuition',
        color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40'
      };
    case 'practitioner':
      return {
        id: 'practitioner' as const,
        title: 'Practitioner',
        subtitle: 'Idiomatic Haskell, types, patterns & reduction steps',
        badge: 'Level 2 · Production Code',
        color: 'from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/40'
      };
    case 'theoretical':
      return {
        id: 'theoretical' as const,
        title: 'Under The Hood',
        subtitle: 'GHC STG machine, thunk heap layout & category theory',
        badge: 'Level 3 · Deep Theory',
        color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40'
      };
  }
};
