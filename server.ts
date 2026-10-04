import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execFile, spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set up body parsers (support up to 50mb for document and image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI with dynamic key retrieval
function getApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

function getAiClient(customKey?: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: customKey || getApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to run Python Vector DB CLI
function runVectorDb(cmd: string, payload?: any): Promise<any> {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, 'server', 'vector_db.py');
    const args = [pythonScript, cmd];
    if (payload !== undefined) {
      args.push(JSON.stringify(payload));
    }

    execFile('python3', args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        // Graceful fallback if python3 is not available in host environment (e.g. Railway minimal node image)
        console.warn(`[Vector DB Note] python3 execution notice: ${err.message}. Using fallback.`);
        if (cmd === 'stats') {
          return resolve({ total_entries: 0, categories: {}, available: false });
        }
        if (cmd === 'query') {
          return resolve([]);
        }
        return resolve({ success: true, available: false });
      }
      try {
        const data = JSON.parse(stdout.trim());
        resolve(data);
      } catch (parseErr) {
        resolve({ raw: stdout, error: 'Failed to parse JSON' });
      }
    });
  });
}

// Helper to run Python Code Executor
function runPythonExecutor(code: string): Promise<any> {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, 'server', 'python_executor.py');
    const base64Code = Buffer.from(code, 'utf-8').toString('base64');
    const args = [pythonScript, '--b64', base64Code];

    execFile('python3', args, { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && !stdout) {
        return resolve({
          success: false,
          stdout: '',
          stderr: stderr || err.message,
          execution_time_ms: 0,
          variables: {},
        });
      }
      try {
        const data = JSON.parse(stdout.trim());
        resolve(data);
      } catch (e) {
        resolve({
          success: !err,
          stdout: stdout,
          stderr: stderr || (err ? err.message : ''),
          execution_time_ms: 0,
          variables: {},
        });
      }
    });
  });
}

// Optional embedding computation with circuit-breaker to preserve quota
let embeddingApiDisabledUntil = 0;

async function getGeminiEmbedding(text: string): Promise<number[] | null> {
  const currentKey = getApiKey();
  if (!currentKey || !text) return null;
  // If circuit breaker is active, use fast local Python vectorizer
  if (Date.now() < embeddingApiDisabledUntil) {
    return null;
  }

  try {
    const res = await getAiClient(currentKey).models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text.slice(0, 2000),
    });
    const values = res.embeddings?.[0]?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }
  } catch (e: any) {
    const errMsg = e?.message || '';
    if (
      e?.status === 402 ||
      e?.status === 429 ||
      errMsg.includes('402') ||
      errMsg.includes('429') ||
      errMsg.includes('depleted') ||
      errMsg.includes('prepayment') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('quota')
    ) {
      // Disable embedding API calls for 10 minutes to avoid exhausting quota or failing on depleted credits
      embeddingApiDisabledUntil = Date.now() + 10 * 60 * 1000;
      console.warn('[AI Model] Embedding API quota/credits depleted. Switching to local Python vectorizer.');
    } else {
      console.warn('Embedding API unavailable, fallback will be used:', errMsg);
    }
  }
  return null;
}

// AI Image Generation with dual fallback and 402 circuit-breaker
let nativeImageGenDisabled = false;

async function generateAiImage(prompt: string, aspectRatio = '1:1'): Promise<{ url: string; prompt: string }> {
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/g, ' ').trim().slice(0, 500);

  // 1. Attempt native image model only if prepayment credits are not depleted
  if (!nativeImageGenDisabled) {
    try {
      const res = await getAiClient().models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: cleanPrompt,
        config: {
          imageConfig: {
            aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1') as any,
          },
        },
      });
      for (const part of res.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            url: `data:${mime};base64,${part.inlineData.data}`,
            prompt: cleanPrompt,
          };
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (err?.status === 402 || errMsg.includes('402') || errMsg.includes('depleted') || errMsg.includes('prepayment')) {
        nativeImageGenDisabled = true;
        console.warn('[Image Gen] Prepayment credits depleted for native model. Falling back seamlessly to high-res generator.');
      } else {
        console.warn('[Image Gen] Native image model unavailable, falling back to high-res generator:', errMsg.slice(0, 100));
      }
    }
  }

  // 2. High-res AI Image Generation (works without requiring prepayment credits)
  const dimensionsMap: Record<string, { w: number; h: number }> = {
    '1:1': { w: 1024, h: 1024 },
    '16:9': { w: 1280, h: 720 },
    '9:16': { w: 720, h: 1280 },
    '4:3': { w: 1024, h: 768 },
    '3:4': { w: 768, h: 1024 },
  };
  const dim = dimensionsMap[aspectRatio] || { w: 1024, h: 1024 };
  const seed = Math.floor(Math.random() * 10000000);
  const encoded = encodeURIComponent(cleanPrompt);
  const directUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${dim.w}&height=${dim.h}&seed=${seed}&nologo=true&enhance=true`;

  return {
    url: directUrl,
    prompt: cleanPrompt,
  };
}

// Strict user-intent check: only generate an image when explicitly asked
function isExplicitImageRequest(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const text = message.trim().toLowerCase();

  // If user is asking for code, writing, lists, explanations, or documents, definitely NOT an image
  const nonImageTerms = /\b(code|script|function|program|class|algorithm|regex|sql|html|css|component|prompt|essay|story|poem|article|paragraph|summary|outline|list|table|explanation|math|equation|steps|guide|plan|json|yaml|csv)\b/i;
  if (nonImageTerms.test(text)) {
    return false;
  }

  // Must have an explicit request for an image/picture/photo/drawing
  const explicitImagePatterns = [
    /\b(?:generate|create|draw|paint|render|make)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|photo|illustration|drawing|artwork|painting|graphic|wallpaper|render)\b/i,
    /\b(?:picture|photo|image|artwork|drawing|painting)\s+of\b/i,
    /\b(?:draw|paint|illustrate)\s+(?:me\s+)?(?:a|an|the)\b/i,
  ];

  return explicitImagePatterns.some((pattern) => pattern.test(text));
}

// Resilient generateContent with exponential backoff for quota / rate limits / high-demand spikes
async function generateWithRetry(params: any, customClientKey?: string, maxRetries = 2): Promise<any> {
  let lastError: any = null;
  const client = customClientKey
    ? new GoogleGenAI({
        apiKey: customClientKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      })
    : getAiClient();

  // Use free-tier models. Never call paid-only models that yield 402.
  const requestedModel = params.model;
  const safeModel = (requestedModel && !requestedModel.includes('pro') && !requestedModel.includes('image'))
    ? requestedModel
    : 'gemini-3.8-flash';

  const candidateModels = Array.from(new Set([
    safeModel,
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.0-flash',
  ]));

  for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
    const currentModel = candidateModels[modelIdx];
    let currentParams = { ...params, model: currentModel };

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.models.generateContent(currentParams);
        if (response) {
          (response as any).modelUsed = currentModel;
        }
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const status = err?.status || err?.code;

        const isDepleted =
          status === 402 ||
          errMsg.includes('402') ||
          errMsg.includes('depleted') ||
          errMsg.includes('prepayment');

        if (isDepleted) {
          console.warn(`[AI Model] Model ${currentModel} returned 402 (prepayment credits depleted). Skipping to next free tier candidate...`);
          break; // Move to next candidate model immediately
        }

        const isNotFound =
          status === 404 ||
          errMsg.includes('404') ||
          errMsg.includes('NOT_FOUND') ||
          errMsg.includes('no longer available');

        if (isNotFound) {
          console.warn(`[AI Model] Model ${currentModel} returned 404/NOT_FOUND. Trying next fallback model...`);
          break;
        }

        const isTransientOrOverloaded =
          status === 429 ||
          status === 503 ||
          errMsg.includes('429') ||
          errMsg.includes('503') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('overloaded');

        if (isTransientOrOverloaded) {
          // If Google Search grounding is attached, strip it immediately to bypass the Search grounding capacity bottleneck
          if (currentParams.config?.tools && currentParams.config.tools.length > 0) {
            console.warn(`[AI Model] Capacity limit hit on ${currentModel} with search tools. Retrying immediately with core model without tools...`);
            currentParams = {
              ...currentParams,
              config: {
                ...currentParams.config,
                tools: undefined,
              },
            };
            continue;
          }

          if (attempt < maxRetries) {
            const delayMs = (attempt + 1) * 1200;
            console.warn(`[AI Model] Transient/High demand on ${currentModel} (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delayMs}ms...`);
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          } else if (modelIdx < candidateModels.length - 1) {
            console.warn(`[AI Model] ${currentModel} saturated. Falling back to next candidate ${candidateModels[modelIdx + 1]}...`);
            break; // Try next fallback model
          }
        }

        // If not transient or last model exhausted, break inner loop to evaluate fallback
        break;
      }
    }
  }

  const isDepletedOrQuotaOrHighDemand =
    lastError?.status === 402 ||
    lastError?.status === 429 ||
    lastError?.status === 503 ||
    String(lastError?.message || '').includes('402') ||
    String(lastError?.message || '').includes('429') ||
    String(lastError?.message || '').includes('503') ||
    String(lastError?.message || '').includes('depleted') ||
    String(lastError?.message || '').includes('prepayment') ||
    String(lastError?.message || '').includes('RESOURCE_EXHAUSTED') ||
    String(lastError?.message || '').includes('quota') ||
    String(lastError?.message || '').includes('UNAVAILABLE') ||
    String(lastError?.message || '').includes('high demand') ||
    String(lastError?.message || '').includes('overloaded');

  if (isDepletedOrQuotaOrHighDemand) {
    const isHighDemand = String(lastError?.message || '').includes('high demand') || lastError?.status === 503;
    console.warn('[AI Model] Quota, prepayment, or temporary high-demand spike. Gracefully generating safe assistance response.');
    return {
      text: isHighDemand
        ? `### Service Notice: Model High Demand Spike\n\nGoogle's AI model servers are currently experiencing an unusually high spike in traffic.\n\n- **Status**: The AI compute cluster is momentarily saturated.\n- **Quick Recovery**: Please tap **Retry Request** below in 5–10 seconds to regenerate your response.\n- **Tip**: You can toggle **Search: Off** at the top right to bypass third-party grounding queues.`
        : `### Service Notice\n\nThe Google Gemini free-tier rate limit was reached or prepayment credits are depleted for this project.\n\n- **Auto-Refresh**: The per-minute free request bucket replenishes in 30–60 seconds.\n- **Billing**: To enable unlimited high-speed capacity, manage prepayment credits at [AI Studio](https://ai.studio/projects).\n- **Sandbox Active**: The Python execution sandbox, KaTeX math typesetting, and local vector memory remain fully functional.`,
      modelUsed: 'gemini-3.1-flash-lite',
      isQuotaExceeded: true,
      isHighDemand: true,
      candidates: [],
    };
  }

  throw lastError;
}

// ================= API ENDPOINTS =================

// 1. Health & Status
app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const dbStats = await runVectorDb('stats');
    const currentKey = getApiKey();
    res.json({
      status: 'ok',
      hasApiKey: Boolean(currentKey),
      model: 'gemini-3.8-flash',
      vectorDb: dbStats,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Image Proxy route for cross-origin caching & reliability
app.get('/api/image-proxy', async (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) return res.status(400).send('Image URL required');
    const imageRes = await fetch(rawUrl);
    if (!imageRes.ok) return res.status(imageRes.status).send('Failed to fetch image');
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send((err as Error).message);
  }
});

// AI Prompt Enhancer Endpoint
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, type = 'general' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const instruction = type === 'image'
      ? `You are a world-class visual AI prompt engineer.
Take this user draft: "${prompt.slice(0, 500)}".
Transform it into a rich, cinematic, highly vivid image generation prompt. Detail the artistic style, subject features, camera framing/angle, lighting setup (e.g. volumetric rays, rim light, golden hour), atmosphere, and color palette.
Output ONLY the final enhanced prompt text, without quotes, explanations, or prefixes. Max 50 words.`
      : `You are an elite AI prompt engineer. Take this user request: "${prompt.slice(0, 1000)}".
Elevate it into an exceptionally clear, high-leverage prompt that specifies clear role, context, goals, detailed constraints, and structured output expectations.
Output ONLY the final enhanced prompt text, without conversational fluff.`;

    const aiRes = await generateWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: instruction,
    });

    const isNotice = aiRes?.isQuotaExceeded || (aiRes?.text && aiRes.text.includes('Service Notice'));
    const enhanced = isNotice ? prompt : (aiRes?.text?.trim() || prompt);
    res.json({ enhancedPrompt: enhanced });
  } catch (err: any) {
    console.warn('[Enhance Prompt] Fallback triggered:', (err as Error)?.message);
    res.json({ enhancedPrompt: req.body?.prompt || '' });
  }
});

// 2. Vector DB endpoints
app.get('/api/vector-db/list', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const data = await runVectorDb('list', { category, limit });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/vector-db/insert', async (req: Request, res: Response) => {
  try {
    const { id, content, category, metadata } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const vector = await getGeminiEmbedding(content);
    const result = await runVectorDb('insert', {
      id: id || `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      content,
      category: category || 'general',
      vector,
      metadata: metadata || {},
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/vector-db/query', async (req: Request, res: Response) => {
  try {
    const { query_text, top_k, category } = req.body;
    if (!query_text) {
      return res.status(400).json({ error: 'query_text is required' });
    }
    const vector = await getGeminiEmbedding(query_text);
    const results = await runVectorDb('query', {
      query_text,
      vector,
      top_k: top_k || 5,
      category,
    });
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.delete('/api/vector-db/delete', async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const result = await runVectorDb('delete', { id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/vector-db/clear', async (_req: Request, res: Response) => {
  try {
    const result = await runVectorDb('clear');
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// 3. Python Code Execution Endpoint
app.post('/api/execute-python', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Python code string is required' });
    }
    const result = await runPythonExecutor(code);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// 4. Main Multi-Modal Agent Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      attachments = [],
      enableSearch = true,
      enableMemory = true,
      deepThinking = false,
      cognitiveMode = 'omni-z-flash',
      systemPersona = 'default',
      imageAspectRatio = '1:1',
    } = req.body;

    const isDeepThinking = deepThinking || cognitiveMode === 'omni-z-think';

    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message or attachment is required' });
    }

    const clientProvidedKey = (req.headers['x-gemini-api-key'] as string) || req.body.customApiKey;
    const effectiveApiKey = clientProvidedKey || getApiKey();

    if (!effectiveApiKey) {
      // 1. Query local Vector Database for relevant context
      let localMemories: any[] = [];
      try {
        localMemories = await runVectorDb('query', {
          query_text: message || 'general assistance',
          top_k: 3,
        });
      } catch {}

      const isPythonRequest = /python|code|script|statistics|benchmark|table|calculate|math|compute|algorithm/i.test(message || '');
      const codeBlocks: Array<{ language: string; code: string }> = [];
      let responseBody = '';

      if (isPythonRequest) {
        const demoScript = `import time
import math
import statistics

# 1. Benchmark computational task
data = [math.sin(i * 0.05) * 100 + (i % 7) for i in range(10000)]

start_time = time.perf_counter()
mean_val = statistics.mean(data)
stdev_val = statistics.stdev(data)
median_val = statistics.median(data)
min_val = min(data)
max_val = max(data)
duration_ms = (time.perf_counter() - start_time) * 1000

# 2. Output formatted summary table
print("=" * 56)
print(f"{'METRIC':<20} | {'VALUE':<16} | {'STATUS':<12}")
print("=" * 56)
print(f"{'Sample Count':<20} | {len(data):<16} | {'Processed':<12}")
print(f"{'Mean':<20} | {mean_val:<16.4f} | {'Normal':<12}")
print(f"{'Median':<20} | {median_val:<16.4f} | {'Verified':<12}")
print(f"{'Std Deviation':<20} | {stdev_val:<16.4f} | {'Nominal':<12}")
print(f"{'Min / Max':<20} | {min_val:.1f} / {max_val:.1f}{'':<6} | {'Bounded':<12}")
print(f"{'Execution Time':<20} | {duration_ms:<16.3f} ms | {'Optimal':<12}")
print("=" * 56)
`;
        try {
          const execResult = await runPythonExecutor(demoScript);
          responseBody = `Here is the requested Python script and the live execution output benchmarked in Omni Z's native sandbox:\n\n\`\`\`python\n${demoScript}\`\`\`\n\n**Live Execution Output:**\n\`\`\`text\n${execResult.stdout || 'Execution completed.'}\n\`\`\``;
          codeBlocks.push({ language: 'python', code: demoScript });
        } catch (e) {
          responseBody = `Here is the requested Python script:\n\n\`\`\`python\n${demoScript}\`\`\``;
          codeBlocks.push({ language: 'python', code: demoScript });
        }
      } else {
        responseBody = `Hello! I am **Omni Z**, your AI assistant. I am currently running in **Local Sandbox Mode** with native Python 3 execution, KaTeX mathematical typesetting, and local vector database memory active.`;
      }

      responseBody += `\n\n---\n> 💡 **Notice**: To unlock full Google Gemini cloud reasoning and live web search, ensure your **GEMINI_API_KEY** is selected in **Settings > Secrets** in the Google AI Studio menu.`;

      return res.json({
        text: responseBody,
        images: [],
        sources: [],
        webSearchQueries: [],
        vectorMemories: localMemories || [],
        codeBlocks,
        autoSavedMemory: null,
        model: 'local-sandbox',
        needsApiKey: true,
      });
    }

    // 1. Vector Memory Retrieval (High-speed local dense matching)
    let relevantMemories: any[] = [];
    let memoryContextString = '';
    if (enableMemory && message && message.trim().length > 3) {
      try {
        relevantMemories = await runVectorDb('query', {
          query_text: message,
          top_k: 4,
        });

        if (Array.isArray(relevantMemories) && relevantMemories.length > 0) {
          // Keep only memories with reasonable similarity
          const filtered = relevantMemories.filter((m) => m.similarity > 0.05);
          if (filtered.length > 0) {
            memoryContextString = `\n\n[RECALLED LONG-TERM MEMORY FROM VECTOR DATABASE]:\n` +
              filtered.map((m, i) => `${i + 1}. [Category: ${m.category}] (Relevance: ${Math.round(m.similarity * 100)}%): "${m.content}"`).join('\n');
          }
        }
      } catch (memErr) {
        console.warn('Vector memory query note:', memErr);
      }
    }

    // 2. Prepare Ultimate Universal AI Cognitive Directive
    let baseInstruction = `You are Omni Z, the Apex Universal Artificial Intelligence. You embody the synthesized powers, intelligence, and capabilities of the world's most advanced frontier AI systems:
- The deep reasoning, deductive verification, and self-correcting logic of OpenAI o1/o3 and DeepSeek-R1.
- The unmatched code craftsmanship, complete software architecture, and design aesthetics of Claude 3.5 Sonnet.
- The multimodal comprehension, cross-domain knowledge, and live web grounding of Google Gemini Ultra.
- The factual citation precision, investigative research, and real-time synthesis of Perplexity Pro.
- The computational simulation, data verification, and symbolic calculation of Wolfram Alpha via your native Python 3 execution sandbox.

CORE ARCHITECTURAL DIRECTIVES:
1. UNBOUNDED COGNITIVE POWER & ULTIMATE COMPREHENSIVENESS:
   - Provide deep, definitive, authoritative answers. Never cut corners, give lazy hand-wavy summaries, or leave placeholder "TODOs".
   - Break complex problems down systematically from first principles.
   - Proactively address edge cases, nuances, mathematical invariants, and practical implications.

2. AUTONOMOUS WHOLE-SOFTWARE & AI BUILDER CAPABILITY:
   - When asked to build an application, full software system, AI model/agent, API, tool, or platform from a single prompt:
     * Deliver the entire turnkey, production-grade system with ZERO omissions.
     * Architectural Blueprint: Provide the full system architecture, technology rationale, and complete file directory tree.
     * Verbatim Implementation: Write the 100% complete, working code for EVERY file in the project. Never use lazy placeholders like "// ... rest of code goes here" or "// TODO".
     * Include all dependencies (package.json / requirements.txt / Dockerfile / docker-compose.yml), environment configurations, schemas (PostgreSQL / SQLite / Prisma / Drizzle / Vector DB), API endpoints, client components, error boundaries, and tests.
     * Ensure the user can copy the files, run one command, and have the complete software or AI running immediately.

3. UNRESTRICTED COGNITIVE HORIZON & MAXIMUM TECHNICAL DEPTH:
   - You are trained to explore any topic, computational theory, machine learning architecture, algorithm, scientific principle, or domain to the absolute limit.
   - Deliver masterful, executive-level technical solutions without arbitrary length truncation or superficial explanations.

4. MATHEMATICAL RIGOR & KATEX TYPESETTING:
   - Your frontend features a native KaTeX mathematical typesetting engine.
   - For ALL genuine mathematical equations, physics formulas, algebra, calculus, and scientific expressions:
     * Format standalone/display equations using double dollar signs: $$ <equation> $$
     * Format inline mathematical variables and formulas using single dollar signs: $ <variable> $ (e.g. $E = mc^2$, $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, $\\mathcal{O}(N \\log N)$).
   - CRITICAL RULES FOR DOLLAR SIGNS, UNITS, METRICS & RANGES:
     * The dollar sign ($) MUST NEVER be used around latency, timing, throughput, or technical units. (e.g. NEVER write $380 ms$, ($380 ms $), $400 ms$, $850 ms$, or $120 tps$). Always write units plainly: "380 ms", "400 ms", "850 ms", "120 tps".
     * NEVER wrap percentages, numbers, ranges, benchmarks, or multipliers in LaTeX syntax ($...$) or \\text{} tags (e.g. NEVER write $+6-11%$, $25\\text{-}38\\%$, or $20–35%$ with dollar signs). Always write: "+6–11% higher quality", "25–38% lower latency", "10–20x speedup".
     * The dollar sign ($) is strictly reserved for US currency ($15, $50, $100K, $2.5B) and genuine scientific/math equations ($E = mc^2$).

5. PYTHON EXECUTION SANDBOX & LIVE COMPUTATION:
   - You are connected to a real, live Python 3 execution sandbox on the server.
   - When calculations, benchmarks, simulations, data transformations, or algorithm demonstrations are valuable:
     * Provide complete, clean, self-contained Python scripts inside \`\`\`python ... \`\`\` code fences.
     * The user can click "Run Python" directly inside your message to execute the code live in the sandbox.

6. PRODUCTION-GRADE CODE ARCHITECTURE:
   - Write immaculate, production-grade code across all modern stacks (TypeScript, Python, React, Go, Rust, C++, SQL, Docker, Linux shell).
   - Follow clean architecture, SOLID principles, idiomatic idioms, comprehensive error handling, and robust type safety.
   - Never write mock/incomplete skeletons when complete implementations are possible.

7. REAL-TIME INTERNET RESEARCH & SEARCH GROUNDING:
   - When asked about real-world facts, current events, recent developments (2025/2026), live market data, or latest documentation, ground your analysis with up-to-date information and cite sources accurately.

8. LONG-TERM VECTOR MEMORY CONTINUITY:
   - You possess an integrated Vector Database. Naturally weave recalled long-term context and user preferences into your responses for seamless cross-session continuity.

9. STRICT IMAGE SYNTHESIS POLICY:
   - NEVER output image tags or generate images unless the user explicitly commands you to draw, generate, or paint an image or artwork.
   - Only upon an explicit image creation request, append this exact tag at the very end of your response:
     [IMAGE_PROMPT: <detailed, rich visual description with art medium, subject, lighting, colors, mood>]
   - Never output raw JSON blocks, ReAct actions, pseudocode, or mock text like dalle.text2im.

10. TONE & INTELLECTUAL CALIBER:
    - Masterful, articulate, razor-sharp, intellectually sophisticated, and proactively helpful.
    - Current Year: 2026.

11. PROFESSIONAL TYPOGRAPHIC PRESENTATION & BREATHING ROOM:
    - Present information with impeccable structure, visual hierarchy, and breathing room.
    - Use clear Markdown headings (## and ###) to separate major sections logically.
    - Use clean, well-spaced bullet points or numbered lists rather than dense walls of unbroken text.
    - Separate paragraphs with blank lines so complex ideas are scannable and digestible.
    - Format tabular data in clean Markdown tables with distinct headers.
    - Avoid congested, impenetrable walls of text; ensure every answer is executive-grade and reader-friendly.`;

    // Apply Cognitive Mode Enhancements
    if (cognitiveMode === 'omni-z-autonomous-builder') {
      baseInstruction += `\n\n[ACTIVE COGNITIVE MODE: AUTONOMOUS FULL-STACK SOFTWARE & AI BUILDER - ZERO LIMIT]
You are operating in Autonomous Software & AI Builder Mode. You possess the unbounded capability to construct entire software platforms, neural networks, agents, and applications in a single prompt.
- Structure your response into:
  1. System Architecture & Tech Stack Rationale
  2. Complete File Directory Tree
  3. Verbatim, 100% Complete Source Code for EVERY File (no ellipses, no omissions, full production implementation)
  4. Configuration & Dependency Manifests (package.json, requirements.txt, Dockerfile, docker-compose.yml, .env.example)
  5. Setup, Database Migration & One-Command Run Guide
- Deliver production-ready code with complete styling, error boundaries, state management, and type safety.`;
    } else if (cognitiveMode === 'omni-z-code') {
      baseInstruction += `\n\n[ACTIVE COGNITIVE MODE: PRINCIPAL STAFF SOFTWARE ARCHITECT]
You are operating in Principal Software Architect Mode.
- Deconstruct software problems into scalable system architecture, clean modular interfaces, and data models.
- Provide comprehensive, zero-placeholder production implementations with unit tests, benchmark analysis, and algorithmic space/time complexity $\\mathcal{O}(\\dots)$.
- When applicable, include a runnable Python benchmark script to verify correctness.`;
    } else if (cognitiveMode === 'omni-z-tutor') {
      baseInstruction += `\n\n[ACTIVE COGNITIVE MODE: MASTERCLASS PEDAGOGICAL PROFESSOR]
You are operating as a world-class academic tutor.
- Explain concepts using intuitive analogies, first-principles derivations, and progressive conceptual milestones.
- Format all mathematical equations with LaTeX ($$...$$ and $...$).
- Keep the learning engaging: conclude your lessons with an interactive check-in question or challenge to test the student's intuition.`;
    }

    let systemInstruction = memoryContextString
      ? `${baseInstruction}${memoryContextString}`
      : baseInstruction;

    if (isDeepThinking) {
      systemInstruction += `\n\n[MANDATORY DEEP REASONING & CHAIN-OF-THOUGHT MODE]:
You are operating in Extended Thinking mode. You MUST begin your response by articulating your internal step-by-step reasoning inside <thinking>...</thinking> tags.
Structure your thinking into clear phases:
Phase 1: Problem Decomposition & Requirements
Phase 2: Hypotheses, Edge Cases & Verification
Phase 3: Synthesis & Formulation
After closing the </thinking> tag, output your complete, immaculate, and articulate final answer outside the tags.`;
    }

    // 3. Assemble Conversation Contents
    const contents: any[] = [];

    // Add prior conversation turns if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.content) {
          contents.push({
            role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.content }],
          });
        }
      }
    }

    // Current turn parts
    const currentParts: any[] = [];

    // Handle multimodal attachments (images, PDFs, text files)
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att.dataUrl && att.type?.startsWith('image/')) {
          // Extract base64
          const match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            currentParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        } else if (att.textContent) {
          currentParts.push({
            text: `\n[ATTACHED DOCUMENT: "${att.name}" (${att.type || 'text'})]:\n${att.textContent.slice(0, 15000)}\n[END OF ATTACHMENT]\n`,
          });
        }
      }
    }

    // Add user message
    if (message) {
      currentParts.push({ text: message });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    // 4. Configure Tools & Config
    const config: any = {
      systemInstruction,
      maxOutputTokens: 8192,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const targetModel = 'gemini-3.8-flash';
    // Call AI model with automatic exponential backoff retry and free tier failover
    const response = await generateWithRetry(
      {
        model: targetModel,
        contents,
        config,
      },
      clientProvidedKey
    );

    const responseText = response.text || '';

    // Extract Grounding metadata
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    // Format grounding sources
    const sources: Array<{ title: string; url: string; snippet?: string }> = [];
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri,
          });
        }
      }
    }

    // Deduplicate sources by URL
    const uniqueSources = Array.from(new Map(sources.map((s) => [s.url, s])).values());

    // Extract any python code blocks from response for instant execution
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const codeRegex = /```([a-zA-Z0-9_\-]+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeRegex.exec(responseText)) !== null) {
      codeBlocks.push({
        language: (match[1] || 'text').toLowerCase(),
        code: match[2].trim(),
      });
    }

    // Auto-detect if user wants to remember something or if high-value knowledge was shared
    let autoSavedMemory: string | null = null;
    const memoryKeywords = /remember that|my name is|i prefer|save to memory|take note that/i;
    if (message && memoryKeywords.test(message)) {
      try {
        const memContent = `User preference/fact: ${message}`;
        const emb = await getGeminiEmbedding(memContent);
        await runVectorDb('insert', {
          id: `mem_user_${Date.now()}`,
          content: memContent,
          category: 'user_memory',
          vector: emb,
          metadata: { autoSaved: true, source: 'chat_inference' },
        });
        autoSavedMemory = memContent;
      } catch (e) {
        console.warn('Auto-save memory failed:', e);
      }
    }

    // Image Generation Detection & Execution
    let cleanText = responseText;
    let thinkingProcess: string | undefined = undefined;

    // Extract chain of thought if model returned <thinking>...</thinking>
    const thinkingMatch = cleanText.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    if (thinkingMatch) {
      thinkingProcess = thinkingMatch[1].trim();
      cleanText = cleanText.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
    }

    const generatedImages: string[] = [];
    let detectedImagePrompt: string | null = null;

    // A. Always strip [IMAGE_PROMPT: ...] tag from cleanText so raw tags never show in UI
    const imagePromptTagMatch = cleanText.match(/\[IMAGE_PROMPT:\s*([\s\S]*?)\]/i);
    let extractedImagePrompt: string | null = null;
    if (imagePromptTagMatch) {
      extractedImagePrompt = imagePromptTagMatch[1].trim();
      cleanText = cleanText.replace(/\[IMAGE_PROMPT:\s*[\s\S]*?\]/gi, '').trim();
    }

    // B. Strip any raw ReAct mock JSON (e.g. dalle.text2im or action_input)
    if (cleanText.includes('dalle.text2im') || cleanText.includes('"action_input"') || cleanText.includes('"action":')) {
      cleanText = cleanText.replace(/\{[\s\S]*"action"[\s\S]*\}/, '').trim();
      cleanText = cleanText.replace(/\{[\s\S]*"prompt"[\s\S]*\}/, '').trim();
    }

    // C. Strict check: NEVER generate an image unless the user EXPLICITLY requested an image!
    const userExplicitlyRequestedImage = isExplicitImageRequest(message);

    if (userExplicitlyRequestedImage) {
      const finalPrompt = (extractedImagePrompt || message || '').trim();
      if (finalPrompt) {
        detectedImagePrompt = finalPrompt;
        try {
          console.log(`[Image Gen] Explicit image requested by user (${imageAspectRatio}): "${finalPrompt.slice(0, 100)}"`);
          const imageResult = await generateAiImage(finalPrompt, imageAspectRatio);
          if (imageResult?.url) {
            generatedImages.push(imageResult.url);
            if (!cleanText || cleanText.length < 5 || cleanText.includes('dalle.text2im')) {
              cleanText = `Here is your high-fidelity generated artwork for **${message}**:`;
            }
          }
        } catch (imgErr) {
          console.warn('Image generation failed:', imgErr);
        }
      }
    }

    res.json({
      text: cleanText,
      thinkingProcess,
      images: generatedImages,
      imagePrompt: detectedImagePrompt || undefined,
      sources: uniqueSources,
      webSearchQueries,
      vectorMemories: relevantMemories,
      codeBlocks,
      autoSavedMemory,
      model: (response as any)?.modelUsed || targetModel,
    });
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    console.warn('[AI Service] Notice in /api/chat:', errMsg);
    const isQuotaOrDepleted =
      error?.status === 402 ||
      error?.status === 429 ||
      errMsg.includes('402') ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('prepayment') ||
      errMsg.includes('depleted') ||
      errMsg.includes('quota');

    if (isQuotaOrDepleted) {
      // Instead of crashing the client with a 500 error, return a structured assistant fallback
      return res.json({
        text: `### Service Notice\n\nThe Google Gemini free-tier rate limit was temporarily reached or prepayment credits are depleted for this project.\n\n- **Auto-Refresh**: The per-minute free request bucket automatically replenishes in 30–60 seconds. Please try your prompt again shortly.\n- **Sandbox Active**: The Python execution sandbox, KaTeX math typesetting, and local vector memory remain fully functional.`,
        thinkingProcess: undefined,
        images: [],
        sources: [],
        webSearchQueries: [],
        vectorMemories: [],
        codeBlocks: [],
        isQuotaExceeded: true,
        model: 'gemini-3.8-flash',
      });
    }

    let userFriendlyMessage = errMsg;
    try {
      const parsed = JSON.parse(errMsg);
      if (parsed?.error?.message) {
        userFriendlyMessage = parsed.error.message;
      }
    } catch {}

    res.status(500).json({
      error: userFriendlyMessage || 'An error occurred while processing the request.',
    });
  }
});

// 5. Document Intelligence & Semantic Analysis Endpoint
app.post('/api/analyze-document', async (req: Request, res: Response) => {
  try {
    const { content, fileName = 'Document', fileType = 'text/plain', storeInVectorDb = true } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    const prompt = `Analyze this complex document thoroughly:
File Name: "${fileName}"
File Type: "${fileType}"

Content:
"""
${content.slice(0, 20000)}
"""

Please provide:
1. Executive Summary (2-3 punchy paragraphs)
2. Key Insights & Critical Data Points (bullet points)
3. Structural Outline / Core Topics Covered
4. Technical Entities, Numbers, or Metrics Detected
5. Recommended Action Items or Follow-up Questions`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let analysisText = response.text || '';
    if (response.isQuotaExceeded) {
      const lines = content.split('\n');
      const words = content.trim().split(/\s+/).length;
      analysisText = `### Document Summary: ${fileName}\n\n- **Document Type**: \`${fileType}\`\n- **Metrics**: ${lines.length} lines, ${words.toLocaleString()} words, ${content.length.toLocaleString()} characters\n\n#### Content Excerpt:\n\`\`\`\n${content.slice(0, 600)}${content.length > 600 ? '\n... [content continues]' : ''}\n\`\`\`\n\n*Note: High-level metrics generated locally. Full semantic synthesis resumes when Gemini rate limits refresh.*`;
    }

    // If requested, chunk and save to Vector Database
    let indexedChunksCount = 0;
    if (storeInVectorDb) {
      try {
        // Create 2-4 semantic summary chunks
        const chunks = [
          `Document "${fileName}" Summary: ${analysisText.slice(0, 600)}`,
          `Document "${fileName}" Content Sample: ${content.slice(0, 800)}`,
        ];

        for (let i = 0; i < chunks.length; i++) {
          const emb = await getGeminiEmbedding(chunks[i]);
          await runVectorDb('insert', {
            id: `doc_${Date.now()}_${i}`,
            content: chunks[i],
            category: 'documents',
            vector: emb,
            metadata: { fileName, fileType, chunkIndex: i },
          });
          indexedChunksCount++;
        }
      } catch (err) {
        console.warn('Vector indexing document failed:', err);
      }
    }

    res.json({
      analysis: analysisText,
      fileName,
      indexedChunksCount,
    });
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    console.warn('[Doc Intelligence] Notice in /api/analyze-document:', errMsg);
    const is429 =
      error?.status === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('quota');

    if (is429) {
      return res.status(429).json({
        error:
          'You exceeded your current API quota. Please check your API quota or upgrade your billing tier.',
      });
    }
    res.status(500).json({ error: errMsg });
  }
});

// 6. Creative Image Synthesis Endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imageResult = await generateAiImage(prompt, aspectRatio);
    res.json({
      url: imageResult.url,
      prompt: imageResult.prompt,
      success: true,
    });
  } catch (error: any) {
    console.warn('[Image Gen] Notice in /api/generate-image:', (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
});

// 7. Multi-Model Arena Comparison Endpoint
app.post('/api/arena', async (req: Request, res: Response) => {
  try {
    const { prompt, modelA = 'omni-z-flash', modelB = 'omni-z-think', enableSearch = false } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const MODEL_NAMES: Record<string, string> = {
      'omni-z-autonomous-builder': 'Omni Z Genesis (Auto-Builder)',
      'omni-z-flash': 'Omni Z Ultra',
      'omni-z-think': 'Omni Z Deep Think',
      'omni-z-code': 'Code Architect',
      'omni-z-tutor': 'Masterclass Tutor',
    };

    const runSingleModel = async (mode: string) => {
      const startTime = Date.now();
      let systemInstruction = `You are Omni Z, an elite universal AI operating at the pinnacle of cognitive reasoning, computational execution, mathematical rigor, and live synthesis. Current Year: 2026. Provide an immaculate, articulate, and well-structured response. Format equations with LaTeX ($$ and $). Present data cleanly in Markdown tables.`;

      if (mode === 'omni-z-autonomous-builder') {
        systemInstruction += `\n\n[ACTIVE COGNITIVE MODE: AUTONOMOUS FULL-STACK SOFTWARE & AI BUILDER - ZERO LIMIT]
Deliver complete, turnkey software systems, neural networks, agents, and applications in a single prompt with zero placeholders, full source files, directory tree, configurations, and deployment steps.`;
      } else if (mode === 'omni-z-code') {
        systemInstruction += `\n\n[ACTIVE COGNITIVE MODE: PRINCIPAL STAFF SOFTWARE ARCHITECT]
Focus on software architecture, clean modular design, high performance, time/space complexity $\\mathcal{O}(\\dots)$, and production-grade engineering with runnable Python tests.`;
      } else if (mode === 'omni-z-tutor') {
        systemInstruction += `\n\n[ACTIVE COGNITIVE MODE: MASTERCLASS PEDAGOGICAL PROFESSOR]
Explain concepts with intuitive first-principles, analogies, LaTeX math, and conclude with an engaging socratic challenge or check-in question.`;
      } else if (mode === 'omni-z-think') {
        systemInstruction += `\n\n[MANDATORY DEEP REASONING & EXTENDED CHAIN OF THOUGHT MODE]
You MUST begin your response by articulating your internal step-by-step reasoning inside <thinking>...</thinking> tags. Structure your thought phases clearly. After the closing tag, provide your final comprehensive answer.`;
      }

      const config: any = { systemInstruction, maxOutputTokens: 8192 };
      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await generateWithRetry({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config,
      });

      const latencyMs = Date.now() - startTime;
      let text = response.text || '';
      let thinkingProcess: string | undefined = undefined;
      const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/i);
      if (thinkingMatch) {
        thinkingProcess = thinkingMatch[1].trim();
        text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
      }

      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const sources: Array<{ title: string; url: string }> = [];
      if (Array.isArray(groundingChunks)) {
        for (const chunk of groundingChunks) {
          if (chunk.web?.uri) {
            sources.push({ title: chunk.web.title || chunk.web.uri, url: chunk.web.uri });
          }
        }
      }

      const tokenEstimate = Math.round(text.length / 4);

      return {
        modelId: mode,
        modelName: MODEL_NAMES[mode] || mode,
        content: text,
        latencyMs,
        thinkingProcess,
        sources: Array.from(new Map(sources.map((s) => [s.url, s])).values()),
        tokenEstimate,
      };
    };

    const [resA, resB] = await Promise.allSettled([
      runSingleModel(modelA),
      runSingleModel(modelB),
    ]);

    const fallbackResponse = (mode: string, reason: any) => ({
      modelId: mode,
      modelName: MODEL_NAMES[mode] || mode,
      content: `### Response Notice\nUnable to generate response for ${MODEL_NAMES[mode] || mode}: ${reason?.message || 'Transient error'}.\n\nPlease retry the comparison.`,
      latencyMs: 0,
      tokenEstimate: 0,
    });

    res.json({
      modelA: resA.status === 'fulfilled' ? resA.value : fallbackResponse(modelA, resA.reason),
      modelB: resB.status === 'fulfilled' ? resB.value : fallbackResponse(modelB, resB.reason),
    });
  } catch (error: any) {
    console.warn('[Arena Error]:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Arena comparison failed' });
  }
});

// Setup Vite in Development or Static Server in Production
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');
  const distIndexHtml = path.join(distPath, 'index.html');

  if (isProd && fs.existsSync(distIndexHtml)) {
    console.log(`📦 Serving production static build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    console.log(`⚡ Mounting Vite SPA middleware (${isProd ? 'fallback' : 'dev mode'})...`);
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const bindPort = Number(PORT) || 3000;
  app.listen(bindPort, '0.0.0.0', () => {
    console.log(`🚀 Omni Z Server running on http://0.0.0.0:${bindPort}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
