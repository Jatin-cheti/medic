import OpenAI from 'openai';
import { getConfig } from './config';
import { logger } from './logger';

let _openai: OpenAI | null = null;

// GitHub Models API base URL — OpenAI-compatible, works with a GitHub PAT
// (models:read scope). Supports gpt-4o, claude-3.5-sonnet, gemini-1.5-pro, etc.
// Docs: https://docs.github.com/en/github-models
const COPILOT_BASE_URL = 'https://models.inference.ai.azure.com';

function getOpenAI(): OpenAI {
  if (!_openai) {
    const { githubToken, openaiApiKey } = getConfig();
    if (githubToken) {
      // Use GitHub Copilot — same OpenAI SDK, different base URL + auth
      logger.dim('AI backend: GitHub Models (models.inference.ai.azure.com)');
      _openai = new OpenAI({
        apiKey: githubToken,
        baseURL: COPILOT_BASE_URL,
      });
    } else {
      logger.dim('AI backend: OpenAI direct (api.openai.com)');
      _openai = new OpenAI({ apiKey: openaiApiKey });
    }
  }
  return _openai;
}

export interface AICallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}

// Hard cap: combined system+user prompt must not exceed this many characters.
// GitHub Models 408s when the raw request body is too large.
// 8 000 chars ≈ ~2 000 tokens — well within every supported model's context.
const MAX_COMBINED_PROMPT_CHARS = 8_000;

function capPrompts(systemPrompt: string, userPrompt: string): [string, string] {
  const combined = systemPrompt.length + userPrompt.length;
  if (combined <= MAX_COMBINED_PROMPT_CHARS) return [systemPrompt, userPrompt];

  // Preserve the system prompt; trim the user prompt to whatever remains
  const budget = Math.max(MAX_COMBINED_PROMPT_CHARS - systemPrompt.length, 500);
  const trimmed = userPrompt.slice(0, budget) + '\n…[truncated to fit request limit]';
  return [systemPrompt, trimmed];
}

/**
 * Core AI call wrapper. Returns the full text response.
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: AICallOptions = {}
): Promise<string> {
  const config = getConfig();
  const model = options.model ?? config.model;
  const maxTokens = options.maxTokens ?? config.maxTokens;
  const temperature = options.temperature ?? 0.3;
  const retries = options.retries ?? 2;

  let lastError: Error | null = null;

  // Enforce hard size cap to prevent 408 on GitHub Models
  [systemPrompt, userPrompt] = capPrompts(systemPrompt, userPrompt);

  // Throttle: minimum gap between calls to respect GitHub Models rate limits (15 RPM)
  await sleep(4200);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content?.trim() ?? '';
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        // 429 rate-limit: back off for 65 seconds
        const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
        const delay = isRateLimit ? 65000 : 3000 * (attempt + 1);
        logger.warn(`AI call failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}. Retrying in ${Math.round(delay / 1000)}s…`);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error('AI call failed after retries');
}

/**
 * Stream an AI response and return the full accumulated text.
 * Falls back to non-streaming if streaming fails.
 */
export async function callAIStream(
  systemPrompt: string,
  userPrompt: string,
  options: AICallOptions = {},
  onChunk?: (chunk: string) => void
): Promise<string> {
  const config = getConfig();
  const model = options.model ?? config.model;
  const maxTokens = options.maxTokens ?? config.maxTokens;

  // Enforce hard size cap to prevent 408 on GitHub Models
  [systemPrompt, userPrompt] = capPrompts(systemPrompt, userPrompt);

  try {
    const openai = getOpenAI();
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: maxTokens,
      stream: true,
    });

    let full = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      full += delta;
      if (onChunk && delta) onChunk(delta);
    }
    return full.trim();
  } catch {
    // Fallback to non-streaming
    return callAI(systemPrompt, userPrompt, options);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
