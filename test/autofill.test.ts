import { describe, it, expect } from 'vitest';
import { matchTrigger, AUTOFILL_PREFIX } from '../src/autofill.js';

describe('Autofill — matchTrigger', () => {
  // Cláusula triggers
  it.each([
    ['cl', 'clausula'],
    ['CL', 'clausula'],
    ['Cl', 'clausula'],
    ['cláusula', 'clausula'],
    ['clausula', 'clausula'],
    ['CLÁUSULA', 'clausula'],
    ['Cláusula', 'clausula'],
    ['Clausula', 'clausula'],
  ])('"%s" → %s', (input, expected) => {
    expect(matchTrigger(input)).toBe(expected);
  });

  // Sub-cláusula triggers
  it.each([
    ['sub', 'subclausula'],
    ['SUB', 'subclausula'],
    ['Sub', 'subclausula'],
    ['subcláusula', 'subclausula'],
    ['subclausula', 'subclausula'],
    ['SUBCLÁUSULA', 'subclausula'],
    ['sub-cláusula', 'subclausula'],
    ['sub-clausula', 'subclausula'],
    ['Sub Cláusula', 'subclausula'],
  ])('"%s" → %s', (input, expected) => {
    expect(matchTrigger(input)).toBe(expected);
  });

  // Parágrafo triggers
  it.each([
    ['§', 'paragrafo'],
    ['par', 'paragrafo'],
    ['PAR', 'paragrafo'],
    ['Par', 'paragrafo'],
    ['parágrafo', 'paragrafo'],
    ['paragrafo', 'paragrafo'],
    ['PARÁGRAFO', 'paragrafo'],
  ])('"%s" → %s', (input, expected) => {
    expect(matchTrigger(input)).toBe(expected);
  });

  // Inciso triggers
  it.each([
    ['inc', 'inciso'],
    ['INC', 'inciso'],
    ['Inc', 'inciso'],
    ['inciso', 'inciso'],
    ['INCISO', 'inciso'],
  ])('"%s" → %s', (input, expected) => {
    expect(matchTrigger(input)).toBe(expected);
  });

  // Alínea triggers
  it.each([
    ['al', 'alinea'],
    ['AL', 'alinea'],
    ['Al', 'alinea'],
    ['alínea', 'alinea'],
    ['alinea', 'alinea'],
    ['ALÍNEA', 'alinea'],
  ])('"%s" → %s', (input, expected) => {
    expect(matchTrigger(input)).toBe(expected);
  });

  // Non-matches
  it.each([
    ['hello'],
    ['clause'],
    ['paragraph'],
    [''],
    ['c'],
    ['s'],
    ['p'],
    ['i'],
    ['a'],
    ['clau'],
    ['para'],
    ['aline'],
  ])('"%s" → null', (input) => {
    expect(matchTrigger(input)).toBeNull();
  });
});

describe('Autofill — AUTOFILL_PREFIX regex', () => {
  it('matches trigger words at the start of a line', () => {
    expect(AUTOFILL_PREFIX.test('cl')).toBe(true);
    expect(AUTOFILL_PREFIX.test('CLÁUSULA')).toBe(true);
    expect(AUTOFILL_PREFIX.test('§')).toBe(true);
    expect(AUTOFILL_PREFIX.test('sub')).toBe(true);
    expect(AUTOFILL_PREFIX.test('par')).toBe(true);
    expect(AUTOFILL_PREFIX.test('inc')).toBe(true);
    expect(AUTOFILL_PREFIX.test('al')).toBe(true);
  });

  it('matches with leading whitespace', () => {
    expect(AUTOFILL_PREFIX.test(' cl')).toBe(true);
    expect(AUTOFILL_PREFIX.test('  §')).toBe(true);
  });

  it('does not match random text', () => {
    expect(AUTOFILL_PREFIX.test('hello')).toBe(false);
    expect(AUTOFILL_PREFIX.test('some text cl')).toBe(false);
  });
});
