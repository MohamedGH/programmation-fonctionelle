/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  simulateCurrying, 
  simulateFold, 
  simulateMaybeMonad, 
  simulateLazyFibs,
  getLevelMeta,
  ExplanationLevel 
} from './haskellEngine.ts';

test('simulateCurrying computes correct addition across all levels', () => {
  const levels: ExplanationLevel[] = ['beginner', 'practitioner', 'theoretical'];
  for (const lvl of levels) {
    const result = simulateCurrying(3, 4, lvl);
    assert.equal(result.output, '7');
    assert.equal(result.level, lvl);
    assert.ok(result.steps.length > 0);
    assert.ok(result.explanation.length > 10);
  }
});

test('simulateCurrying beginner level uses barista/drink analogy', () => {
  const result = simulateCurrying(2, 5, 'beginner');
  assert.match(result.explanation, /Beginner Intuition/i);
  assert.ok(result.steps.some(s => s.description.includes('machine') || s.description.includes('worker')));
});

test('simulateCurrying theoretical level references Cartesian Closed Categories and STG/PAP', () => {
  const result = simulateCurrying(2, 5, 'theoretical');
  assert.match(result.explanation, /Cartesian Closed/i);
  assert.ok(result.steps.some(s => s.expression.includes('λx')));
});

test('simulateFold handles foldl and foldr with multi-level explanations', () => {
  const foldlRes = simulateFold('foldl', [1, 2, 3], 'beginner');
  assert.equal(foldlRes.output, '6');
  assert.match(foldlRes.explanation, /backpack|piggy/i);

  const foldrTheory = simulateFold('foldr', [1, 2, 3], 'theoretical');
  assert.equal(foldrTheory.output, '6');
  assert.match(foldrTheory.explanation, /Catamorphism|algebra/i);
});

test('simulateMaybeMonad handles Just and Nothing with theoretical level', () => {
  const resJust = simulateMaybeMonad(5, 'theoretical');
  assert.equal(resJust.output, 'Just 20');
  assert.match(resJust.explanation, /endofunctor|natural transformation/i);

  const resNothing = simulateMaybeMonad(null, 'beginner');
  assert.equal(resNothing.output, 'Nothing');
  assert.match(resNothing.explanation, /empty container/i);
});

test('simulateLazyFibs generates correct lazy fibonacci prefix and level notes', () => {
  const resBeg = simulateLazyFibs(5, 'beginner');
  assert.equal(resBeg.output, '[0, 1, 1, 2, 3]');
  assert.match(resBeg.explanation, /Laziness/i);

  const resTheo = simulateLazyFibs(5, 'theoretical');
  assert.match(resTheo.explanation, /Graph Reduction|Thunks/i);
});

test('getLevelMeta returns correct metadata for all three levels', () => {
  const b = getLevelMeta('beginner');
  assert.equal(b.id, 'beginner');
  assert.match(b.title, /Beginner/i);

  const p = getLevelMeta('practitioner');
  assert.equal(p.id, 'practitioner');
  assert.match(p.title, /Practitioner/i);

  const t = getLevelMeta('theoretical');
  assert.equal(t.id, 'theoretical');
  assert.match(t.title, /Under The Hood/i);
});
