import { callAI } from '../core/ai-client';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';
import { agentState } from '../core/state';
import { writeContextFile, readFileSafe } from '../generators/file-generator';
import {
  SYSTEM_PROMPT_PLANNER,
  SYSTEM_PROMPT_ARCHITECTURE,
  buildPlanningPrompt,
} from '../prompts/system-prompts';

/**
 * Step 2: Convert high-level requirement into a detailed engineering plan.
 * Saves plan.md to context dir and returns the plan text.
 */
export async function generatePlan(
  requirement: string,
  existingAnalysis?: string
): Promise<string> {
  const config = getConfig();
  const spinner = logger.spin('AI is generating the engineering plan…');

  const userPrompt = buildPlanningPrompt(requirement, existingAnalysis);

  let plan: string;
  try {
    plan = await callAI(SYSTEM_PROMPT_PLANNER, userPrompt, {
      maxTokens: 3000,
      temperature: 0.4,
    });
  } catch (err: any) {
    logger.stopSpinner(undefined, `Planning failed: ${err.message}`);
    throw err;
  }

  logger.stopSpinner('Engineering plan generated');

  const planWithHeader = `# Development Plan\n\nRequirement: ${requirement}\n\nGenerated: ${new Date().toISOString()}\n\n---\n\n${plan}`;
  const planPath = await writeContextFile('plan.md', planWithHeader, config.contextDir);
  agentState.setPlanPath(planPath);

  return plan;
}

/**
 * Determine the tech stack for a project from scratch (Case B – no existing project).
 */
export async function determineArchitecture(
  requirement: string
): Promise<{ frontend: string; backend: string; databases: string[] }> {
  logger.spin('AI is selecting the tech stack…');

  const userPrompt = `Project requirement: ${requirement}\nNo existing codebase – choose the optimal stack.`;

  let result = { frontend: 'angular', backend: 'express', databases: ['mysql', 'mongodb'] };

  try {
    const response = await callAI(SYSTEM_PROMPT_ARCHITECTURE, userPrompt, {
      temperature: 0.1,
      maxTokens: 512,
    });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result = {
        frontend: parsed.frontend || 'angular',
        backend: parsed.backend || 'express',
        databases: parsed.databases || ['mysql'],
      };
    }
  } catch {
    logger.stopSpinner(undefined, 'Stack selection failed, using defaults');
  }

  logger.stopSpinner(`Stack: ${result.frontend} + ${result.backend} + ${result.databases.join(', ')}`);

  // Save architecture to context
  const config = getConfig();
  const archMd = `# Architecture Decision\n\n- **Frontend:** ${result.frontend}\n- **Backend:** ${result.backend}\n- **Databases:** ${result.databases.join(', ')}\n\nGenerated: ${new Date().toISOString()}\n`;
  const archPath = await writeContextFile('architecture.md', archMd, config.contextDir);
  agentState.setArchitecturePath(archPath);

  return result;
}

/**
 * Extract the list of features from a plan markdown.
 */
export function extractFeatureList(planContent: string): string[] {
  const lines = planContent.split('\n');
  const features: string[] = [];
  let inFeatureSection = false;

  for (const line of lines) {
    if (/##\s*1\.\s*Feature List/i.test(line)) {
      inFeatureSection = true;
      continue;
    }
    if (inFeatureSection && /^##/.test(line)) break;
    if (inFeatureSection && /^[-*•]\s+/.test(line.trim())) {
      const feature = line.trim().replace(/^[-*•]\s+/, '').trim();
      if (feature) features.push(feature);
    }
  }

  // Fallback: generic features
  if (features.length === 0) {
    return [
      'User Authentication (Signup / Login)',
      'User Dashboard',
      'Profile Management',
      'Core Domain Feature',
    ];
  }

  return features;
}
