import { describe, it, expect } from 'vitest';
import { computeParteIndices, formatParteLabel } from '../src/partes/partes-counter.js';
import type { ParteIndex } from '../src/types.js';

function makeBlot(type: string) {
  const domNode = {
    getAttribute: (name: string) => (name === 'data-parte-type' ? type : null),
  } as unknown as HTMLElement;
  return { domNode };
}

describe('computeParteIndices', () => {
  it('returns empty for no items', () => {
    expect(computeParteIndices([])).toEqual([]);
  });

  it('single contratante: total=1, index=1', () => {
    const items = [makeBlot('contratante')];
    const result = computeParteIndices(items);
    expect(result).toEqual([
      { type: 'contratante', index: 1, total: 1 },
    ]);
  });

  it('two contratantes: numbered 1 and 2', () => {
    const items = [makeBlot('contratante'), makeBlot('contratante')];
    const result = computeParteIndices(items);
    expect(result).toEqual([
      { type: 'contratante', index: 1, total: 2 },
      { type: 'contratante', index: 2, total: 2 },
    ]);
  });

  it('mixed roles: independent counting', () => {
    const items = [
      makeBlot('contratante'),
      makeBlot('contratado'),
      makeBlot('contratante'),
      makeBlot('contratado'),
    ];
    const result = computeParteIndices(items);
    expect(result).toEqual([
      { type: 'contratante', index: 1, total: 2 },
      { type: 'contratado', index: 1, total: 2 },
      { type: 'contratante', index: 2, total: 2 },
      { type: 'contratado', index: 2, total: 2 },
    ]);
  });

  it('single contratado and single contratante', () => {
    const items = [makeBlot('contratante'), makeBlot('contratado')];
    const result = computeParteIndices(items);
    expect(result).toEqual([
      { type: 'contratante', index: 1, total: 1 },
      { type: 'contratado', index: 1, total: 1 },
    ]);
  });
});

describe('formatParteLabel', () => {
  it('single contratante: no ordinal', () => {
    const info: ParteIndex = { type: 'contratante', index: 1, total: 1 };
    expect(formatParteLabel(info)).toBe('CONTRATANTE: ');
  });

  it('single contratado: no ordinal', () => {
    const info: ParteIndex = { type: 'contratado', index: 1, total: 1 };
    expect(formatParteLabel(info)).toBe('CONTRATADO: ');
  });

  it('2+ contratantes: shows ordinal', () => {
    expect(formatParteLabel({ type: 'contratante', index: 1, total: 2 })).toBe('1º CONTRATANTE: ');
    expect(formatParteLabel({ type: 'contratante', index: 2, total: 2 })).toBe('2º CONTRATANTE: ');
  });

  it('2+ contratados: shows ordinal', () => {
    expect(formatParteLabel({ type: 'contratado', index: 1, total: 3 })).toBe('1º CONTRATADO: ');
    expect(formatParteLabel({ type: 'contratado', index: 3, total: 3 })).toBe('3º CONTRATADO: ');
  });
});
