import Quill from 'quill';
import ClausulaModule from './module.js';
import ClausulaItem from './blots/clausula-item.js';
import ClausulaContainer from './blots/clausula-container.js';
import './styles/clausula.css';

export function register() {
  Quill.register('modules/clausula', ClausulaModule);
}

export { ClausulaModule, ClausulaItem, ClausulaContainer };
export type {
  ClausulaType,
  ClausulaFormat,
  SubclausulaFormat,
  ParagrafoFormat,
  IncisoFormat,
  AlineaFormat,
  ClausulaModuleOptions,
  ClausulaIndex,
} from './types.js';
export { toExtenso, toExtensoUpper } from './numbering/extenso.js';
export { toRoman, toRomanLower } from './numbering/roman.js';
export { computeIndices } from './numbering/counter.js';
export { formatLabel } from './numbering/formatter.js';
export { matchTrigger, AUTOFILL_PREFIX } from './autofill.js';
