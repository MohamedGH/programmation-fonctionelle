/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  parseHaskellScript, 
  evalBinaryOp, 
  parseList, 
  reduceCustomHaskell 
} from './haskellReducer.ts';

test('parseHaskellScript extracts user function definitions and target expression', () => {
  const code = `
-- Custom Haskell code
add :: Int -> Int -> Int
add x y = x + y

result = add 5 10
  `;
  const { functions, targetExpression } = parseHaskellScript(code);
  assert.equal(functions.has('add'), true);
  assert.deepEqual(functions.get('add')!.params, ['x', 'y']);
  assert.equal(functions.get('add')!.body, 'x + y');
  assert.equal(targetExpression, 'add 5 10');
});

test('reduceCustomHaskell performs real step-by-step reduction of user defined function', () => {
  const code = `
add x y = x + y
add 5 10
  `;
  const trace = reduceCustomHaskell(code, 'practitioner');
  assert.equal(trace.output, '15');
  assert.ok(trace.steps.length >= 3);
  // Verify intermediate substitution exists
  assert.ok(trace.steps.some(s => s.expression.includes('5 + 10') || s.expression.includes('15')));
});

test('reduceCustomHaskell handles multi-function composition', () => {
  const code = `
double x = x * 2
double 7
  `;
  const trace = reduceCustomHaskell(code, 'beginner');
  assert.equal(trace.output, '14');
  assert.ok(trace.steps.length >= 2);
  assert.match(trace.explanation, /final answer: 14/i);
});

test('reduceCustomHaskell handles Maybe Monad bind expressions', () => {
  const code = `Just 6 >>= \\x -> Just (x + 4)`;
  const trace = reduceCustomHaskell(code, 'practitioner');
  assert.equal(trace.output, 'Just 10');
  assert.ok(trace.steps.length >= 2);

  const codeNothing = `Nothing >>= \\x -> Just (x * 2)`;
  const traceNothing = reduceCustomHaskell(codeNothing, 'theoretical');
  assert.equal(traceNothing.output, 'Nothing');
  assert.match(traceNothing.steps[1].description, /Left Zero/i);
});

test('reduceCustomHaskell handles foldl on list step-by-step', () => {
  const code = `foldl (+) 0 [1, 2, 3]`;
  const trace = reduceCustomHaskell(code, 'practitioner');
  assert.equal(trace.output, '6');
  assert.ok(trace.steps.length >= 4);
});

test('reduceCustomHaskell tailors explanations to chosen explanation level', () => {
  const code = `add x y = x + y\nadd 2 3`;
  const traceBeg = reduceCustomHaskell(code, 'beginner');
  const traceTheo = reduceCustomHaskell(code, 'theoretical');

  assert.match(traceBeg.steps[1].description, /Applied user function|substituting/i);
  assert.match(traceTheo.steps[1].description, /β-reduction/i);
});
