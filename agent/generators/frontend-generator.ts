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
  SYSTEM_PROMPT_FRONTEND_GENERATOR,
  buildFrontendPrompt,
} from '../prompts/system-prompts';

export interface FrontendGenerationResult {
  feature: string;
  filesWritten: number;
  filePaths: string[];
}

/**
 * Generate frontend component(s) for a single feature, one feature at a time.
 */
export async function generateFrontendFeature(
  feature: string,
  plan: string,
  analysis: string,
  projectInfo: ProjectInfo,
  uiDesign?: string
): Promise<FrontendGenerationResult> {
  const config = getConfig();

  logger.spin(`Generating frontend for: ${feature}`);

  const userPrompt = buildFrontendPrompt(
    plan,
    analysis,
    feature,
    projectInfo,
    uiDesign
  );

  let response: string;
  try {
    response = await callAI(SYSTEM_PROMPT_FRONTEND_GENERATOR, userPrompt, {
      maxTokens: 4096,
      temperature: 0.25,
    });
  } catch (err: any) {
    logger.stopSpinner(undefined, `Frontend generation failed: ${err.message}`);
    throw err;
  }

  const files = parseFileBlocks(response);
  logger.stopSpinner(
    `Frontend done — ${files.length} file(s) for "${feature}"`
  );

  const written = await writeFiles(files, config.projectRoot);

  return {
    feature,
    filesWritten: written.length,
    filePaths: written.map((f) => f.relativePath),
  };
}

/**
 * Generate ALL frontend features in sequence (iterative approach).
 */
export async function generateFullFrontend(
  features: string[],
  plan: string,
  analysisPath: string,
  projectInfo: ProjectInfo,
  uiDesigns: Record<string, string> = {}
): Promise<FrontendGenerationResult[]> {
  const analysis = readFileSafe(analysisPath);
  const results: FrontendGenerationResult[] = [];

  const ordered = prioritiseFeatures(features);

  for (const feature of ordered) {
    try {
      logger.info(`Frontend → ${feature}`);
      const result = await generateFrontendFeature(
        feature,
        plan,
        analysis,
        projectInfo,
        uiDesigns[feature]
      );
      results.push(result);
    } catch (err: any) {
      logger.error(`Skipped frontend for "${feature}": ${err.message}`);
      agentState.addError(`Frontend gen failed for ${feature}: ${err.message}`);
    }
  }

  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function prioritiseFeatures(features: string[]): string[] {
  const PRIORITY = ['signup', 'login', 'auth', 'register', 'dashboard', 'profile'];
  const high = features.filter((f) =>
    PRIORITY.some((kw) => f.toLowerCase().includes(kw))
  );
  const rest = features.filter((f) => !high.includes(f));
  return [...high, ...rest];
}
