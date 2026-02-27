import type { ParteType, ParteIndex } from '../types.js';

interface ParteBlotLike {
  domNode: HTMLElement;
}

/**
 * Counts contratantes and contratados, then computes the label prefix for each.
 *
 * - 1 contratante  → "CONTRATANTE: "
 * - 2+ contratantes → "1º CONTRATANTE: ", "2º CONTRATANTE: "
 * - Same logic for contratado(s)
 */
export function computeParteIndices(items: ParteBlotLike[]): ParteIndex[] {
  const counts: Record<ParteType, number> = { contratante: 0, contratado: 0 };

  // First pass: count totals per role
  for (const item of items) {
    const type = item.domNode.getAttribute('data-parte-type') as ParteType;
    if (type in counts) counts[type]++;
  }

  // Second pass: assign indices
  const running: Record<ParteType, number> = { contratante: 0, contratado: 0 };
  const results: ParteIndex[] = [];

  for (const item of items) {
    const type = item.domNode.getAttribute('data-parte-type') as ParteType;
    running[type]++;
    results.push({
      type,
      index: running[type],
      total: counts[type],
    });
  }

  return results;
}

/**
 * Formats a parte prefix label from an index.
 *
 * If there's only one party of that role, no ordinal number is shown.
 * If there are 2+, prefix with "1º ", "2º ", etc.
 */
export function formatParteLabel(info: ParteIndex): string {
  const roleLabel = info.type === 'contratante' ? 'CONTRATANTE' : 'CONTRATADO';

  if (info.total <= 1) {
    return `${roleLabel}: `;
  }

  return `${info.index}º ${roleLabel}: `;
}
