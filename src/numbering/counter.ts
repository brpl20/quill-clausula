import type { ClausulaIndex, ClausulaType } from '../types.js';

interface BlotLike {
  domNode: HTMLElement;
  next: BlotLike | null;
}

/**
 * 2-pass counter algorithm:
 *
 * Pass 1: Count parágrafos per cláusula to detect "Parágrafo Único"
 * Pass 2: Walk all items and compute indices
 */
export function computeIndices(items: BlotLike[]): ClausulaIndex[] {
  // Pass 1: count parágrafos per cláusula
  const paragrafoCountPerClausula: number[] = [];
  let currentClausula = -1;

  for (const item of items) {
    const type = item.domNode.getAttribute('data-clausula-type') as ClausulaType;
    if (type === 'clausula') {
      currentClausula++;
      paragrafoCountPerClausula.push(0);
    }
    if (type === 'paragrafo' && currentClausula >= 0) {
      paragrafoCountPerClausula[currentClausula]++;
    }
  }

  // Pass 2: compute indices
  const results: ClausulaIndex[] = [];
  let clausulaIdx = 0;
  let subclausulaIdx = 0;
  let paragrafoIdx = 0;
  let incisoIdx = 0;
  let alineaIdx = 0;

  for (const item of items) {
    const type = item.domNode.getAttribute('data-clausula-type') as ClausulaType;

    switch (type) {
      case 'clausula':
        clausulaIdx++;
        subclausulaIdx = 0;
        paragrafoIdx = 0;
        incisoIdx = 0;
        alineaIdx = 0;
        results.push({
          type,
          index: clausulaIdx,
          parentClausulaIndex: clausulaIdx,
          isUnico: false,
        });
        break;

      case 'subclausula':
        subclausulaIdx++;
        paragrafoIdx = 0;
        incisoIdx = 0;
        alineaIdx = 0;
        results.push({
          type,
          index: subclausulaIdx,
          parentClausulaIndex: clausulaIdx,
          isUnico: false,
        });
        break;

      case 'paragrafo':
        paragrafoIdx++;
        incisoIdx = 0;
        alineaIdx = 0;
        results.push({
          type,
          index: paragrafoIdx,
          parentClausulaIndex: clausulaIdx,
          isUnico:
            clausulaIdx > 0 &&
            paragrafoCountPerClausula[clausulaIdx - 1] === 1,
        });
        break;

      case 'inciso':
        incisoIdx++;
        alineaIdx = 0;
        results.push({
          type,
          index: incisoIdx,
          parentClausulaIndex: clausulaIdx,
          isUnico: false,
        });
        break;

      case 'alinea':
        alineaIdx++;
        results.push({
          type,
          index: alineaIdx,
          parentClausulaIndex: clausulaIdx,
          isUnico: false,
        });
        break;

      default:
        results.push({
          type: type || 'clausula',
          index: 1,
          parentClausulaIndex: clausulaIdx,
          isUnico: false,
        });
    }
  }

  return results;
}
