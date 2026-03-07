import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { getConfig } from './config';
import { logger } from './logger';
import { agentState, ProjectInfo } from './state';

// Planners
import { generatePlan, extractFeatureList } from '../planners/requirement-planner';

// Analyzers
import { analyzeCodebase } from '../analyzers/code-analyzer';

// Generators
import { generateFullBackend } from '../generators/backend-generator';
import { generateFullFrontend } from '../generators/frontend-generator';
import { readFileSafe } from '../generators/file-generator';

// Designers
import { fetchFigmaDesign } from '../designers/figma-designer';
import { generateUIDesign } from '../designers/ui-designer';

// Testers
import { generateTests } from '../testers/test-generator';
import {
  runJestTests,
  autoFixTests,
  ensureDepsInstalled,
} from '../testers/test-runner';

// Deployers
import { deploy, testProductionEndpoints } from '../deployers/deployment-manager';

const TOTAL_STEPS = 9;

export class Orchestrator {
  private config = getConfig();

  // ── Public entry ─────────────────────────────────────────────────────────

  async run(): Promise<void> {
    logger.banner();

    const nonInteractive = !!(process.env.AGENT_REQUIREMENT || process.env.AGENT_YES);

    // Check for resume — skip prompt when running non-interactively
    const session = agentState.get();
    if (session.completedSteps.length > 0 && session.requirement) {
      if (nonInteractive) {
        // In non-interactive mode: always start fresh when a new requirement is provided,
        // otherwise resume silently
        if (process.env.AGENT_REQUIREMENT && process.env.AGENT_REQUIREMENT !== session.requirement) {
          agentState.reset();
          logger.info('New requirement detected — starting fresh session.');
        } else {
          logger.info(`Resuming previous session (${session.completedSteps.length} step(s) done).`);
        }
      } else {
        const { resume } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'resume',
            message: `Resume previous session (${session.completedSteps.length} step(s) done)?`,
            default: true,
          },
        ]);
        if (!resume) {
          agentState.reset();
          logger.info('Starting fresh session.');
        }
      }
    }

    try {
      await this.step1_getRequirement();
      await this.step2_generatePlan();
      await this.step3_analyzeProject();

      // Dry-run stops here — plan and analysis only
      if (process.env.DRY_RUN === 'true') {
        logger.blank();
        logger.success('Dry-run complete (Steps 1\u20133 finished).');
        logger.dim('Plan  → agent/context/plan.md');
        logger.dim('Analysis → agent/context/analysis.md');
        this.printSummary();
        return;
      }

      await this.step4_generateBackend();
      await this.step5_generateFrontend();
      await this.step6_runTests();
      await this.step7_deploy();
      await this.step8_productionTest();

      this.printSummary();
    } catch (err: any) {
      logger.error(`Agent stopped: ${err.message}`);
      logger.dim('Session saved. Run again to resume from the last checkpoint.');
      process.exit(1);
    }
  }

  // ── Step 1: Get Requirement ───────────────────────────────────────────────

  private async step1_getRequirement(): Promise<void> {
    if (agentState.isStepDone('requirement')) {
      const req = agentState.get().requirement;
      logger.info(`Resuming with requirement: "${req.slice(0, 80)}…"`);
      return;
    }

    logger.step(1, TOTAL_STEPS, 'High-Level Requirement');

    // Non-interactive: use pre-filled requirement from --requirement flag
    const prefilledReq = process.env.AGENT_REQUIREMENT;
    if (prefilledReq) {
      agentState.setRequirement(prefilledReq.trim());
      agentState.setStep('planning');
      agentState.completeStep('requirement');
      logger.success(`Requirement: "${prefilledReq.trim().slice(0, 100)}…"`);
      return;
    }

    const { requirement } = await inquirer.prompt([
      {
        type: 'input',
        name: 'requirement',
        message: '◆ Describe the high-level requirement of the application:',
        validate: (v: string) =>
          v.trim().length > 5 ? true : 'Please describe at least what you want to build.',
      },
    ]);

    agentState.setRequirement(requirement.trim());
    agentState.setStep('planning');
    agentState.completeStep('requirement');

    logger.success(`Requirement saved: "${requirement.trim()}"`);
  }

  // ── Step 2: Generate Plan ─────────────────────────────────────────────────

  private async step2_generatePlan(): Promise<void> {
    if (agentState.isStepDone('planning')) {
      logger.info('Plan already exists, skipping.');
      return;
    }

    logger.step(2, TOTAL_STEPS, 'Converting Requirement → Engineering Plan');
    const session = agentState.get();

    // Pass existing analysis if available
    const existingAnalysis = session.analysisPath
      ? readFileSafe(session.analysisPath)
      : undefined;

    const plan = await generatePlan(session.requirement, existingAnalysis);

    agentState.setStep('analysis');
    agentState.completeStep('planning');

    logger.blank();
    logger.success(`Plan saved → ${session.planPath || 'agent/context/plan.md'}`);
    logger.dim('Preview (first 500 chars):');
    logger.dim(plan.slice(0, 500) + '…');
  }

  // ── Step 3: Analyse Existing Project ─────────────────────────────────────

  private async step3_analyzeProject(): Promise<void> {
    if (agentState.isStepDone('analysis')) {
      const info = agentState.get().projectInfo;
      logger.info('Codebase analysis already done.');
      if (info) {
        logger.keyValue('Frontend', `${info.frontendFramework} (${info.frontendPath})`);
        logger.keyValue('Backend', `${info.backendFramework} (${info.backendPath})`);
        logger.keyValue('Databases', info.databases.join(', '));
      }
      return;
    }

    logger.step(3, TOTAL_STEPS, 'Analysing Existing Project');

    const snapshot = await analyzeCodebase();
    const info = snapshot.projectInfo;

    if (info.hasExistingProject) {
      logger.success('CASE A: Existing project detected');
      logger.keyValue('Frontend', `${info.frontendFramework} (${info.frontendPath})`);
      logger.keyValue('Backend', `${info.backendFramework} (${info.backendPath})`);
      logger.keyValue('Databases', info.databases.join(', '));
      logger.keyValue('Existing components', String(info.existingComponents.length));
    } else {
      logger.info('CASE B: No existing project — will scaffold from scratch');
    }

    agentState.setStep('backend');
    agentState.completeStep('analysis');
  }

  // ── Step 4: Backend Generation ────────────────────────────────────────────

  private async step4_generateBackend(): Promise<void> {
    if (agentState.isStepDone('backend')) {
      logger.info('Backend already generated, skipping.');
      return;
    }

    logger.step(4, TOTAL_STEPS, 'Backend Generation');

    const session = agentState.get();
    const plan = readFileSafe(session.planPath);
    const features = extractFeatureList(plan);

    logger.info(`Features to implement: ${features.length}`);
    features.forEach((f, i) => logger.dim(`  ${i + 1}. ${f}`));
    logger.blank();

    const projectInfo = session.projectInfo!;
    await generateFullBackend(features, plan, session.analysisPath, projectInfo);

    agentState.setStep('frontend');
    agentState.completeStep('backend');
    logger.success('Backend generation complete');
  }

  // ── Step 5: Frontend Generation (Iterative) ───────────────────────────────

  private async step5_generateFrontend(): Promise<void> {
    if (agentState.isStepDone('frontend')) {
      logger.info('Frontend already generated, skipping.');
      return;
    }

    logger.step(5, TOTAL_STEPS, 'Frontend Generation (Iterative)');

    const session = agentState.get();
    const plan = readFileSafe(session.planPath);
    const features = extractFeatureList(plan);
    const projectInfo = session.projectInfo!;

    // ── Try Figma first ──────────────────────────────────────────────────
    let figmaDesign = null;
    const figmaFileKey = process.env.FIGMA_FILE_KEY || this.config.figmaFileKey;
    if (figmaFileKey) {
      figmaDesign = await fetchFigmaDesign(figmaFileKey);
    }

    if (figmaDesign?.available) {
      logger.success(`Figma design fetched: ${figmaDesign.frames.length} frame(s)`);
    } else {
      logger.info('Figma unavailable — generating UI design manually');
    }

    // ── Generate UI designs for each feature ─────────────────────────────
    const uiDesigns: Record<string, string> = {};
    for (const feature of features) {
      try {
        const design = await generateUIDesign(feature, projectInfo, plan);
        uiDesigns[feature] = design.raw;
      } catch (err: any) {
        logger.warn(`UI design skipped for "${feature}": ${err.message}`);
        uiDesigns[feature] = '';
      }
    }

    // ── Generate frontend components iteratively ──────────────────────────
    await generateFullFrontend(
      features,
      plan,
      session.analysisPath,
      projectInfo,
      uiDesigns
    );

    agentState.setStep('testing');
    agentState.completeStep('frontend');
    logger.success('Frontend generation complete');
  }

  // ── Step 6: Testing ───────────────────────────────────────────────────────

  private async step6_runTests(): Promise<void> {
    if (agentState.isStepDone('testing')) {
      logger.info('Tests already run, skipping.');
      return;
    }

    logger.step(6, TOTAL_STEPS, 'Testing');

    const session = agentState.get();
    const plan = readFileSafe(session.planPath);
    const features = extractFeatureList(plan);
    const projectInfo = session.projectInfo!;

    // Generate tests for each feature
    for (const feature of features) {
      const recentFiles = session.generatedFiles.slice(-10);
      await generateTests(feature, plan, recentFiles);
    }

    // Install deps then run backend tests
    const backendDir = path.resolve(this.config.projectRoot, projectInfo.backendPath);

    if (fs.existsSync(backendDir)) {
      await ensureDepsInstalled(backendDir);

      const result = await runJestTests(backendDir);

      if (!result.passed && session.errors.length < this.config.maxTestRetries * 2) {
        logger.warn(`Tests failing — attempting auto-fix (max ${this.config.maxTestRetries} tries)`);

        // Collect source files for context
        const sourceFiles: Record<string, string> = {};
        for (const f of session.generatedFiles.slice(-5)) {
          const abs = path.resolve(this.config.projectRoot, f);
          sourceFiles[f] = readFileSafe(abs);
        }

        const fixed = await autoFixTests(
          result,
          backendDir,
          sourceFiles,
          this.config.maxTestRetries
        );

        if (fixed) {
          logger.success('All tests passing after auto-fix!');
        } else {
          logger.warn('Some tests still failing — proceeding to deployment anyway.');
          agentState.setTestsPassed(false);
        }
      } else if (result.passed) {
        agentState.setTestsPassed(true);
        logger.success('All backend tests passed!');
      }
    }

    agentState.setStep('deployment');
    agentState.completeStep('testing');
  }

  // ── Step 7: Deployment ────────────────────────────────────────────────────

  private async step7_deploy(): Promise<void> {
    if (agentState.isStepDone('deployment')) {
      const s = agentState.get();
      logger.info('Already deployed.');
      if (s.deployedFrontendUrl) logger.keyValue('Frontend', s.deployedFrontendUrl);
      if (s.deployedBackendUrl) logger.keyValue('Backend', s.deployedBackendUrl);
      return;
    }

    logger.step(7, TOTAL_STEPS, 'Deployment');

    // Non-interactive / --skip-deploy: skip deployment confirmation
    const skipDeploy = process.env.SKIP_DEPLOY === 'true';
    const autoYes    = process.env.AGENT_YES === 'true';

    let confirmDeploy = false;
    if (skipDeploy) {
      confirmDeploy = false;
      logger.warn('Deployment skipped (––skip-deploy).');
    } else if (autoYes) {
      confirmDeploy = true;
      logger.info('Auto-confirming deployment (––yes flag).');
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmDeploy',
          message: 'Deploy to Vercel (frontend) and Railway (backend)?',
          default: false,
        },
      ]);
      confirmDeploy = answer.confirmDeploy;
    }

    if (!confirmDeploy) {
      agentState.completeStep('deployment');
      return;
    }

    const projectInfo = agentState.get().projectInfo!;
    const result = await deploy(projectInfo);

    agentState.completeStep('deployment');

    if (result.frontendUrl) logger.success(`Frontend: ${result.frontendUrl}`);
    if (result.backendUrl) logger.success(`Backend: ${result.backendUrl}`);
  }

  // ── Step 8: Production Testing ────────────────────────────────────────────

  private async step8_productionTest(): Promise<void> {
    if (agentState.isStepDone('production-test')) {
      logger.info('Production tests already done.');
      return;
    }

    logger.step(8, TOTAL_STEPS, 'Production Testing');

    const session = agentState.get();
    if (!session.deployedBackendUrl) {
      logger.warn('No backend URL — skipping production tests.');
      agentState.completeStep('production-test');
      agentState.completeStep('complete');
      return;
    }

    const ok = await testProductionEndpoints(session.deployedBackendUrl);

    if (!ok) {
      logger.warn('Some production tests failed. Check logs and redeploy manually if needed.');
    }

    agentState.completeStep('production-test');
    agentState.completeStep('complete');
    agentState.setStep('complete');
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  private printSummary(): void {
    const session = agentState.get();

    logger.blank();
    logger.section('DevMedic Agent — Session Complete');

    logger.keyValue('Requirement', session.requirement);
    logger.keyValue('Files generated', String(session.generatedFiles.length));
    logger.keyValue('Tests passed', String(session.testsPassed));
    if (session.deployedFrontendUrl)
      logger.keyValue('Frontend URL', session.deployedFrontendUrl);
    if (session.deployedBackendUrl)
      logger.keyValue('Backend URL', session.deployedBackendUrl);
    if (session.errors.length > 0) {
      logger.blank();
      logger.warn(`${session.errors.length} error(s) logged in session.`);
    }

    logger.blank();
    logger.success('All done! Your application has been built, tested, and deployed.');
    logger.dim(`Full plan: ${session.planPath}`);
    logger.dim(`Analysis: ${session.analysisPath}`);
    logger.dim(`Session:  ${path.join(this.config.contextDir, 'session.json')}`);
    logger.blank();
  }
}
