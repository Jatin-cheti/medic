import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env from agent directory
dotenv.config({ path: path.join(__dirname, '../.env') });
// Also attempt root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

export interface AgentConfig {
  githubToken: string;     // Copilot API (preferred)
  openaiApiKey: string;    // Direct OpenAI fallback
  useCopilot: boolean;     // true when githubToken is set
  figmaApiToken: string;
  figmaFileKey: string;
  vercelToken: string;
  railwayToken: string;
  gitRemoteUrl: string;
  gitBranch: string;
  model: string;
  maxTokens: number;
  maxTestRetries: number;
  projectRoot: string;
  agentRoot: string;
  contextDir: string;
}

let _config: AgentConfig | null = null;

export function getConfig(): AgentConfig {
  if (_config) return _config;

  const agentRoot = path.resolve(__dirname, '..');
  const defaultProjectRoot = path.resolve(agentRoot, '..');
  const projectRoot = process.env.PROJECT_ROOT
    ? path.resolve(process.env.PROJECT_ROOT)
    : defaultProjectRoot;

  const githubToken = process.env.GITHUB_TOKEN || '';
  const openaiApiKey = process.env.OPENAI_API_KEY || '';

  _config = {
    githubToken,
    openaiApiKey,
    useCopilot: !!githubToken,
    // Accept both the user's custom name and the standard name
    figmaApiToken: process.env.figma_api_key || process.env.FIGMA_API_TOKEN || '',
    figmaFileKey: process.env.FIGMA_FILE_KEY || '',
    vercelToken: process.env.VERCEL_TOKEN || '',
    railwayToken: process.env.RAILWAY_TOKEN || '',
    gitRemoteUrl: process.env.GIT_REMOTE_URL || '',
    gitBranch: process.env.GIT_BRANCH || 'main',
    model: process.env.AGENT_MODEL || 'gpt-4o',
    maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || '4096', 10),
    maxTestRetries: parseInt(process.env.AGENT_MAX_TEST_RETRIES || '3', 10),
    projectRoot,
    agentRoot,
    contextDir: path.join(agentRoot, 'context'),
  };

  return _config;
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getConfig();
  const errors: string[] = [];

  if (!config.githubToken && !config.openaiApiKey) {
    errors.push(
      'No AI key found. Set GITHUB_TOKEN (recommended — uses GitHub Copilot) ' +
      'or OPENAI_API_KEY in agent/.env.'
    );
  }

  return { valid: errors.length === 0, errors };
}
