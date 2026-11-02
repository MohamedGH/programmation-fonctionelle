/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EvaluationStep {
  stepNumber: number;
  expression: string;
  description: string;
}

export interface SimulationResult {
  output: string;
  explanation: string;
  steps: EvaluationStep[];
}

/**
 * Pure function: Simulate currying and partial application for a binary function like `add x y = x + y`
 */
export const simulateCurrying = (x: number, y: number): SimulationResult => {
  const steps: EvaluationStep[] = [
    {
      stepNumber: 1,
      expression: `add = \\x -> \\y -> x + y`,
      description: 'Haskell functions are curried by default. Every function takes exactly one argument and returns a new function.'
    },
    {
      stepNumber: 2,
      expression: `add ${x}`,
      description: `Partially applying add with ${x}. Returns a new function: \\y -> ${x} + y`
    },
    {
      stepNumber: 3,
      expression: `(${x} + ${y})`,
      description: `Applying the second argument ${y} to the curried function.`
    },
    {
      stepNumber: 4,
      expression: `${x + y}`,
      description: 'Evaluation complete.'
    }
  ];

  return {
    output: `${x + y}`,
    explanation: `Demonstrating currying: add ${x} ${y} is evaluated as (add ${x}) ${y}.`,
    steps
  };
};

/**
 * Pure function: Simulate foldl vs foldr reduction steps
 */
export const simulateFold = (type: 'foldl' | 'foldr', list: number[]): SimulationResult => {
  const steps: EvaluationStep[] = [];
  let currentExpr = '';
  let result = 0;

  if (type === 'foldl') {
    result = list.reduce((acc, n) => acc + n, 0);
    currentExpr = `foldl (+) 0 [${list.join(', ')}]`;
    steps.push({ stepNumber: 1, expression: currentExpr, description: 'Initial left fold starting with accumulator 0.' });
    
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
  } else {
    result = list.reduceRight((acc, n) => acc + n, 0);
    currentExpr = `foldr (+) 0 [${list.join(', ')}]`;
    steps.push({ stepNumber: 1, expression: currentExpr, description: 'Initial right fold starting with base case 0 from the right.' });

    let acc = 0;
    const rev = [...list].reverse();
    rev.forEach((n, idx) => {
      const prevAcc = acc;
      acc = acc + n;
      steps.push({
        stepNumber: idx + 2,
        expression: `${n} + (${prevAcc}) = ${acc}`,
        description: `Combine list element (${n}) with right accumulator (${prevAcc}).`
      });
    });
  }

  return {
    output: `${result}`,
    explanation: `${type.toUpperCase()} evaluation on list [${list.join(', ')}] yields ${result}.`,
    steps
  };
};

/**
 * Pure function: Simulate Maybe monad chaining (>>=)
 */
export const simulateMaybeMonad = (val: number | null): SimulationResult => {
  const steps: EvaluationStep[] = [];
  if (val === null) {
    steps.push({ stepNumber: 1, expression: `Nothing >>= safeDiv 10`, description: 'Input is Nothing. Short-circuiting due to Monad laws.' });
    return {
      output: 'Nothing',
      explanation: 'Maybe monad short-circuits on Nothing, propagating failure safely without exceptions.',
      steps
    };
  }

  steps.push({ stepNumber: 1, expression: `Just ${val}`, description: `Wrapped initial value in Maybe context.` });
  const step2Val = val * 2;
  steps.push({ stepNumber: 2, expression: `Just ${val} >>= (\\x -> Just (x * 2))`, description: `Bound value through fmap/bind. Result: Just ${step2Val}` });
  const finalVal = step2Val + 10;
  steps.push({ stepNumber: 3, expression: `Just ${step2Val} >>= (\\x -> Just (x + 10))`, description: `Final bound computation. Result: Just ${finalVal}` });

  return {
    output: `Just ${finalVal}`,
    explanation: 'Maybe Monad chains computations seamlessly while handling potential null/Nothing cases.',
    steps
  };
};

/**
 * Pure function: Simulate infinite list with take & fibs
 */
export const simulateLazyFibs = (n: number): SimulationResult => {
  const fib = (count: number): number[] => {
    const res: number[] = [0, 1];
    for (let i = 2; i < count; i++) {
      res.push(res[i - 1] + res[i - 2]);
    }
    return res.slice(0, count);
  };

  const fibsList = fib(Math.max(1, Math.min(n, 10)));
  const steps: EvaluationStep[] = [
    { stepNumber: 1, expression: `fibs = 0 : 1 : zipWith (+) fibs (tail fibs)`, description: 'Infinite list definition using corecursion and lazy thunks.' },
    { stepNumber: 2, expression: `take ${n} fibs`, description: `Demand first ${n} elements from the lazy infinite stream.` },
    { stepNumber: 3, expression: `[${fibsList.join(', ')}]`, description: 'Evaluated lazily up to the demanded demand point.' }
  ];

  return {
    output: `[${fibsList.join(', ')}]`,
    explanation: `Lazily evaluated first ${n} Fibonacci numbers from an infinite stream.`,
    steps
  };
};
