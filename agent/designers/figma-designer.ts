import axios from 'axios';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';

export interface FigmaFrame {
  id: string;
  name: string;
  imageUrl?: string;
  cssProperties?: Record<string, string>;
}

export interface FigmaDesign {
  available: boolean;
  frames: FigmaFrame[];
  colorStyles: Record<string, string>;
  textStyles: Record<string, string>;
}

/**
 * Attempt to fetch design data from Figma API.
 * Returns { available: false } if token is missing or call fails.
 */
export async function fetchFigmaDesign(
  fileKey: string
): Promise<FigmaDesign> {
  const { figmaApiToken } = getConfig();

  if (!figmaApiToken) {
    return { available: false, frames: [], colorStyles: {}, textStyles: {} };
  }

  logger.spin('Fetching Figma design…');

  try {
    const headers = { 'X-Figma-Token': figmaApiToken };

    // Fetch file metadata
    const fileRes = await axios.get(
      `https://api.figma.com/v1/files/${fileKey}`,
      { headers, timeout: 10000 }
    );

    const document = fileRes.data?.document;

    // Extract frames from the first page
    const pages: any[] = document?.children ?? [];
    const firstPage = pages[0];
    const frames: FigmaFrame[] = [];

    if (firstPage) {
      for (const child of firstPage.children ?? []) {
        if (child.type === 'FRAME' || child.type === 'COMPONENT') {
          frames.push({ id: child.id, name: child.name });
        }
      }
    }

    // Fetch styles
    const stylesRes = await axios.get(
      `https://api.figma.com/v1/files/${fileKey}/styles`,
      { headers, timeout: 10000 }
    );

    const colorStyles: Record<string, string> = {};
    const textStyles: Record<string, string> = {};

    for (const style of stylesRes.data?.meta?.styles ?? []) {
      if (style.style_type === 'FILL') {
        colorStyles[style.name] = style.node_id;
      } else if (style.style_type === 'TEXT') {
        textStyles[style.name] = style.node_id;
      }
    }

    // Fetch images for frames
    if (frames.length > 0) {
      const ids = frames.map((f) => f.id).join(',');
      const imgRes = await axios.get(
        `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=png`,
        { headers, timeout: 15000 }
      );
      const images: Record<string, string> = imgRes.data?.images ?? {};
      frames.forEach((f) => {
        if (images[f.id]) f.imageUrl = images[f.id];
      });
    }

    logger.stopSpinner(`Figma: ${frames.length} frame(s) fetched`);

    return { available: true, frames, colorStyles, textStyles };
  } catch (err: any) {
    logger.stopSpinner(undefined, `Figma failed: ${err.message}`);
    return { available: false, frames: [], colorStyles: {}, textStyles: {} };
  }
}

/**
 * Convert Figma style data into CSS variable declarations.
 */
export function figmaToCssVars(design: FigmaDesign): string {
  if (!design.available || Object.keys(design.colorStyles).length === 0) {
    return '';
  }

  const vars = Object.entries(design.colorStyles)
    .map(([name, _]) => `  --${name.toLowerCase().replace(/\s+/g, '-')}: /* from Figma */;`)
    .join('\n');

  return `:root {\n${vars}\n}`;
}
