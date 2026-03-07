import { callAI } from '../core/ai-client';
import { logger } from '../core/logger';
import { ProjectInfo } from '../core/state';
import {
  SYSTEM_PROMPT_UI_DESIGNER,
} from '../prompts/system-prompts';

export interface ComponentDesign {
  name: string;
  layout: string;
  primaryColor: string;
  accentColor: string;
  elements: string[];
  animations: string[];
  scssSnippet: string;
}

export interface UIDesignSpec {
  feature: string;
  components: ComponentDesign[];
  colorPalette: Record<string, string>;
  raw: string;
}

/**
 * Generate a UI design specification for a feature using AI.
 * This is used when Figma is unavailable.
 */
export async function generateUIDesign(
  feature: string,
  projectInfo: ProjectInfo,
  plan: string
): Promise<UIDesignSpec> {
  logger.spin(`Designing UI for: ${feature}`);

  const userPrompt = `
Feature to design: "${feature}"

Application context:
- Medical / healthcare domain
- Existing color palette: ${JSON.stringify(projectInfo.colorPalette)}
- Framework: ${projectInfo.frontendFramework}
- Existing components: ${projectInfo.existingComponents.slice(0, 10).join(', ')}

Engineering plan excerpt:
${plan.slice(0, 1500)}

Generate a modern, clean UI specification for this feature.
  `.trim();

  let raw = '';
  try {
    raw = await callAI(SYSTEM_PROMPT_UI_DESIGNER, userPrompt, {
      temperature: 0.5,
      maxTokens: 1500,
    });
  } catch (err: any) {
    logger.stopSpinner(undefined, `UI design failed: ${err.message}`);
    return buildFallbackDesign(feature, projectInfo);
  }

  // Parse JSON from response
  let parsed: any = {};
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // use raw as plain text guidance
  }

  const colorPalette =
    parsed.colorPalette ?? projectInfo.colorPalette;
  const components: ComponentDesign[] = (parsed.components ?? []).map(
    (c: any) => ({
      name: c.name ?? feature,
      layout: c.layout ?? 'Card-based layout',
      primaryColor: colorPalette.primary ?? '#154E99',
      accentColor: colorPalette.secondary ?? '#7FB5FA',
      elements: c.elements ?? [],
      animations: c.animations ?? ['fade-in'],
      scssSnippet: buildScssSnippet(colorPalette, c.name ?? feature),
    })
  );

  logger.stopSpinner(`UI design ready for "${feature}"`);

  return { feature, components, colorPalette, raw };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildFallbackDesign(
  feature: string,
  projectInfo: ProjectInfo
): UIDesignSpec {
  const palette = projectInfo.colorPalette;
  return {
    feature,
    colorPalette: palette,
    raw: '',
    components: [
      {
        name: feature,
        layout: 'Single-column card layout, centered on page',
        primaryColor: palette['primary'] ?? '#154E99',
        accentColor: palette['secondary'] ?? '#7FB5FA',
        elements: [
          'Page heading',
          'Content card with shadow',
          'Form inputs with floating labels',
          'Primary action button',
          'Back / cancel link',
        ],
        animations: ['fade-in 300ms ease-out', 'slide-up 250ms ease-out'],
        scssSnippet: buildScssSnippet(palette, feature),
      },
    ],
  };
}

function buildScssSnippet(
  palette: Record<string, string>,
  componentName: string
): string {
  const selector = componentName.toLowerCase().replace(/\s+/g, '-');
  return `.${selector}-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;

  .card {
    background: var(--white, #fff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    animation: fadeSlideIn 0.3s ease-out;
  }

  .btn-primary {
    background-color: var(--primary, ${palette['primary'] ?? '#154E99'});
    border-color: var(--primary, ${palette['primary'] ?? '#154E99'});
    &:hover {
      background-color: var(--primary-dark, ${palette['primary-dark'] ?? '#0d3a6d'});
    }
  }
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
}
