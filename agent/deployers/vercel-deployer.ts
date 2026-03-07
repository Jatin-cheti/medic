import path from 'path';
import { runCommand } from '../testers/test-runner';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';
import { agentState } from '../core/state';

/**
 * Deploy frontend to Vercel.
 * Requires VERCEL_TOKEN in env.
 */
export async function deployToVercel(frontendPath: string): Promise<string> {
  const config = getConfig();

  if (!config.vercelToken) {
    logger.warn('VERCEL_TOKEN not set — skipping Vercel deployment.');
    return '';
  }

  const absPath = path.resolve(config.projectRoot, frontendPath);
  logger.deploy('Deploying frontend to Vercel…');

  const { stdout, stderr, exitCode } = await runCommand(
    'npx vercel',
    ['--prod', '--yes', `--token=${config.vercelToken}`],
    absPath,
    180_000
  );

  if (exitCode !== 0) {
    logger.error(`Vercel deploy failed:\n${stderr.slice(-500)}`);
    return '';
  }

  // Extract deployment URL from output
  const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app[^\s]*/);
  const url = urlMatch ? urlMatch[0] : '';

  if (url) {
    logger.success(`Frontend deployed: ${url}`);
  }

  return url;
}

/**
 * Build the Angular project for production.
 */
export async function buildAngularProd(frontendPath: string): Promise<boolean> {
  const config = getConfig();
  const absPath = path.resolve(config.projectRoot, frontendPath);

  logger.spin('Building Angular production bundle…');

  const { exitCode, stderr } = await runCommand(
    'npx ng build',
    ['--configuration=production'],
    absPath,
    300_000
  );

  if (exitCode !== 0) {
    logger.stopSpinner(undefined, `Angular build failed:\n${stderr.slice(-500)}`);
    return false;
  }

  logger.stopSpinner('Angular build successful');
  return true;
}
