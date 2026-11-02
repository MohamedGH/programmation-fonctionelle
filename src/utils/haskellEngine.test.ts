/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateCurrying, simulateFold, simulateMaybeMonad, simulateLazyFibs } from './haskellEngine.ts';

test('simulateCurrying computes correct addition and step count', () => {
  const result = simulateCurrying(3, 4);
  assert.equal(result.output, '7');
  assert.equal(result.steps.length, 4);
});

test('simulateFold handles foldl correctly', () => {
  const result = simulateFold('foldl', [1, 2, 3]);
  assert.equal(result.output, '6');
  assert.ok(result.steps.length > 0);
});

test('simulateFold handles foldr correctly', () => {
  const result = simulateFold('foldr', [1, 2, 3]);
  assert.equal(result.output, '6');
  assert.ok(result.steps.length > 0);
});

test('simulateMaybeMonad handles Just and Nothing', () => {
  const resJust = simulateMaybeMonad(5);
  assert.equal(resJust.output, 'Just 20');

  const resNothing = simulateMaybeMonad(null);
  assert.equal(resNothing.output, 'Nothing');
});

test('simulateLazyFibs generates correct lazy fibonacci prefix', () => {
  const result = simulateLazyFibs(5);
  assert.equal(result.output, '[0, 1, 1, 2, 3]');
});
