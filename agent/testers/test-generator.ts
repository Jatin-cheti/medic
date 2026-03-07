import { callAI } from '../core/ai-client';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';
import { agentState, ProjectInfo } from '../core/state';
import {
  parseFileBlocks,
  writeFiles,
  readFileSafe,
} from '../generators/file-generator';
import {
  SYSTEM_PROMPT_TEST_GENERATOR,
  buildTestPrompt,
} from '../prompts/system-prompts';

export interface TestGenerationResult {
  feature: string;
  testFiles: string[];
}

/**
 * Generate test files for a given feature.
 */
export async function generateTests(
  feature: string,
  plan: string,
  generatedFilePaths: string[]
): Promise<TestGenerationResult> {
  const config = getConfig();
  logger.spin(`Generating tests for: ${feature}`);

  const userPrompt = buildTestPrompt(generatedFilePaths, plan, feature);

  let response: string;
  try {
    response = await callAI(SYSTEM_PROMPT_TEST_GENERATOR, userPrompt, {
      maxTokens: 3000,
      temperature: 0.2,
    });
  } catch (err: any) {
    logger.stopSpinner(undefined, `Test generation failed: ${err.message}`);
    return { feature, testFiles: [] };
  }

  const files = parseFileBlocks(response);
  logger.stopSpinner(`Tests generated: ${files.length} file(s)`);

  const written = await writeFiles(files, config.projectRoot);
  return {
    feature,
    testFiles: written.map((f) => f.relativePath),
  };
}
