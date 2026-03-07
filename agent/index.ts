#!/usr/bin/env ts-node
/**
 * DevMedic Agent — Autonomous AI Developer
 * Entry point: npm run agent (from workspace root)
 *             npm start     (from agent/ directory)
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from './core/logger';
import { getConfig, validateConfig } from './core/config';
import { agentState } from './core/state';
import { Orchestrator } from './core/orchestrator';

const pkg = require('./package.json');

const program = new Command();

program
  .name('devmedic')
  .description('DevMedic – Autonomous AI development agent')
  .version(pkg.version)
  .option('--reset', 'Clear saved session and start fresh')
  .option('--dry-run', 'Plan and analyse only — stop after Step 3 (no code written)')
  .option('--skip-deploy', 'Skip deployment step')
  .option('--requirement <text>', 'Pre-fill the high-level requirement (skips interactive prompt)')
  .option('--yes', 'Auto-confirm all yes/no prompts (non-interactive mode)')
  .option('--model <model>', 'OpenAI model to use (default: gpt-4o)')
  .option('--debug', 'Show verbose debug output');

// ── Sub-commands ─────────────────────────────────────────────────────────────

program
  .command('run')
  .description('Start the full autonomous agent workflow (default)')
  .action(runAgent);

program
  .command('status')
  .description('Show the current session status')
  .action(showStatus);

program
  .command('plan')
  .description('Regenerate the engineering plan only')
  .action(runPlanOnly);

program
  .command('deploy')
  .description('Run deployment only (Vercel + Railway) — skips code generation')
  .action(runDeployOnly);

program
  .command('reset')
  .description('Clear saved session and start fresh')
  .action(() => {
    agentState.reset();
    logger.success('Session reset. Run "npm run agent" to start fresh.');
    process.exit(0);
  });

// Default action when no sub-command given
program.action(runAgent);

program.parse(process.argv);

// ─────────────────────────────────────────────────────────────────────────────

async function runAgent(): Promise<void> {
  const opts = program.opts();

  // Override model if flag provided
  if (opts.model) {
    process.env.AGENT_MODEL = opts.model;
  }

  if (opts.reset) {
    agentState.reset();
    logger.info('Session cleared.');
  }

  if (opts.skipDeploy) {
    process.env.SKIP_DEPLOY = 'true';
  }

  // Pre-fill requirement (skip interactive prompt)
  if (opts.requirement) {
    process.env.AGENT_REQUIREMENT = opts.requirement;
  }

  // Non-interactive / CI mode
  if (opts.yes) {
    process.env.AGENT_YES = 'true';
  }

  // Dry-run: plan + analyse only, stop before code generation
  if (opts.dryRun) {
    process.env.DRY_RUN = 'true';
  }

  // Validate config
  const { valid, errors } = validateConfig();
  if (!valid) {
    logger.banner();
    logger.blank();
    logger.error('Configuration errors:');
    errors.forEach((e) => logger.error(`  • ${e}`));
    logger.blank();
    logger.dim('Steps to fix:');
    logger.dim('  1. Copy agent/.env.example  →  agent/.env');
    logger.dim('  2. Add your OPENAI_API_KEY');
    logger.dim('  3. Run "npm run agent" again');
    logger.blank();
    process.exit(1);
  }

  // Ensure context directory exists
  const config = getConfig();
  await fs.ensureDir(config.contextDir);

  // Run orchestrator
  const orchestrator = new Orchestrator();
  await orchestrator.run();
}

async function showStatus(): Promise<void> {
  logger.banner();
  const session = agentState.get();

  logger.section('Session Status');
  logger.keyValue('Session ID', session.id || '(none)');
  logger.keyValue('Started', session.startedAt || '—');
  logger.keyValue('Current step', session.currentStep);
  logger.keyValue('Completed steps', session.completedSteps.join(', ') || 'none');
  logger.keyValue('Requirement', session.requirement || '(none)');
  logger.keyValue('Files generated', String(session.generatedFiles.length));
  logger.keyValue('Tests passed', String(session.testsPassed));
  if (session.deployedFrontendUrl) logger.keyValue('Frontend URL', session.deployedFrontendUrl);
  if (session.deployedBackendUrl) logger.keyValue('Backend URL', session.deployedBackendUrl);
  if (session.errors.length) {
    logger.blank();
    logger.warn(`${session.errors.length} error(s) in session. Check agent/context/session.json.`);
  }
  logger.blank();
}

async function runPlanOnly(): Promise<void> {
  logger.banner();

  const { valid, errors } = validateConfig();
  if (!valid) {
    errors.forEach((e) => logger.error(e));
    process.exit(1);
  }

  const inquirer = require('inquirer');
  const { generatePlan } = require('./planners/requirement-planner');

  const { requirement } = await inquirer.prompt([
    {
      type: 'input',
      name: 'requirement',
      message: '◆ Describe your high-level requirement:',
    },
  ]);

  agentState.setRequirement(requirement);
  const plan = await generatePlan(requirement);
  logger.success(`Plan saved to: ${agentState.get().planPath}`);
  logger.blank();
  console.log(plan.slice(0, 1500));
}

async function runDeployOnly(): Promise<void> {
  logger.banner();

  const { valid, errors } = validateConfig();
  if (!valid) {
    errors.forEach((e) => logger.error(e));
    process.exit(1);
  }

  const { deploy, testProductionEndpoints } = await import('./deployers/deployment-manager');
  const { buildAngularProd } = await import('./deployers/vercel-deployer');

  const config = getConfig();
  const session = agentState.get();

  // Resolve project info from session or use defaults
  const projectInfo = session.projectInfo ?? {
    hasExistingProject: true,
    frontendPath: 'angular/medic',
    backendPath: 'node',
    frontendFramework: 'angular',
    backendFramework: 'express',
    databases: ['mysql', 'mongodb'],
    existingComponents: [],
    colorPalette: { primary: '#154E99' },
  };

  logger.section('Deployment');

  // ── 1. Build Angular ────────────────────────────────────────────────────
  logger.info('Building Angular production bundle…');
  const buildOk = await buildAngularProd(path.join(config.projectRoot, projectInfo.frontendPath));
  if (!buildOk) {
    logger.warn('Angular build failed — skipping Vercel deploy. Railway deploy will still run.');
  }

  // ── 2. Deploy ───────────────────────────────────────────────────────────
  logger.info('Deploying to Vercel (frontend) + Railway (backend)…');
  const result = await deploy(projectInfo as any);

  logger.blank();
  if (result.frontendUrl) {
    logger.success(`Frontend deployed → ${result.frontendUrl}`);
    agentState.setDeployedUrls(result.frontendUrl, result.backendUrl);
  } else {
    logger.warn('Frontend deploy did not return a URL — check Vercel dashboard.');
  }

  if (result.backendUrl) {
    logger.success(`Backend deployed  → ${result.backendUrl}`);
    // Test production endpoints
    await testProductionEndpoints(result.backendUrl);
  } else {
    logger.warn('Backend deploy did not return a URL — check Railway dashboard.');
  }
}
