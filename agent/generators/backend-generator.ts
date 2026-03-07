import path from 'path';
import { callAI } from '../core/ai-client';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';
import { agentState, ProjectInfo } from '../core/state';
import {
  parseFileBlocks,
  writeFiles,
  readFileSafe,
} from './file-generator';
import {
  SYSTEM_PROMPT_BACKEND_GENERATOR,
  buildBackendPrompt,
} from '../prompts/system-prompts';

export interface BackendGenerationResult {
  feature: string;
  filesWritten: number;
  filePaths: string[];
}

/**
 * Generate backend code for a single feature.
 */
export async function generateBackendFeature(
  feature: string,
  plan: string,
  analysis: string,
  projectInfo: ProjectInfo
): Promise<BackendGenerationResult> {
  const config = getConfig();

  logger.spin(`Generating backend for: ${feature}`);

  const userPrompt = buildBackendPrompt(plan, analysis, feature, projectInfo);

  let response: string;
  try {
    response = await callAI(SYSTEM_PROMPT_BACKEND_GENERATOR, userPrompt, {
      maxTokens: 4096,
      temperature: 0.2,
    });
  } catch (err: any) {
    logger.stopSpinner(undefined, `Backend generation failed: ${err.message}`);
    throw err;
  }

  const files = parseFileBlocks(response);

  logger.stopSpinner(
    `Backend generation done — ${files.length} file(s) for "${feature}"`
  );

  if (files.length === 0) {
    logger.warn('No file blocks found in AI response. Trying fallback parsing…');
    // Attempt raw markdown extraction
    const fallback = extractFilesFromMarkdown(response, projectInfo.backendPath);
    if (fallback.length > 0) {
      files.push(...fallback);
    }
  }

  const written = await writeFiles(files, config.projectRoot);

  return {
    feature,
    filesWritten: written.length,
    filePaths: written.map((f) => f.relativePath),
  };
}

/**
 * Generate ALL backend features in sequence.
 */
export async function generateFullBackend(
  features: string[],
  plan: string,
  analysisPath: string,
  projectInfo: ProjectInfo
): Promise<BackendGenerationResult[]> {
  const analysis = readFileSafe(analysisPath);
  const results: BackendGenerationResult[] = [];

  // Core feature first, then the rest
  const ordered = prioritiseFeatures(features);

  for (const feature of ordered) {
    try {
      logger.info(`Backend → ${feature}`);
      const result = await generateBackendFeature(
        feature,
        plan,
        analysis,
        projectInfo
      );
      results.push(result);
    } catch (err: any) {
      logger.error(`Skipped backend for "${feature}": ${err.message}`);
      agentState.addError(`Backend gen failed for ${feature}: ${err.message}`);
    }
  }

  return results;
}

/**
 * Generate package installation commands for the backend.
 */
export async function generateBackendDeps(projectInfo: ProjectInfo): Promise<string[]> {
  const config = getConfig();
  const backendPkgPath = path.join(config.projectRoot, projectInfo.backendPath, 'package.json');
  const existing = readFileSafe(backendPkgPath);

  if (!existing) return [];

  const pkg = JSON.parse(existing);
  const installed = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  });

  // Common packages that might be missing
  const recommended = ['bcryptjs', 'jsonwebtoken', 'joi', 'multer', 'uuid'];
  return recommended.filter((p) => !installed.includes(p));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function prioritiseFeatures(features: string[]): string[] {
  const PRIORITY_KEYWORDS = ['auth', 'user', 'login', 'signup', 'register'];
  const high = features.filter((f) =>
    PRIORITY_KEYWORDS.some((kw) => f.toLowerCase().includes(kw))
  );
  const rest = features.filter((f) => !high.includes(f));
  return [...high, ...rest];
}

/**
 * Fallback: extract TypeScript fenced blocks from AI markdown response
 * when the ===FILE:=== format was not used.
 */
function extractFilesFromMarkdown(
  response: string,
  backendPath: string
): Array<{ relativePath: string; absolutePath: string; content: string; language: string }> {
  const files: Array<{
    relativePath: string;
    absolutePath: string;
    content: string;
    language: string;
  }> = [];

  const HEADING_CODE_REGEX = /###\s+([\w/. -]+)\n```(?:typescript|javascript|ts|js)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = HEADING_CODE_REGEX.exec(response)) !== null) {
    const heading = match[1].trim();
    const content = match[2];
    // Convert heading to a path
    const relPath = path.join(
      backendPath,
      'src',
      heading.replace(/\s+/g, '-').toLowerCase() + '.ts'
    );
    files.push({ relativePath: relPath, absolutePath: '', content, language: 'typescript' });
  }

  return files;
}
