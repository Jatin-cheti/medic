import path from 'path';
import fs from 'fs-extra';
import { logger } from '../core/logger';
import { callAI } from '../core/ai-client';
import { getConfig } from '../core/config';
import { agentState, ProjectInfo } from '../core/state';
import {
  listFilesRecursive,
  readFileSafe,
  truncateForContext,
  writeContextFile,
} from '../generators/file-generator';
import { SYSTEM_PROMPT_CODE_ANALYST } from '../prompts/system-prompts';

// File extensions worth reading for analysis
const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.scss', '.css', '.md',
]);

// Max characters of total codebase context sent to AI
// ~4 chars per token; keeping well under the 8k token limit of GitHub Models gpt-4o
const MAX_CONTEXT_CHARS = 18_000;

export interface CodebaseSnapshot {
  totalFiles: number;
  summary: string;
  projectInfo: ProjectInfo;
}

/**
 * Analyse the existing project and return a structured snapshot.
 */
export async function analyzeCodebase(): Promise<CodebaseSnapshot> {
  const config = getConfig();
  const projectRoot = config.projectRoot;

  logger.spin('Scanning project files…');

  const allFiles = listFilesRecursive(projectRoot, ['agent', '.vercel', '.github']);
  const codeFiles = allFiles.filter((f) =>
    CODE_EXTENSIONS.has(path.extname(f).toLowerCase())
  );

  logger.stopSpinner(`Found ${codeFiles.length} code files`);

  // ── Detect project structure ─────────────────────────────────────────────
  const projectInfo = detectProjectStructure(projectRoot, allFiles);

  // ── Build context for AI analysis ───────────────────────────────────────
  const contextChunks: string[] = [];
  let totalChars = 0;

  // Prioritise key files
  const priorityFiles = [
    'package.json',
    'angular/medic/angular.json',
    'angular/medic/src/app/app.routes.ts',
    'angular/medic/src/styles.scss',
    'node/src/index.ts',
    'node/src/routes/auth.ts',
    'node/src/routes/dashboard.ts',
    'node/src/model/index.js',
  ].map((f) => path.join(projectRoot, f));

  const ordered = [
    ...priorityFiles.filter(fs.existsSync),
    ...codeFiles.filter((f) => !priorityFiles.includes(f)),
  ];

  for (const filePath of ordered) {
    if (totalChars >= MAX_CONTEXT_CHARS) break;
    const rel = path.relative(projectRoot, filePath);
    const content = readFileSafe(filePath);
    if (!content.trim()) continue;
    const truncated = truncateForContext(content, 40);
    const chunk = `### ${rel}\n\`\`\`\n${truncated}\n\`\`\``;
    contextChunks.push(chunk);
    totalChars += chunk.length;
  }

  const codebaseContext = contextChunks.join('\n\n');

  // ── AI analysis ──────────────────────────────────────────────────────────
  logger.spin('AI is analysing the codebase…');

  let analysisJson: any = {};
  try {
    const response = await callAI(
      SYSTEM_PROMPT_CODE_ANALYST,
      `Analyse this codebase:\n\n${codebaseContext}`,
      { temperature: 0.1, maxTokens: 2048 }
    );

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysisJson = JSON.parse(jsonMatch[0]);
    }
  } catch (err: any) {
    logger.stopSpinner(undefined, 'AI analysis failed, using static detection');
    analysisJson = buildStaticAnalysis(projectInfo);
  }

  // Merge AI findings into projectInfo
  if (analysisJson.existingFeatures) {
    projectInfo.existingFeatures = analysisJson.existingFeatures;
  }
  if (analysisJson.colorPalette) {
    projectInfo.colorPalette = analysisJson.colorPalette;
  }

  logger.stopSpinner('Codebase analysis complete');

  // ── Save analysis to context dir ─────────────────────────────────────────
  const analysisMd = buildAnalysisMarkdown(projectInfo, analysisJson);
  const analysisPath = await writeContextFile(
    'analysis.md',
    analysisMd,
    config.contextDir
  );
  agentState.setAnalysisPath(analysisPath);
  agentState.setProjectInfo(projectInfo);

  return {
    totalFiles: codeFiles.length,
    summary: codebaseContext.slice(0, 2000),
    projectInfo,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectProjectStructure(
  projectRoot: string,
  allFiles: string[]
): ProjectInfo {
  const rel = (p: string) => path.relative(projectRoot, p).replace(/\\/g, '/');
  const relFiles = allFiles.map(rel);

  const hasAngular = relFiles.some((f) => f.includes('angular.json'));
  const hasReact = relFiles.some(
    (f) => f.includes('App.tsx') || f.includes('src/index.tsx')
  );
  const hasNode = relFiles.some(
    (f) => f.startsWith('node/') && f.endsWith('index.ts')
  );
  const hasMySQL = relFiles.some(
    (f) =>
      f.includes('sequelize') ||
      f.includes('.sequelizerc') ||
      f.includes('migrations/sql')
  );
  const hasMongo = relFiles.some(
    (f) => f.includes('mongoose') || f.includes('migrations/mongo')
  );

  const frontendPath = hasAngular
    ? 'angular/medic'
    : hasReact
    ? 'frontend'
    : '';
  const backendPath = hasNode ? 'node' : 'backend';

  // Detect Angular routes
  const routeFiles = allFiles.filter((f) => f.endsWith('app.routes.ts'));
  const existingRoutes: string[] = [];
  for (const rf of routeFiles) {
    const content = readFileSafe(rf);
    const matches = content.match(/path:\s*['"]([^'"]+)['"]/g) ?? [];
    matches.forEach((m) => {
      const route = m.replace(/path:\s*['"]/, '').replace(/['"]/, '');
      if (route) existingRoutes.push(route);
    });
  }

  // Detect existing Angular components
  const componentFiles = allFiles.filter((f) => f.endsWith('.component.ts'));
  const existingComponents = componentFiles.map((f) =>
    path.basename(f, '.component.ts')
  );

  // Color palette from styles.scss
  const stylesPath = path.join(projectRoot, 'angular/medic/src/styles.scss');
  const stylesContent = readFileSafe(stylesPath);
  const colorPalette: Record<string, string> = {};
  const cssVarMatches = stylesContent.matchAll(/--(\w[\w-]*):\s*(#[0-9a-fA-F]+)/g);
  for (const m of cssVarMatches) {
    colorPalette[m[1]] = m[2];
  }
  if (Object.keys(colorPalette).length === 0) {
    // Defaults from project
    Object.assign(colorPalette, {
      primary: '#154E99',
      'primary-dark': '#0d3a6d',
      secondary: '#7FB5FA',
      light: '#C2DCFF',
      background: '#F0F0F2',
    });
  }

  const databases: ProjectInfo['databases'] = [];
  if (hasMySQL) databases.push('mysql');
  if (hasMongo) databases.push('mongodb');
  if (databases.length === 0) databases.push('none');

  return {
    hasExistingProject: hasAngular || hasReact || hasNode,
    frontendFramework: hasAngular ? 'angular' : hasReact ? 'react' : 'none',
    backendFramework: hasNode ? 'express' : 'none',
    databases,
    colorPalette,
    frontendPath,
    backendPath,
    existingFeatures: [],
    existingRoutes,
    existingComponents,
  };
}

function buildStaticAnalysis(info: ProjectInfo): any {
  return {
    existingFeatures: info.existingComponents.map((c) => c.replace(/-/g, ' ')),
    missingFeatures: [],
    colorPalette: info.colorPalette,
    componentPattern: 'Angular standalone components',
    apiPattern: 'REST / Express router',
    databaseType: info.databases.join('+'),
    authPattern: 'jwt',
    incompleteAreas: [],
  };
}

function buildAnalysisMarkdown(info: ProjectInfo, ai: any): string {
  return `# Codebase Analysis
Generated: ${new Date().toISOString()}

## Project Structure
| Property | Value |
|---|---|
| Frontend | ${info.frontendFramework} (${info.frontendPath}) |
| Backend  | ${info.backendFramework} (${info.backendPath}) |
| Databases | ${info.databases.join(', ')} |
| Has existing project | ${info.hasExistingProject} |

## Existing Features
${(info.existingFeatures || []).map((f) => `- ${f}`).join('\n') || '- (none detected)'}

## Existing Routes
${(info.existingRoutes || []).map((r) => `- /${r}`).join('\n') || '- (none detected)'}

## Existing Components
${(info.existingComponents || []).map((c) => `- ${c}`).join('\n') || '- (none detected)'}

## Color Palette
${Object.entries(info.colorPalette).map(([k, v]) => `- \`--${k}\`: ${v}`).join('\n')}

## AI Analysis
\`\`\`json
${JSON.stringify(ai, null, 2)}
\`\`\`
`;
}
