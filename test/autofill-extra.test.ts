import { describe, it, expect } from 'vitest';
import { matchExtraTrigger, AUTOFILL_PREFIX } from '../src/autofill.js';

describe('Autofill — matchExtraTrigger', () => {
  it.each([
    ['contratante', { format: 'parte', value: 'contratante' }],
    ['CONTRATANTE', { format: 'parte', value: 'contratante' }],
    ['Contratante', { format: 'parte', value: 'contratante' }],
    ['contratado', { format: 'parte', value: 'contratado' }],
    ['CONTRATADO', { format: 'parte', value: 'contratado' }],
    ['Contratado', { format: 'parte', value: 'contratado' }],
    ['objeto', { format: 'objeto', value: 'true' }],
    ['OBJETO', { format: 'objeto', value: 'true' }],
    ['Objeto', { format: 'objeto', value: 'true' }],
  ])('"%s" → %j', (input, expected) => {
    expect(matchExtraTrigger(input)).toEqual(expected);
  });

  it.each([
    ['hello'],
    ['cl'],
    ['par'],
    [''],
    ['contra'],
    ['obj'],
  ])('"%s" → null', (input) => {
    expect(matchExtraTrigger(input)).toBeNull();
  });
});

describe('Autofill — AUTOFILL_PREFIX regex includes new triggers', () => {
  it('matches contratante, contratado, objeto', () => {
    expect(AUTOFILL_PREFIX.test('contratante')).toBe(true);
    expect(AUTOFILL_PREFIX.test('contratado')).toBe(true);
    expect(AUTOFILL_PREFIX.test('objeto')).toBe(true);
    expect(AUTOFILL_PREFIX.test('CONTRATANTE')).toBe(true);
    expect(AUTOFILL_PREFIX.test('CONTRATADO')).toBe(true);
    expect(AUTOFILL_PREFIX.test('OBJETO')).toBe(true);
  });

  it('still matches existing clausula triggers', () => {
    expect(AUTOFILL_PREFIX.test('cl')).toBe(true);
    expect(AUTOFILL_PREFIX.test('§')).toBe(true);
    expect(AUTOFILL_PREFIX.test('sub')).toBe(true);
  });
});
