/**
 * Converts a number (1-based) to its Portuguese ordinal word form.
 *
 * Brazilian legal documents use feminine ordinals for "Cláusula" (PRIMEIRA, SEGUNDA)
 * and masculine ordinals for "Parágrafo" (Primeiro, Segundo).
 */

const MASCULINE_UNITS = [
  '',
  'Primeiro',
  'Segundo',
  'Terceiro',
  'Quarto',
  'Quinto',
  'Sexto',
  'Sétimo',
  'Oitavo',
  'Nono',
];

const FEMININE_UNITS = [
  '',
  'Primeira',
  'Segunda',
  'Terceira',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sétima',
  'Oitava',
  'Nona',
];

const MASCULINE_TENS = [
  '',
  'Décimo',
  'Vigésimo',
  'Trigésimo',
  'Quadragésimo',
  'Quinquagésimo',
  'Sexagésimo',
  'Septuagésimo',
  'Octogésimo',
  'Nonagésimo',
];

const FEMININE_TENS = [
  '',
  'Décima',
  'Vigésima',
  'Trigésima',
  'Quadragésima',
  'Quinquagésima',
  'Sexagésima',
  'Septuagésima',
  'Octogésima',
  'Nonagésima',
];

const MASCULINE_HUNDREDS = [
  '',
  'Centésimo',
  'Ducentésimo',
  'Trecentésimo',
  'Quadringentésimo',
  'Quingentésimo',
  'Sexcentésimo',
  'Septingentésimo',
  'Octingentésimo',
  'Noningentésimo',
];

const FEMININE_HUNDREDS = [
  '',
  'Centésima',
  'Ducentésima',
  'Trecentésima',
  'Quadringentésima',
  'Quingentésima',
  'Sexcentésima',
  'Septingentésima',
  'Octingentésima',
  'Noningentésima',
];

export type Gender = 'masculine' | 'feminine';

export function toExtenso(num: number, gender: Gender = 'feminine'): string {
  if (num <= 0 || num > 999) return String(num);

  const units = gender === 'feminine' ? FEMININE_UNITS : MASCULINE_UNITS;
  const tens = gender === 'feminine' ? FEMININE_TENS : MASCULINE_TENS;
  const hundreds = gender === 'feminine' ? FEMININE_HUNDREDS : MASCULINE_HUNDREDS;

  const parts: string[] = [];

  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const u = num % 10;

  if (h > 0) parts.push(hundreds[h]);
  if (t > 0) parts.push(tens[t]);
  if (u > 0) parts.push(units[u]);

  return parts.join(' ');
}

export function toExtensoUpper(num: number, gender: Gender = 'feminine'): string {
  return toExtenso(num, gender).toUpperCase();
}
