import path from 'path';
import fs from 'fs-extra';
import { logger } from '../core/logger';
import { agentState } from '../core/state';

export interface GeneratedFile {
  relativePath: string;
  absolutePath: string;
  content: string;
  language: string;
}

/**
 * Parse AI response that contains file blocks in the format:
 *
 * ===FILE: path/to/file.ts===
 * ```typescript
 * // content
 * ```
 */
export function parseFileBlocks(aiResponse: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Match ===FILE: some/path=== followed by a fenced code block
  const FILE_BLOCK_REGEX =
    /===FILE:\s*([^\n=]+?)===\s*\n```(\w*)\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  while ((match = FILE_BLOCK_REGEX.exec(aiResponse)) !== null) {
    const relativePath = match[1].trim();
    const language = match[2].trim() || detectLanguage(relativePath);
    const content = match[3];

    files.push({
      relativePath,
      absolutePath: '',  // filled in by writeFiles
      content,
      language,
    });
  }

  // Fallback: markdown code fences with // File: header comment
  if (files.length === 0) {
    const COMMENT_BLOCK_REGEX =
      /```(\w+)\n\/\/\s*(?:File|file|FILE):\s*([^\n]+)\n([\s\S]*?)```/g;
    while ((match = COMMENT_BLOCK_REGEX.exec(aiResponse)) !== null) {
      const language = match[1].trim();
      const relativePath = match[2].trim();
      const content = match[3];
      files.push({ relativePath, absolutePath: '', content, language });
    }
  }

  return files;
}

/**
 * Write parsed files to disk relative to projectRoot.
 */
export async function writeFiles(
  files: GeneratedFile[],
  projectRoot: string,
  dryRun = false
): Promise<GeneratedFile[]> {
  const written: GeneratedFile[] = [];

  for (const file of files) {
    const absPath = path.resolve(projectRoot, file.relativePath);
    file.absolutePath = absPath;

    if (dryRun) {
      logger.file(`[dry-run] ${file.relativePath}`);
      written.push(file);
      continue;
    }

    try {
      await fs.ensureDir(path.dirname(absPath));
      await fs.writeFile(absPath, file.content, 'utf-8');
      logger.file(file.relativePath);
      agentState.addGeneratedFile(file.relativePath);
      written.push(file);
    } catch (err: any) {
      logger.error(`Failed to write ${file.relativePath}: ${err.message}`);
    }
  }

  return written;
}

/**
 * Write a single markdown/text file to the context directory.
 */
export async function writeContextFile(
  filename: string,
  content: string,
  contextDir: string
): Promise<string> {
  await fs.ensureDir(contextDir);
  const filePath = path.join(contextDir, filename);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Read a file safely (returns empty string if not found).
 */
export function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Recursively list files under a directory (respects ignore list).
 */
export function listFilesRecursive(
  dir: string,
  ignorePatterns: string[] = []
): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) return results;

  const defaultIgnore = [
    'node_modules',
    '.git',
    'dist',
    '.angular',
    'coverage',
    '.cache',
  ];
  const allIgnore = [...defaultIgnore, ...ignorePatterns];

  function walk(current: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (allIgnore.some((ig) => entry.name === ig || entry.name.startsWith('.'))) {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        results.push(full);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Truncate file content for AI context (keeps first N lines).
 */
export function truncateForContext(content: string, maxLines = 120): string {
  const lines = content.split('\n');
  if (lines.length <= maxLines) return content;
  return lines.slice(0, maxLines).join('\n') + `\n... (${lines.length - maxLines} more lines)`;
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.html': 'html',
    '.scss': 'scss',
    '.css': 'css',
    '.json': 'json',
    '.md': 'markdown',
    '.sh': 'bash',
    '.sql': 'sql',
    '.yml': 'yaml',
    '.yaml': 'yaml',
  };
  return map[ext] ?? 'plaintext';
}
