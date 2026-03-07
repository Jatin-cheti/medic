import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { callAI } from '../core/ai-client';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';
import { agentState } from '../core/state';
import {
  parseFileBlocks,
  writeFiles,
  readFileSafe,
} from '../generators/file-generator';
import { SYSTEM_PROMPT_FIX_TESTS, buildFixPrompt } from '../prompts/system-prompts';

export interface TestRunResult {
  passed: boolean;
  output: string;
  exitCode: number;
  failedTests: string[];
}

/**
 * Run a shell command and return the combined stdout + stderr.
 */
export function runCommand(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 120_000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const isWindows = process.platform === 'win32';
    const proc = spawn(isWindows ? 'cmd' : 'sh', [isWindows ? '/c' : '-c', [cmd, ...args].join(' ')], {
      cwd,
      env: { ...process.env },
      timeout: timeoutMs,
    });

    proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    proc.on('error', (err) => {
      resolve({ stdout, stderr: stderr + err.message, exitCode: 1 });
    });
  });
}

/**
 * Run Jest tests in a given directory.
 */
export async function runJestTests(
  testDir: string,
  pattern?: string
): Promise<TestRunResult> {
  logger.spin(`Running tests in ${path.basename(testDir)}…`);

  const args = ['--passWithNoTests', '--forceExit', '--no-coverage'];
  if (pattern) args.push('--testPathPattern', pattern);

  const { stdout, stderr, exitCode } = await runCommand(
    'npx jest',
    args,
    testDir
  );

  const output = stdout + stderr;
  const passed = exitCode === 0;

  // Extract names of failed tests
  const failedTests: string[] = [];
  const failRegex = /✕|✗|FAIL|● (.+)/g;
  let m: RegExpExecArray | null;
  while ((m = failRegex.exec(output)) !== null) {
    if (m[1]) failedTests.push(m[1].trim());
  }

  logger.stopSpinner(
    passed ? `Tests PASSED` : undefined,
    passed ? undefined : `Tests FAILED (${failedTests.length} failing)`
  );

  if (!passed) {
    logger.dim(output.slice(-2000)); // Print tail of output
  }

  return { passed, output, exitCode, failedTests };
}

/**
 * Automatically attempt to fix failing tests using AI.
 * Returns true if tests eventually pass.
 */
export async function autoFixTests(
  testResult: TestRunResult,
  testDir: string,
  sourceFiles: Record<string, string>,
  maxRetries: number
): Promise<boolean> {
  const config = getConfig();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logger.warn(`Auto-fix attempt ${attempt}/${maxRetries}…`);

    const fixPrompt = buildFixPrompt(testResult.output, sourceFiles);

    let fixResponse: string;
    try {
      fixResponse = await callAI(SYSTEM_PROMPT_FIX_TESTS, fixPrompt, {
        temperature: 0.2,
        maxTokens: 3000,
      });
    } catch (err: any) {
      logger.error(`Fix AI call failed: ${err.message}`);
      return false;
    }

    const fixedFiles = parseFileBlocks(fixResponse);
    if (fixedFiles.length === 0) {
      logger.warn('AI produced no file changes. Skipping.');
      break;
    }

    await writeFiles(fixedFiles, config.projectRoot);
    logger.info(`Applied ${fixedFiles.length} fix(es). Re-running tests…`);

    const rerun = await runJestTests(testDir);
    if (rerun.passed) {
      agentState.setTestsPassed(true);
      return true;
    }

    // Update testResult for next iteration
    Object.assign(testResult, rerun);
  }

  return false;
}

/**
 * Install npm dependencies in a directory if node_modules is missing.
 */
export async function ensureDepsInstalled(dir: string): Promise<void> {
  const nmDir = path.join(dir, 'node_modules');
  if (fs.existsSync(nmDir)) return;

  logger.spin(`Installing dependencies in ${path.basename(dir)}…`);
  const { exitCode, stderr } = await runCommand('npm', ['install'], dir, 300_000);
  if (exitCode !== 0) {
    logger.stopSpinner(undefined, `npm install failed: ${stderr.slice(-200)}`);
  } else {
    logger.stopSpinner('Dependencies installed');
  }
}
