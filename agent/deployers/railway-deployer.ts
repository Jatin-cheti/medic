import path from 'path';
import { runCommand } from '../testers/test-runner';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';

/**
 * Deploy backend to Railway.
 * Requires RAILWAY_TOKEN in env.
 */
export async function deployToRailway(backendPath: string): Promise<string> {
  const config = getConfig();

  if (!config.railwayToken) {
    logger.warn('RAILWAY_TOKEN not set — skipping Railway deployment.');
    return '';
  }

  const absPath = path.resolve(config.projectRoot, backendPath);
  logger.deploy('Deploying backend to Railway…');

  // Ensure token is in the current process env so the spawned CLI picks it up
  process.env.RAILWAY_TOKEN = config.railwayToken;

  const { stdout, stderr, exitCode } = await runCommand(
    'npx railway up',
    ['--detach'],
    absPath,
    180_000
  );

  if (exitCode !== 0) {
    logger.error(`Railway deploy failed:\n${stderr.slice(-500)}`);
    return '';
  }

  // Extract URL from stdout if present
  const urlMatch = stdout.match(/https?:\/\/[^\s]+railway\.app[^\s]*/);
  const url = urlMatch ? urlMatch[0] : '';

  if (url) {
    logger.success(`Backend deployed: ${url}`);
  } else {
    logger.success('Railway deployment triggered (check dashboard for URL)');
  }

  return url;
}
