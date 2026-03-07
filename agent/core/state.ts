import path from 'path';
import fs from 'fs';
import { getConfig } from './config';
import { logger } from './logger';

export type AgentStep =
  | 'idle'
  | 'requirement'
  | 'planning'
  | 'analysis'
  | 'backend'
  | 'frontend'
  | 'testing'
  | 'deployment'
  | 'production-test'
  | 'complete';

export interface ProjectInfo {
  hasExistingProject: boolean;
  frontendFramework: 'angular' | 'react' | 'none';
  backendFramework: 'express' | 'none';
  databases: ('mysql' | 'mongodb' | 'postgres' | 'none')[];
  colorPalette: Record<string, string>;
  frontendPath: string;
  backendPath: string;
  existingFeatures: string[];
  existingRoutes: string[];
  existingComponents: string[];
}

export interface AgentSession {
  id: string;
  startedAt: string;
  currentStep: AgentStep;
  requirement: string;
  planPath: string;
  architecturePath: string;
  analysisPath: string;
  projectInfo: ProjectInfo | null;
  generatedFiles: string[];
  testsPassed: boolean;
  deployedFrontendUrl: string;
  deployedBackendUrl: string;
  errors: string[];
  completedSteps: AgentStep[];
}

const DEFAULT_SESSION: AgentSession = {
  id: '',
  startedAt: '',
  currentStep: 'idle',
  requirement: '',
  planPath: '',
  architecturePath: '',
  analysisPath: '',
  projectInfo: null,
  generatedFiles: [],
  testsPassed: false,
  deployedFrontendUrl: '',
  deployedBackendUrl: '',
  errors: [],
  completedSteps: [],
};

class AgentState {
  private session: AgentSession;
  private sessionPath: string;

  constructor() {
    const config = getConfig();
    this.sessionPath = path.join(config.contextDir, 'session.json');
    this.session = this.load();
  }

  private load(): AgentSession {
    try {
      if (fs.existsSync(this.sessionPath)) {
        const raw = fs.readFileSync(this.sessionPath, 'utf-8');
        return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
      }
    } catch {
      // ignore corrupt session
    }
    return this.createFresh();
  }

  private createFresh(): AgentSession {
    return {
      ...DEFAULT_SESSION,
      id: `session_${Date.now()}`,
      startedAt: new Date().toISOString(),
    };
  }

  save(): void {
    try {
      const dir = path.dirname(this.sessionPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.sessionPath, JSON.stringify(this.session, null, 2));
    } catch (err: any) {
      logger.warn(`Could not save session: ${err.message}`);
    }
  }

  reset(): void {
    this.session = this.createFresh();
    this.save();
  }

  get(): AgentSession {
    return this.session;
  }

  setStep(step: AgentStep): void {
    this.session.currentStep = step;
    this.save();
  }

  completeStep(step: AgentStep): void {
    if (!this.session.completedSteps.includes(step)) {
      this.session.completedSteps.push(step);
    }
    this.save();
  }

  isStepDone(step: AgentStep): boolean {
    return this.session.completedSteps.includes(step);
  }

  setRequirement(req: string): void {
    this.session.requirement = req;
    this.save();
  }

  setProjectInfo(info: ProjectInfo): void {
    this.session.projectInfo = info;
    this.save();
  }

  setPlanPath(p: string): void {
    this.session.planPath = p;
    this.save();
  }

  setArchitecturePath(p: string): void {
    this.session.architecturePath = p;
    this.save();
  }

  setAnalysisPath(p: string): void {
    this.session.analysisPath = p;
    this.save();
  }

  addGeneratedFile(filePath: string): void {
    if (!this.session.generatedFiles.includes(filePath)) {
      this.session.generatedFiles.push(filePath);
    }
    this.save();
  }

  setTestsPassed(passed: boolean): void {
    this.session.testsPassed = passed;
    this.save();
  }

  setDeployedUrls(frontend: string, backend: string): void {
    this.session.deployedFrontendUrl = frontend;
    this.session.deployedBackendUrl = backend;
    this.save();
  }

  addError(err: string): void {
    this.session.errors.push(`[${new Date().toISOString()}] ${err}`);
    this.save();
  }
}

// Singleton
export const agentState = new AgentState();
