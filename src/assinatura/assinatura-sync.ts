import type { ParteType, SignatureLine } from '../types.js';

interface ParteBlotLike {
  domNode: HTMLElement;
}

/**
 * Extracts signature lines from parte blots.
 *
 * For each parte, the "name" is the text content before the first comma.
 * If no comma is found, the entire text content is used.
 */
export function extractSignatureLines(parteItems: ParteBlotLike[]): SignatureLine[] {
  const lines: SignatureLine[] = [];

  for (const item of parteItems) {
    const domNode = item.domNode;
    const role = domNode.getAttribute('data-parte-type') as ParteType;
    if (!role) continue;

    // Get text content, excluding the .ql-ui prefix
    const uiNode = domNode.querySelector('.ql-ui');
    let text = domNode.textContent || '';
    if (uiNode && uiNode.textContent) {
      text = text.replace(uiNode.textContent, '');
    }
    text = text.trim();

    // Extract name: text before first comma, or full text
    const commaIdx = text.indexOf(',');
    const nome = commaIdx >= 0 ? text.substring(0, commaIdx).trim() : text.trim();

    if (nome) {
      lines.push({ nome, role });
    }
  }

  return lines;
}
