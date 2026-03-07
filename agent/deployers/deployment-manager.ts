import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'child_process';
import { runCommand } from '../testers/test-runner';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';
import { agentState, ProjectInfo } from '../core/state';
import { deployToVercel, buildAngularProd } from './vercel-deployer';
import { deployToRailway } from './railway-deployer';

export interface DeploymentResult {
  frontendUrl: string;
  backendUrl: string;
  success: boolean;
}

/**
 * Full deployment pipeline: build → git push → deploy.
 */
export async function deploy(projectInfo: ProjectInfo): Promise<DeploymentResult> {
  const config = getConfig();
  let frontendUrl = '';
  let backendUrl = '';

  // ── 1. Git commit ────────────────────────────────────────────────────────
  await gitCommitAll(config.projectRoot);

  // ── 2. Push to remote ─────────────────────────────────────────────────
  if (config.gitRemoteUrl) {
    await gitPush(config.projectRoot, config.gitBranch);
  }

  // ── 3. Frontend Build + Vercel ────────────────────────────────────────
  if (projectInfo.frontendPath) {
    const buildOk = await buildAngularProd(projectInfo.frontendPath);
    if (buildOk) {
      frontendUrl = await deployToVercel(projectInfo.frontendPath);
    }
  }

  // ── 4. Backend → Railway ─────────────────────────────────────────────
  if (projectInfo.backendPath) {
    backendUrl = await deployToRailway(projectInfo.backendPath);
  }

  agentState.setDeployedUrls(frontendUrl, backendUrl);

  return {
    frontendUrl,
    backendUrl,
    success: true,
  };
}

/**
 * Test production endpoints after deployment.
 * Returns true if all critical endpoints respond correctly.
 */
export async function testProductionEndpoints(
  backendUrl: string
): Promise<boolean> {
  if (!backendUrl) {
    logger.warn('No backend URL to test.');
    return false;
  }

  const endpoints = [
    { path: '/health', method: 'GET', expectStatus: 200 },
    { path: '/api/auth/ping', method: 'GET', expectStatus: [200, 404] },
  ];

  let allPassed = true;
  for (const ep of endpoints) {
    try {
      logger.spin(`Testing ${ep.method} ${backendUrl}${ep.path}`);
      const res = await axios({ method: ep.method, url: `${backendUrl}${ep.path}`, timeout: 10000 });
      const expected = Array.isArray(ep.expectStatus)
        ? ep.expectStatus
        : [ep.expectStatus];
      if (expected.includes(res.status)) {
        logger.stopSpinner(`${ep.path} → ${res.status} ✔`);
      } else {
        logger.stopSpinner(undefined, `${ep.path} → unexpected status ${res.status}`);
        allPassed = false;
      }
    } catch (err: any) {
      logger.stopSpinner(undefined, `${ep.path} → error: ${err.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

// ── Git helpers ──────────────────────────────────────────────────────────────

async function gitCommitAll(projectRoot: string): Promise<void> {
  logger.spin('Committing generated files…');

  // Check if .git exists
  const gitDir = path.join(projectRoot, '.git');
  if (!fs.existsSync(gitDir)) {
    await runCommand('git init', [], projectRoot);
  }

  await runCommand('git add -A', [], projectRoot);

  const msg = `feat: DevMedic Agent auto-generated code [${new Date().toISOString()}]`;
  try {
    // Use execFileSync to avoid Windows shell quoting issues with spaces in the message
    execFileSync('git', ['commit', '-m', msg], { cwd: projectRoot, stdio: 'pipe' });
    logger.stopSpinner('Changes committed');
  } catch (err: any) {
    const stderr = err?.stderr?.toString() ?? '';
    if (stderr.includes('nothing to commit') || stderr.includes('nothing added to commit')) {
      logger.stopSpinner('Nothing new to commit');
    } else {
      logger.stopSpinner(undefined, `Git commit failed: ${stderr.slice(-200)}`);
    }
  }
}

async function gitPush(projectRoot: string, branch: string): Promise<void> {
  const config = getConfig();

  if (!config.gitRemoteUrl) return;

  logger.spin(`Pushing to ${branch}…`);
  const { exitCode, stderr } = await runCommand(
    'git push origin',
    [branch],
    projectRoot,
    60_000
  );

  if (exitCode !== 0) {
    logger.stopSpinner(undefined, `Git push failed: ${stderr.slice(-200)}`);
  } else {
    logger.stopSpinner('Pushed to remote');
  }
}
