/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvaluationStep, ExplanationLevel, SimulationResult } from './haskellEngine.ts';

interface UserFunction {
  name: string;
  params: string[];
  body: string;
}

export interface CustomReductionTrace extends SimulationResult {
  targetExpression: string;
  detectedFunctions: string[];
}

/**
 * Parses user Haskell code into custom function definitions, type signatures, and the target expression.
 */
export const parseHaskellScript = (code: string): {
  functions: Map<string, UserFunction>;
  targetExpression: string;
} => {
  const lines = code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('--'));

  const functions = new Map<string, UserFunction>();
  let targetExpression = '';

  for (const line of lines) {
    // Skip type signatures e.g. "add :: Int -> Int -> Int"
    if (line.includes('::')) {
      continue;
    }

    // Check for variable assignment or function declaration: name param1 param2 = body
    // Must NOT match operators like >>=, ==, /=, <=, >=
    const defMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_']*(?:\s+[a-zA-Z_][a-zA-Z0-9_']*)*)\s*=\s*(.*)$/);
    if (defMatch && !line.includes('>>=') && !line.includes('==') && !line.includes('/=')) {
      const lhs = defMatch[1].trim();
      const rhs = defMatch[2].trim();
      const parts = lhs.split(/\s+/);
      const funcName = parts[0];
      const params = parts.slice(1);

      if (funcName === 'result' || funcName === 'main' || funcName === 'output') {
        targetExpression = rhs;
      } else {
        functions.set(funcName, {
          name: funcName,
          params,
          body: rhs,
        });
      }
    } else {
      // Line without definition '=' is treated as the executable expression
      targetExpression = line;
    }
  }

  // If no explicit expression found, try finding a call or the last defined function with sample arguments
  if (!targetExpression) {
    if (functions.has('result')) {
      targetExpression = functions.get('result')!.body;
    } else if (functions.size > 0) {
      // Pick the last user function and construct a sensible call
      const lastFunc = Array.from(functions.values())[functions.size - 1];
      if (lastFunc.params.length === 0) {
        targetExpression = lastFunc.name;
      } else if (lastFunc.params.length === 1) {
        targetExpression = `${lastFunc.name} 5`;
      } else if (lastFunc.params.length === 2) {
        targetExpression = `${lastFunc.name} 3 4`;
      } else {
        targetExpression = `${lastFunc.name} ${lastFunc.params.map((_, i) => (i + 1) * 2).join(' ')}`;
      }
    } else {
      targetExpression = '2 + 3 * 4';
    }
  }

  return { functions, targetExpression };
};

/**
 * Safely evaluates simple mathematical expressions (respecting operator precedence)
 */
export const evaluateSimpleMath = (expr: string): number | null => {
  const sanitized = expr.replace(/\s+/g, '');
  if (!/^[0-9+\-*/().]+$/.test(sanitized)) {
    return null;
  }
  try {
    // Using Function safely strictly for clean digits and operators
    const fn = new Function(`return (${sanitized});`);
    const val = fn();
    return typeof val === 'number' && !isNaN(val) ? val : null;
  } catch {
    return null;
  }
};

/**
 * Evaluates binary operator application: (+), (-), (*), (/), (`div`), (==), (>), (<)
 */
export const evalBinaryOp = (op: string, a: string, b: string): string | null => {
  const numA = Number(a);
  const numB = Number(b);

  if (!isNaN(numA) && !isNaN(numB)) {
    switch (op) {
      case '+': return String(numA + numB);
      case '-': return String(numA - numB);
      case '*': return String(numA * numB);
      case '/': return String(numA / numB);
      case 'div':
      case '`div`': return String(Math.floor(numA / numB));
      case 'mod':
      case '`mod`': return String(numA % numB);
      case '==': return numA === numB ? 'True' : 'False';
      case '/=': return numA !== numB ? 'True' : 'False';
      case '>': return numA > numB ? 'True' : 'False';
      case '<': return numA < numB ? 'True' : 'False';
      case '>=': return numA >= numB ? 'True' : 'False';
      case '<=': return numA <= numB ? 'True' : 'False';
    }
  }

  if (op === '++') {
    // List concatenation
    if (a.startsWith('[') && a.endsWith(']') && b.startsWith('[') && b.endsWith(']')) {
      const itemsA = parseList(a);
      const itemsB = parseList(b);
      return `[${[...itemsA, ...itemsB].join(', ')}]`;
    }
  }

  return null;
};

/**
 * Helper: parse a Haskell list string e.g. "[1, 2, 3]" into string items
 */
export const parseList = (listStr: string): string[] => {
  const trimmed = listStr.trim();
  if (trimmed === '[]') return [];
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    // Split by comma ignoring nested brackets
    const items: string[] = [];
    let depth = 0;
    let current = '';
    for (const char of inner) {
      if (char === '[' || char === '(') depth++;
      else if (char === ']' || char === ')') depth--;
      else if (char === ',' && depth === 0) {
        items.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }
    if (current.trim()) items.push(current.trim());
    return items;
  }
  return [];
};

/**
 * Extracts a function call respecting balanced parentheses for arguments.
 * Searches innermost occurrences first (right-to-left) to properly evaluate sub-calls.
 */
export const extractFunctionCall = (
  expr: string,
  funcName: string,
  paramCount: number
): { fullMatch: string; args: string[]; startIndex: number } | null => {
  const regex = new RegExp(`\\b${funcName}\\b`, 'g');
  let match: RegExpExecArray | null;
  const matches: { index: number }[] = [];

  while ((match = regex.exec(expr)) !== null) {
    matches.push({ index: match.index });
  }

  // Check innermost first (right-to-left)
  for (let m = matches.length - 1; m >= 0; m--) {
    const startIndex = matches[m].index;
    let i = startIndex + funcName.length;

    // Skip whitespace
    while (i < expr.length && /\s/.test(expr[i])) i++;

    const args: string[] = [];
    while (args.length < paramCount && i < expr.length) {
      if (expr[i] === '(') {
        let depth = 0;
        const startArg = i;
        while (i < expr.length) {
          if (expr[i] === '(') depth++;
          else if (expr[i] === ')') {
            depth--;
            if (depth === 0) {
              i++;
              break;
            }
          }
          i++;
        }
        args.push(expr.slice(startArg, i).trim());
      } else if (expr[i] === '[') {
        let depth = 0;
        const startArg = i;
        while (i < expr.length) {
          if (expr[i] === '[') depth++;
          else if (expr[i] === ']') {
            depth--;
            if (depth === 0) {
              i++;
              break;
            }
          }
          i++;
        }
        args.push(expr.slice(startArg, i).trim());
      } else {
        const tokenMatch = expr.slice(i).match(/^([0-9a-zA-Z_'.]+)/);
        if (tokenMatch) {
          args.push(tokenMatch[1]);
          i += tokenMatch[1].length;
        } else {
          break;
        }
      }
      while (i < expr.length && /\s/.test(expr[i])) i++;
    }

    if (args.length === paramCount) {
      const fullMatch = expr.slice(startIndex, i).trim();
      return { fullMatch, args, startIndex };
    }
  }

  return null;
};

/**
 * Pure step-by-step reduction of custom user Haskell code
 */
export const reduceCustomHaskell = (
  code: string,
  level: ExplanationLevel = 'practitioner'
): CustomReductionTrace => {
  const { functions, targetExpression } = parseHaskellScript(code);
  const steps: EvaluationStep[] = [];
  const detectedFunctions = Array.from(functions.keys());

  let current = targetExpression;
  let stepCount = 1;
  const maxSteps = 20;

  // Step 1: Initial expression
  steps.push({
    stepNumber: stepCount++,
    expression: current,
    description: level === 'beginner'
      ? `Starting with our main question: "${current}".`
      : level === 'theoretical'
      ? `Initial AST Term in System Fc: ${current}`
      : `Initial expression to evaluate: ${current}`
  });

  // Iterative reduction loop
  let changed = true;
  while (changed && stepCount <= maxSteps) {
    changed = false;

    // Pattern 1: Maybe Monad Chaining with >>=
    // e.g., Just 5 >>= \x -> Just (x * 2)  or Nothing >>= ...
    const bindMatch = current.match(/^(Just\s+([0-9a-zA-Z_]+)|Nothing)\s*>>=\s*(.*)$/);
    if (bindMatch) {
      const monadicVal = bindMatch[1].trim();
      const lambdaOrFunc = bindMatch[3].trim();

      if (monadicVal === 'Nothing') {
        current = 'Nothing';
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? 'Encountered Nothing (an empty box). The monad short-circuits safely.'
            : level === 'theoretical'
            ? 'Monad Left Zero Law: Nothing >>= f ≡ Nothing. Computation terminates.'
            : 'Maybe monad propagates Nothing; subsequent binds are skipped.'
        });
        break;
      } else {
        const val = bindMatch[2].trim();
        // Check if lambda \var -> body
        const lambdaMatch = lambdaOrFunc.match(/^\\([a-zA-Z_]+)\s*->\s*(.*)$/);
        if (lambdaMatch) {
          const varName = lambdaMatch[1];
          const lambdaBody = lambdaMatch[2];
          // Substitute
          const substituted = lambdaBody.replace(new RegExp(`\\b${varName}\\b`, 'g'), val);
          current = substituted;
          steps.push({
            stepNumber: stepCount++,
            expression: current,
            description: level === 'beginner'
              ? `Unwrapped ${val} from its Just box, and plugged it into the recipe: \\${varName} -> ...`
              : level === 'theoretical'
              ? `Monad bind: extracted value ${val} and performed β-reduction on lambda abstraction.`
              : `Bound ${val} to ${varName} in ${lambdaBody}.`
          });
          changed = true;
          continue;
        }
      }
    }

    // Pattern 2: List Operations (map, filter, foldl, foldr, take, sum)
    // 2a. map f [x, y, z]
    const mapMatch = current.match(/^map\s+([a-zA-Z0-9_()+\-*/]+)\s+(\[[^\]]*\])$/);
    if (mapMatch) {
      const fn = mapMatch[1];
      const items = parseList(mapMatch[2]);
      if (items.length === 0) {
        current = '[]';
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: 'map over empty list [] evaluates to [].'
        });
        break;
      } else {
        const first = items[0];
        const rest = items.slice(1);
        const nextExpr = rest.length > 0
          ? `(${fn} ${first}) : map ${fn} [${rest.join(', ')}]`
          : `[${fn} ${first}]`;

        current = nextExpr;
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? `Map applies "${fn}" to the first item (${first}) and keeps going on the rest.`
            : level === 'theoretical'
            ? `Functor fmap definition: fmap f (x:xs) = f x : fmap f xs.`
            : `Unrolled map: apply ${fn} to ${first} and recurse on remainder.`
        });
        changed = true;
        continue;
      }
    }

    // 2b. foldl f acc [x, y, z]
    const foldlMatch = current.match(/^foldl\s+([a-zA-Z0-9_()+\-*/]+)\s+([a-zA-Z0-9_]+)\s+(\[[^\]]*\])$/);
    if (foldlMatch) {
      const fn = foldlMatch[1];
      const acc = foldlMatch[2];
      const items = parseList(foldlMatch[3]);
      if (items.length === 0) {
        current = acc;
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: `foldl on empty list returns base accumulator: ${acc}.`
        });
        break;
      } else {
        const first = items[0];
        const rest = items.slice(1);
        const op = fn.replace(/[()]/g, '');
        const reducedAcc = evalBinaryOp(op, acc, first) || `(${fn} ${acc} ${first})`;
        current = rest.length > 0 ? `foldl ${fn} ${reducedAcc} [${rest.join(', ')}]` : reducedAcc;
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? `Left fold combines accumulator (${acc}) with item (${first}) from the left.`
            : level === 'theoretical'
            ? `Tail-recursive step: foldl f (f z x) xs. Accumulator updated to ${reducedAcc}.`
            : `Combined accumulator: ${acc} and ${first} -> ${reducedAcc}.`
        });
        changed = true;
        continue;
      }
    }

    // 2c. foldr f z [x, y, z]
    const foldrMatch = current.match(/^foldr\s+([a-zA-Z0-9_()+\-*/]+)\s+([a-zA-Z0-9_]+)\s+(\[[^\]]*\])$/);
    if (foldrMatch) {
      const fn = foldrMatch[1];
      const z = foldrMatch[2];
      const items = parseList(foldrMatch[3]);
      if (items.length === 0) {
        current = z;
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: `foldr base case reached: returns ${z}.`
        });
        break;
      } else {
        const first = items[0];
        const rest = items.slice(1);
        current = `${first} ${fn} (foldr ${fn} ${z} [${rest.join(', ')}])`;
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? `Right fold replaces the list spine: item ${first} combined with the folded tail.`
            : level === 'theoretical'
            ? `Catamorphism expansion: cata(x : xs) = f x (cata xs).`
            : `Expanded foldr on element ${first}.`
        });
        changed = true;
        continue;
      }
    }

    // 2d. take n [items]
    const takeMatch = current.match(/^take\s+([0-9]+)\s+(\[[^\]]*\])$/);
    if (takeMatch) {
      const n = Number(takeMatch[1]);
      const items = parseList(takeMatch[2]);
      const taken = items.slice(0, n);
      current = `[${taken.join(', ')}]`;
      steps.push({
        stepNumber: stepCount++,
        expression: current,
        description: `take ${n} demanded and extracted ${taken.length} elements from list.`
      });
      break;
    }

    // Pattern 3: User Defined Functions (innermost call first with balanced parentheses)
    let userFuncReduced = false;
    for (const [name, userFunc] of functions.entries()) {
      const call = extractFunctionCall(current, name, userFunc.params.length);
      if (call) {
        let substituted = userFunc.body;
        userFunc.params.forEach((param, idx) => {
          substituted = substituted.replace(new RegExp(`\\b${param}\\b`, 'g'), call.args[idx]);
        });

        // Replace the exact call in current expression
        const before = current.slice(0, call.startIndex);
        const after = current.slice(call.startIndex + call.fullMatch.length);
        current = `${before}${substituted}${after}`.trim();

        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? `Applied user function "${name}" with (${call.args.join(', ')}) -> ${substituted}.`
            : level === 'theoretical'
            ? `β-reduction on "${name}": substituted [${userFunc.params.join(', ')} ↦ ${call.args.join(', ')}].`
            : `Expanded ${name} ${call.args.join(' ')} -> ${substituted}.`
        });

        changed = true;
        userFuncReduced = true;
        break;
      }
    }
    if (userFuncReduced) continue;

    // Pattern 4: Simple Parenthesized Arithmetic Reduction: e.g. (3 + 4) or 5 + 10 or 2 * 6
    const parensMathMatch = current.match(/\(([0-9]+)\s*([+\-*/])\s*([0-9]+)\)/);
    if (parensMathMatch) {
      const res = evalBinaryOp(parensMathMatch[2], parensMathMatch[1], parensMathMatch[3]);
      if (res !== null) {
        current = current.replace(parensMathMatch[0], res);
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? `Calculated inside parentheses: ${parensMathMatch[1]} ${parensMathMatch[2]} ${parensMathMatch[3]} = ${res}.`
            : level === 'theoretical'
            ? `Primitive GHC machine instruction: (#${parensMathMatch[2]} ${parensMathMatch[1]}# ${parensMathMatch[2]}#) ⟹ ${res}#.`
            : `Evaluated sub-expression (${parensMathMatch[1]} ${parensMathMatch[2]} ${parensMathMatch[3]}) = ${res}.`
        });
        changed = true;
        continue;
      }
    }

    // Pattern 5: Plain Arithmetic Reduction: e.g. 5 + 10 or 3 * 4
    const plainMathMatch = current.match(/([0-9]+)\s*([+\-*/])\s*([0-9]+)/);
    if (plainMathMatch) {
      const res = evalBinaryOp(plainMathMatch[2], plainMathMatch[1], plainMathMatch[3]);
      if (res !== null) {
        current = current.replace(plainMathMatch[0], res);
        steps.push({
          stepNumber: stepCount++,
          expression: current,
          description: level === 'beginner'
            ? `Arithmetic: ${plainMathMatch[1]} ${plainMathMatch[2]} ${plainMathMatch[3]} equals ${res}.`
            : level === 'theoretical'
            ? `Unboxed primitive ALU operation: ${plainMathMatch[1]} ${plainMathMatch[2]} ${plainMathMatch[3]} = ${res}.`
            : `Evaluated ${plainMathMatch[1]} ${plainMathMatch[2]} ${plainMathMatch[3]} -> ${res}.`
        });
        changed = true;
        continue;
      }
    }

    // Pattern 6: Final check if simple math expression remains
    const mathVal = evaluateSimpleMath(current);
    if (mathVal !== null && String(mathVal) !== current) {
      current = String(mathVal);
      steps.push({
        stepNumber: stepCount++,
        expression: current,
        description: 'Reduced remaining arithmetic to Normal Form (NF).'
      });
      break;
    }

    // No further pattern matched
    break;
  }

  // Final Output
  const output = current;
  let explanation = '';
  if (level === 'beginner') {
    explanation = `Evaluation finished! Your custom code successfully reduced in ${steps.length} clear steps to the final answer: ${output}.`;
  } else if (level === 'theoretical') {
    explanation = `Evaluation complete in ${steps.length} β/δ reduction steps. The term has reached Weak Head Normal Form / Normal Form (NF): ${output}.`;
  } else {
    explanation = `Step-by-step reduction of your custom Haskell code produced ${output} across ${steps.length} evaluation stages.`;
  }

  return {
    targetExpression,
    output,
    explanation,
    steps,
    level,
    detectedFunctions
  };
};
