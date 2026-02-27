import { describe, it, expect } from 'vitest';
import { toRoman, toRomanLower } from '../src/numbering/roman.js';
import { toExtenso, toExtensoUpper } from '../src/numbering/extenso.js';
import { formatLabel } from '../src/numbering/formatter.js';
import type { ClausulaIndex, ClausulaModuleOptions } from '../src/types.js';
import { DEFAULT_OPTIONS } from '../src/types.js';

describe('Roman numerals', () => {
  it('converts basic numbers', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(2)).toBe('II');
    expect(toRoman(3)).toBe('III');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(5)).toBe('V');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(10)).toBe('X');
    expect(toRoman(14)).toBe('XIV');
    expect(toRoman(40)).toBe('XL');
    expect(toRoman(50)).toBe('L');
    expect(toRoman(90)).toBe('XC');
    expect(toRoman(100)).toBe('C');
    expect(toRoman(400)).toBe('CD');
    expect(toRoman(500)).toBe('D');
    expect(toRoman(900)).toBe('CM');
    expect(toRoman(1000)).toBe('M');
  });

  it('converts compound numbers', () => {
    expect(toRoman(42)).toBe('XLII');
    expect(toRoman(1999)).toBe('MCMXCIX');
    expect(toRoman(3999)).toBe('MMMCMXCIX');
  });

  it('handles edge cases', () => {
    expect(toRoman(0)).toBe('0');
    expect(toRoman(-1)).toBe('-1');
    expect(toRoman(4000)).toBe('4000');
  });

  it('converts to lowercase', () => {
    expect(toRomanLower(1)).toBe('i');
    expect(toRomanLower(14)).toBe('xiv');
  });
});

describe('Extenso (Portuguese ordinals)', () => {
  it('converts feminine units', () => {
    expect(toExtenso(1, 'feminine')).toBe('Primeira');
    expect(toExtenso(2, 'feminine')).toBe('Segunda');
    expect(toExtenso(3, 'feminine')).toBe('Terceira');
    expect(toExtenso(9, 'feminine')).toBe('Nona');
  });

  it('converts masculine units', () => {
    expect(toExtenso(1, 'masculine')).toBe('Primeiro');
    expect(toExtenso(2, 'masculine')).toBe('Segundo');
    expect(toExtenso(5, 'masculine')).toBe('Quinto');
  });

  it('converts tens', () => {
    expect(toExtenso(10, 'feminine')).toBe('Décima');
    expect(toExtenso(11, 'feminine')).toBe('Décima Primeira');
    expect(toExtenso(20, 'masculine')).toBe('Vigésimo');
    expect(toExtenso(23, 'masculine')).toBe('Vigésimo Terceiro');
  });

  it('converts hundreds', () => {
    expect(toExtenso(100, 'feminine')).toBe('Centésima');
    expect(toExtenso(101, 'masculine')).toBe('Centésimo Primeiro');
    expect(toExtenso(215, 'feminine')).toBe('Ducentésima Décima Quinta');
  });

  it('converts to uppercase', () => {
    expect(toExtensoUpper(1, 'feminine')).toBe('PRIMEIRA');
    expect(toExtensoUpper(11, 'feminine')).toBe('DÉCIMA PRIMEIRA');
  });

  it('handles edge cases', () => {
    expect(toExtenso(0)).toBe('0');
    expect(toExtenso(1000)).toBe('1000');
  });
});

describe('Formatter', () => {
  const opts = DEFAULT_OPTIONS;

  it('formats cláusula extenso', () => {
    const idx: ClausulaIndex = {
      type: 'clausula',
      index: 1,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, opts)).toBe('CLÁUSULA PRIMEIRA — ');
  });

  it('formats cláusula numeric', () => {
    const numOpts: ClausulaModuleOptions = { ...opts, clausulaFormat: 'numeric' };
    const idx: ClausulaIndex = {
      type: 'clausula',
      index: 3,
      parentClausulaIndex: 3,
      isUnico: false,
    };
    expect(formatLabel(idx, numOpts)).toBe('CLÁUSULA 3 — ');
  });

  it('formats cláusula ordinal', () => {
    const ordOpts: ClausulaModuleOptions = { ...opts, clausulaFormat: 'ordinal' };
    const idx: ClausulaIndex = {
      type: 'clausula',
      index: 5,
      parentClausulaIndex: 5,
      isUnico: false,
    };
    expect(formatLabel(idx, ordOpts)).toBe('CLÁUSULA 5ª — ');
  });

  it('formats subclausula dotted', () => {
    const idx: ClausulaIndex = {
      type: 'subclausula',
      index: 2,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, opts)).toBe('1.2 ');
  });

  it('formats subclausula dotted-padded', () => {
    const padOpts: ClausulaModuleOptions = { ...opts, subclausulaFormat: 'dotted-padded' };
    const idx: ClausulaIndex = {
      type: 'subclausula',
      index: 3,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, padOpts)).toBe('01.03 ');
  });

  it('formats parágrafo único', () => {
    const idx: ClausulaIndex = {
      type: 'paragrafo',
      index: 1,
      parentClausulaIndex: 1,
      isUnico: true,
    };
    expect(formatLabel(idx, opts)).toBe('Parágrafo Único. ');
  });

  it('formats parágrafo numbered extenso', () => {
    const idx: ClausulaIndex = {
      type: 'paragrafo',
      index: 2,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, opts)).toBe('Parágrafo Segundo. ');
  });

  it('formats parágrafo symbol', () => {
    const symOpts: ClausulaModuleOptions = { ...opts, paragrafoFormat: 'symbol' };
    const idx: ClausulaIndex = {
      type: 'paragrafo',
      index: 3,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, symOpts)).toBe('§3º. ');
  });

  it('formats parágrafo único with symbol format', () => {
    const symOpts: ClausulaModuleOptions = { ...opts, paragrafoFormat: 'symbol' };
    const idx: ClausulaIndex = {
      type: 'paragrafo',
      index: 1,
      parentClausulaIndex: 1,
      isUnico: true,
    };
    expect(formatLabel(idx, symOpts)).toBe('§ Único. ');
  });

  it('formats inciso roman', () => {
    const idx: ClausulaIndex = {
      type: 'inciso',
      index: 3,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, opts)).toBe('III — ');
  });

  it('formats inciso roman-lower', () => {
    const lowOpts: ClausulaModuleOptions = { ...opts, incisoFormat: 'roman-lower' };
    const idx: ClausulaIndex = {
      type: 'inciso',
      index: 4,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, lowOpts)).toBe('iv — ');
  });

  it('formats alínea letter-parenthesis', () => {
    const idx: ClausulaIndex = {
      type: 'alinea',
      index: 1,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, opts)).toBe('a) ');
  });

  it('formats alínea letter', () => {
    const letOpts: ClausulaModuleOptions = { ...opts, alineaFormat: 'letter' };
    const idx: ClausulaIndex = {
      type: 'alinea',
      index: 3,
      parentClausulaIndex: 1,
      isUnico: false,
    };
    expect(formatLabel(idx, letOpts)).toBe('c. ');
  });
});
