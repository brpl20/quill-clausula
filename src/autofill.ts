import type { ClausulaType } from './types.js';

/**
 * Maps trigger words (typed at the start of a line + Space) to clausula types.
 * Matching is case-insensitive.
 *
 * Triggers:
 *   Cláusula:     cl, cláusula, clausula
 *   Sub-cláusula: sub, subcláusula, subclausula, sub-cláusula, sub-clausula
 *   Parágrafo:    §, par, parágrafo, paragrafo
 *   Inciso:       inc, inciso
 *   Alínea:       al, alínea, alinea
 */

const TRIGGERS: [RegExp, ClausulaType][] = [
  // Sub-cláusula must come before cláusula (longer match first)
  [/^sub[- ]?cl[aá]usula$/i, 'subclausula'],
  [/^sub$/i, 'subclausula'],

  // Cláusula
  [/^cl[aá]usula$/i, 'clausula'],
  [/^cl$/i, 'clausula'],

  // Parágrafo
  [/^par[aá]grafo$/i, 'paragrafo'],
  [/^par$/i, 'paragrafo'],
  [/^§$/,    'paragrafo'],

  // Inciso
  [/^inciso$/i, 'inciso'],
  [/^inc$/i,    'inciso'],

  // Alínea
  [/^al[ií]nea$/i, 'alinea'],
  [/^al$/i,        'alinea'],
];

/**
 * Extra triggers for non-clausula formats (parte, objeto).
 * Returns { format, value } for applying to the line.
 */
export interface ExtraTriggerResult {
  format: string;
  value: string;
}

const EXTRA_TRIGGERS: [RegExp, ExtraTriggerResult][] = [
  [/^contratante$/i, { format: 'parte', value: 'contratante' }],
  [/^contratado$/i, { format: 'parte', value: 'contratado' }],
  [/^objeto$/i, { format: 'objeto', value: 'true' }],
];

/**
 * The full regex that matches any trigger word at the start of a line.
 * Used as the `prefix` in the keyboard binding.
 */
export const AUTOFILL_PREFIX = /^\s*?(cl[aá]usula|sub[- ]?cl[aá]usula|sub|cl|par[aá]grafo|par|§|inciso|inc|al[ií]nea|al|contratante|contratado|objeto)$/i;

/**
 * Given a matched prefix string, return the corresponding clausula type.
 */
export function matchTrigger(prefix: string): ClausulaType | null {
  const trimmed = prefix.trim();
  for (const [pattern, type] of TRIGGERS) {
    if (pattern.test(trimmed)) return type;
  }
  return null;
}

/**
 * Given a matched prefix string, return a non-clausula format trigger if matched.
 */
export function matchExtraTrigger(prefix: string): ExtraTriggerResult | null {
  const trimmed = prefix.trim();
  for (const [pattern, result] of EXTRA_TRIGGERS) {
    if (pattern.test(trimmed)) return result;
  }
  return null;
}
