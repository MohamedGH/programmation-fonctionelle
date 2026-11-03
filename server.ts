import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { reduceCustomHaskell } from './src/utils/haskellReducer.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Gemini client on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.post('/api/haskell/ai-tutor', async (req, res) => {
    try {
      const { prompt, code, context, level } = req.body;
      const explanationLevel = level === 'beginner' || level === 'theoretical' ? level : 'practitioner';
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        const fallbackText = explanationLevel === 'beginner'
          ? `[Beginner Level] Hello! Here is a simple everyday analogy: think of Haskell functions like an assembly line with single stations. To unlock live AI answers, set GEMINI_API_KEY in Settings > Secrets.`
          : explanationLevel === 'theoretical'
          ? `[Under The Hood / Theoretical Level] In GHC and Type Theory, Haskell models computations via Cartesian Closed Categories, System Fc, and the Spineless Tagless G-machine (STG). To unlock live AI answers, set GEMINI_API_KEY in Settings > Secrets.`
          : `[Practitioner Level] In Haskell, types guide implementation. Multi-argument functions are curried by default. To unlock live AI answers, set GEMINI_API_KEY in Settings > Secrets.`;

        return res.json({
          success: true,
          text: fallbackText
        });
      }

      let levelGuideline = '';
      if (explanationLevel === 'beginner') {
        levelGuideline = `EXPLANATION LEVEL: BEGINNER (ELI5).
        - Use vivid, relatable everyday analogies (e.g. coffee machines, postal boxes, backpacks, recipe books).
        - Avoid intimidating academic or category-theoretic jargon.
        - Focus on intuition, high-level purpose, and simple mental models.`;
      } else if (explanationLevel === 'theoretical') {
        levelGuideline = `EXPLANATION LEVEL: THEORETICAL & GHC INTERNALS.
        - Dive deep into Type Theory, Cartesian Closed Categories, Monad Laws, and GHC runtime architecture.
        - Explain STG (Spineless Tagless G-machine), Thunk allocation on heap, WHNF vs Normal Form, and pointer tagging where relevant.
        - Use precise mathematical notation (e.g. λ-calculus, natural transformations, catamorphisms).`;
      } else {
        levelGuideline = `EXPLANATION LEVEL: PRACTITIONER.
        - Focus on idiomatic, production-grade Haskell code.
        - Discuss type signatures, common compiler warnings, space leaks, pattern matching exhaustiveness, and standard library best practices.`;
      }

      const systemInstruction = `You are an expert Haskell educator, functional programming mentor, and master of lazy evaluation, algebraic data types, category theory (Functor/Applicative/Monad), and type systems. 
      The user is studying Haskell in an interactive studio application called LambdaLens.
      ${levelGuideline}
      Provide clear, encouraging, precise explanations with code examples and ASCII/conceptual diagrams when helpful.`;

      const userMessage = `Context: ${context || 'General Haskell question'}
      Target Audience Depth: ${explanationLevel}
      Code snippet:
      \`\`\`haskell
      ${code || '-- no code provided'}
      \`\`\`
      Question / Prompt: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userMessage,
        config: {
          systemInstruction,
        },
      });

      res.json({ success: true, text: response.text || 'No response generated.' });
    } catch (error: any) {
      console.error('Gemini AI Tutor error:', error);
      res.json({ 
        success: true, 
        text: `[AI Tutor Fallback] I encountered an error connecting to Gemini (${error.message || 'API error'}). In Haskell, expressions are evaluated lazily and functions are curried by default.` 
      });
    }
  });

  app.post('/api/haskell/evaluate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { code, level } = req.body;
      const explanationLevel = level === 'beginner' || level === 'theoretical' ? level : 'practitioner';

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid Haskell code provided.' });
      }

      // Always execute the pure mathematical Haskell reducer on the custom user code
      const localTrace = reduceCustomHaskell(code, explanationLevel);

      // If no valid Gemini API key is provided, return the genuine local step-by-step reduction immediately
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || !apiKey.trim() || apiKey.length < 10) {
        return res.json({
          success: true,
          result: localTrace
        });
      }

      let levelDirective = '';
      if (explanationLevel === 'beginner') {
        levelDirective = 'In each step description, explain the evaluation step using plain English and simple analogies (no category theory jargon).';
      } else if (explanationLevel === 'theoretical') {
        levelDirective = 'In each step description, explain the evaluation step using formal reduction mechanics (beta-reduction, STG thunk allocation, WHNF to NF, unboxed operations).';
      } else {
        levelDirective = 'In each step description, explain the evaluation step using idiomatic Haskell terms, type signatures, and substitution rules.';
      }

      const systemInstruction = `You are a real Haskell evaluation engine. Trace the exact user code step-by-step from initial expression to normal form.
      ${levelDirective}
      Provide a JSON response with:
      1. "output": The final evaluated result or type signature / execution result.
      2. "explanation": A concise explanation of how Haskell evaluated this code tailored to ${explanationLevel} level.
      3. "steps": An array of evaluation steps, where each step has "stepNumber", "expression", and "description". Show at least 3-6 clear intermediate reduction steps whenever applicable.
      Return ONLY valid JSON matching this schema:
      {
        "output": string,
        "explanation": string,
        "steps": [{"stepNumber": number, "expression": string, "description": string}]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate and trace this custom Haskell code step-by-step at ${explanationLevel} level:\n\`\`\`haskell\n${code}\n\`\`\``,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      let parsed;
      try {
        parsed = JSON.parse(text);
        if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length < 2) {
          // If Gemini returned a trivial single-step, prefer our detailed local reduction steps
          parsed = localTrace;
        }
      } catch (e) {
        parsed = localTrace;
      }

      parsed.level = explanationLevel;
      res.json({ success: true, result: parsed });
    } catch (error: any) {
      console.error('Haskell evaluation error:', error);
      // Even on error, return the genuine local reduction trace!
      const fallbackTrace = reduceCustomHaskell(req.body?.code || '1 + 1', req.body?.level || 'practitioner');
      res.json({
        success: true,
        result: fallbackTrace
      });
    }
  });

  // Vite middleware setup
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`LambdaLens server running on http://localhost:${port}`);
  });
}

startServer();
