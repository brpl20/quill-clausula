import { describe, it, expect } from 'vitest';
import { computeIndices } from '../src/numbering/counter.js';

function makeItem(type: string) {
  // Minimal mock matching the BlotLike interface
  const domNode = {
    getAttribute: (name: string) => (name === 'data-clausula-type' ? type : null),
  } as unknown as HTMLElement;
  return { domNode, next: null };
}

describe('Counter — computeIndices', () => {
  it('numbers sequential cláusulas', () => {
    const items = [makeItem('clausula'), makeItem('clausula'), makeItem('clausula')];
    const result = computeIndices(items);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ type: 'clausula', index: 1 });
    expect(result[1]).toMatchObject({ type: 'clausula', index: 2 });
    expect(result[2]).toMatchObject({ type: 'clausula', index: 3 });
  });

  it('numbers subcláusulas relative to parent', () => {
    const items = [
      makeItem('clausula'),
      makeItem('subclausula'),
      makeItem('subclausula'),
      makeItem('clausula'),
      makeItem('subclausula'),
    ];
    const result = computeIndices(items);

    expect(result[1]).toMatchObject({
      type: 'subclausula',
      index: 1,
      parentClausulaIndex: 1,
    });
    expect(result[2]).toMatchObject({
      type: 'subclausula',
      index: 2,
      parentClausulaIndex: 1,
    });
    expect(result[4]).toMatchObject({
      type: 'subclausula',
      index: 1,
      parentClausulaIndex: 2,
    });
  });

  it('detects Parágrafo Único (single parágrafo under cláusula)', () => {
    const items = [
      makeItem('clausula'),
      makeItem('paragrafo'), // only one → Único
    ];
    const result = computeIndices(items);

    expect(result[1]).toMatchObject({
      type: 'paragrafo',
      index: 1,
      isUnico: true,
    });
  });

  it('does NOT mark as Único when multiple parágrafos', () => {
    const items = [
      makeItem('clausula'),
      makeItem('paragrafo'),
      makeItem('paragrafo'),
    ];
    const result = computeIndices(items);

    expect(result[1]).toMatchObject({ type: 'paragrafo', index: 1, isUnico: false });
    expect(result[2]).toMatchObject({ type: 'paragrafo', index: 2, isUnico: false });
  });

  it('Parágrafo Único is per-cláusula', () => {
    const items = [
      makeItem('clausula'),
      makeItem('paragrafo'), // Único (only one under clausula 1)
      makeItem('clausula'),
      makeItem('paragrafo'), // not Único
      makeItem('paragrafo'),
    ];
    const result = computeIndices(items);

    expect(result[1]).toMatchObject({ isUnico: true });
    expect(result[3]).toMatchObject({ isUnico: false });
    expect(result[4]).toMatchObject({ isUnico: false });
  });

  it('numbers incisos and alíneas', () => {
    const items = [
      makeItem('clausula'),
      makeItem('paragrafo'),
      makeItem('inciso'),
      makeItem('inciso'),
      makeItem('alinea'),
      makeItem('alinea'),
      makeItem('alinea'),
    ];
    const result = computeIndices(items);

    expect(result[2]).toMatchObject({ type: 'inciso', index: 1 });
    expect(result[3]).toMatchObject({ type: 'inciso', index: 2 });
    expect(result[4]).toMatchObject({ type: 'alinea', index: 1 });
    expect(result[5]).toMatchObject({ type: 'alinea', index: 2 });
    expect(result[6]).toMatchObject({ type: 'alinea', index: 3 });
  });

  it('resets inciso count when a new parágrafo starts', () => {
    const items = [
      makeItem('clausula'),
      makeItem('paragrafo'),
      makeItem('inciso'),
      makeItem('inciso'),
      makeItem('paragrafo'),
      makeItem('inciso'), // resets to 1
    ];
    const result = computeIndices(items);

    expect(result[2]).toMatchObject({ type: 'inciso', index: 1 });
    expect(result[3]).toMatchObject({ type: 'inciso', index: 2 });
    expect(result[5]).toMatchObject({ type: 'inciso', index: 1 });
  });

  it('resets alínea count when a new inciso starts', () => {
    const items = [
      makeItem('clausula'),
      makeItem('inciso'),
      makeItem('alinea'),
      makeItem('alinea'),
      makeItem('inciso'),
      makeItem('alinea'), // resets
    ];
    const result = computeIndices(items);

    expect(result[2]).toMatchObject({ type: 'alinea', index: 1 });
    expect(result[3]).toMatchObject({ type: 'alinea', index: 2 });
    expect(result[5]).toMatchObject({ type: 'alinea', index: 1 });
  });

  it('handles empty array', () => {
    expect(computeIndices([])).toEqual([]);
  });

  it('handles full hierarchy', () => {
    const items = [
      makeItem('clausula'),
      makeItem('subclausula'),
      makeItem('subclausula'),
      makeItem('paragrafo'),
      makeItem('inciso'),
      makeItem('inciso'),
      makeItem('alinea'),
      makeItem('alinea'),
      makeItem('clausula'),
      makeItem('subclausula'),
    ];
    const result = computeIndices(items);

    expect(result).toHaveLength(10);
    expect(result[0]).toMatchObject({ type: 'clausula', index: 1 });
    expect(result[1]).toMatchObject({ type: 'subclausula', index: 1, parentClausulaIndex: 1 });
    expect(result[2]).toMatchObject({ type: 'subclausula', index: 2, parentClausulaIndex: 1 });
    expect(result[3]).toMatchObject({ type: 'paragrafo', index: 1, isUnico: true });
    expect(result[4]).toMatchObject({ type: 'inciso', index: 1 });
    expect(result[5]).toMatchObject({ type: 'inciso', index: 2 });
    expect(result[6]).toMatchObject({ type: 'alinea', index: 1 });
    expect(result[7]).toMatchObject({ type: 'alinea', index: 2 });
    expect(result[8]).toMatchObject({ type: 'clausula', index: 2 });
    expect(result[9]).toMatchObject({ type: 'subclausula', index: 1, parentClausulaIndex: 2 });
  });

  it('continuous cláusula numbering across gaps (items from separate containers)', () => {
    // Simulates: Cl.1, Cl.2, Cl.3 — [plain paragraph gap] — Cl.4
    // When renumber() collects items from all containers into one array,
    // the cláusula count must NOT reset.
    const items = [
      // Container 1
      makeItem('clausula'),
      makeItem('subclausula'),
      makeItem('clausula'),
      makeItem('clausula'),
      // Gap (plain paragraph — not in the items array, it's in a different blot)
      // Container 2
      makeItem('clausula'),
      makeItem('subclausula'),
    ];
    const result = computeIndices(items);

    expect(result[0]).toMatchObject({ type: 'clausula', index: 1 });
    expect(result[1]).toMatchObject({ type: 'subclausula', index: 1, parentClausulaIndex: 1 });
    expect(result[2]).toMatchObject({ type: 'clausula', index: 2 });
    expect(result[3]).toMatchObject({ type: 'clausula', index: 3 });
    // After the gap — continues at 4, not 1
    expect(result[4]).toMatchObject({ type: 'clausula', index: 4 });
    expect(result[5]).toMatchObject({ type: 'subclausula', index: 1, parentClausulaIndex: 4 });
  });
});
