import type {
  ClausulaIndex,
  ClausulaModuleOptions,
} from '../types.js';
import { toExtenso, toExtensoUpper } from './extenso.js';
import { toRoman, toRomanLower } from './roman.js';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toLetter(n: number): string {
  // 1 -> a, 2 -> b, ... 26 -> z, 27 -> aa
  let result = '';
  let remaining = n;
  while (remaining > 0) {
    remaining--;
    result = String.fromCharCode(97 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }
  return result;
}

function formatClausula(index: number, format: ClausulaModuleOptions['clausulaFormat']): string {
  switch (format) {
    case 'extenso':
      return `CLÁUSULA ${toExtensoUpper(index, 'feminine')} — `;
    case 'numeric':
      return `CLÁUSULA ${index} — `;
    case 'numeric-padded':
      return `CLÁUSULA ${pad2(index)} — `;
    case 'ordinal':
      return `CLÁUSULA ${index}ª — `;
    case 'abbreviation':
      return `Cl. ${index} — `;
    case 'regular':
      return `Cláusula ${index} — `;
    case 'regular-padded':
      return `Cláusula ${pad2(index)} — `;
    default:
      return `CLÁUSULA ${index} — `;
  }
}

function formatSubclausula(
  index: number,
  parentIndex: number,
  format: ClausulaModuleOptions['subclausulaFormat'],
): string {
  switch (format) {
    case 'dotted':
      return `${parentIndex}.${index} `;
    case 'dotted-padded':
      return `${pad2(parentIndex)}.${pad2(index)} `;
    case 'numeric':
      return `${index}. `;
    case 'extenso':
      return `${toExtenso(index, 'feminine')} `;
    default:
      return `${parentIndex}.${index} `;
  }
}

function formatParagrafo(
  indexInfo: ClausulaIndex,
  format: ClausulaModuleOptions['paragrafoFormat'],
): string {
  if (indexInfo.isUnico) {
    switch (format) {
      case 'extenso':
        return 'Parágrafo Único. ';
      case 'uppercase':
        return 'PARÁGRAFO ÚNICO. ';
      case 'numeric':
        return 'Parágrafo Único. ';
      case 'symbol':
        return '§ Único. ';
      default:
        return 'Parágrafo Único. ';
    }
  }

  switch (format) {
    case 'extenso':
      return `Parágrafo ${toExtenso(indexInfo.index, 'masculine')}. `;
    case 'uppercase':
      return `PARÁGRAFO ${toExtensoUpper(indexInfo.index, 'masculine')}. `;
    case 'numeric':
      return `Parágrafo ${indexInfo.index}º. `;
    case 'symbol':
      return `§${indexInfo.index}º. `;
    default:
      return `Parágrafo ${indexInfo.index}º. `;
  }
}

function formatInciso(
  index: number,
  format: ClausulaModuleOptions['incisoFormat'],
): string {
  switch (format) {
    case 'roman':
      return `${toRoman(index)} — `;
    case 'roman-lower':
      return `${toRomanLower(index)} — `;
    default:
      return `${toRoman(index)} — `;
  }
}

function formatAlinea(
  index: number,
  format: ClausulaModuleOptions['alineaFormat'],
): string {
  const letter = toLetter(index);
  switch (format) {
    case 'letter-parenthesis':
      return `${letter}) `;
    case 'letter':
      return `${letter}. `;
    default:
      return `${letter}) `;
  }
}

export function formatLabel(
  indexInfo: ClausulaIndex,
  options: ClausulaModuleOptions,
): string {
  switch (indexInfo.type) {
    case 'clausula':
      return formatClausula(indexInfo.index, options.clausulaFormat);
    case 'subclausula':
      return formatSubclausula(
        indexInfo.index,
        indexInfo.parentClausulaIndex,
        options.subclausulaFormat,
      );
    case 'paragrafo':
      return formatParagrafo(indexInfo, options.paragrafoFormat);
    case 'inciso':
      return formatInciso(indexInfo.index, options.incisoFormat);
    case 'alinea':
      return formatAlinea(indexInfo.index, options.alineaFormat);
    default:
      return '';
  }
}
