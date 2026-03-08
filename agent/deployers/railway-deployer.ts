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

  const absPath = path.resolve(config.projectRoot, backendPath);
  logger.deploy('Deploying backend to Railway…');

  // Only set RAILWAY_TOKEN if it looks like a valid Iron/session token (not a UUID).
  // UUID account tokens don't work with the Railway CLI — the CLI uses the local
  // session from ~/.railway/config.json when RAILWAY_TOKEN is not set.
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (config.railwayToken && !uuidPattern.test(config.railwayToken.trim())) {
    process.env.RAILWAY_TOKEN = config.railwayToken;
  } else if (process.env.RAILWAY_TOKEN && uuidPattern.test(process.env.RAILWAY_TOKEN.trim())) {
    // Clear UUID token so Railway CLI falls back to local ~/.railway/config.json session
    delete process.env.RAILWAY_TOKEN;
  }

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
