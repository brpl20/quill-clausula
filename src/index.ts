import Quill from 'quill';
import ClausulaModule from './module.js';
import ClausulaItem from './blots/clausula-item.js';
import ClausulaContainer from './blots/clausula-container.js';
import ParteItem from './blots/parte-item.js';
import ParteContainer from './blots/parte-container.js';
import ObjetoItem from './blots/objeto-item.js';
import ObjetoContainer from './blots/objeto-container.js';
import AssinaturaEmbed from './blots/assinatura-embed.js';
import LockedAttribute from './formats/locked.js';
import AgreedAttribute from './formats/agreed.js';
import './styles/clausula.css';

export function register() {
  Quill.register('modules/clausula', ClausulaModule);
}

export { createActionButtons, syncButtonState } from './actions/action-buttons.js';
export { createFloatingBar, createUndoModal, isContractFullyAgreed } from './actions/floating-bar.js';
export {
  ClausulaModule,
  ClausulaItem,
  ClausulaContainer,
  ParteItem,
  ParteContainer,
  ObjetoItem,
  ObjetoContainer,
  AssinaturaEmbed,
  LockedAttribute,
  AgreedAttribute,
};
export type {
  ClausulaType,
  ClausulaFormat,
  SubclausulaFormat,
  ParagrafoFormat,
  IncisoFormat,
  AlineaFormat,
  ClausulaModuleOptions,
  ClausulaIndex,
  ConversationContext,
  ParteType,
  ParteIndex,
  AssinaturaConfig,
  SignatureLine,
} from './types.js';
export { toExtenso, toExtensoUpper } from './numbering/extenso.js';
export { toRoman, toRomanLower } from './numbering/roman.js';
export { computeIndices } from './numbering/counter.js';
export { formatLabel } from './numbering/formatter.js';
export { computeParteIndices, formatParteLabel } from './partes/partes-counter.js';
export { extractSignatureLines } from './assinatura/assinatura-sync.js';
export { renderAssinatura } from './assinatura/assinatura-renderer.js';
export { matchTrigger, matchExtraTrigger, AUTOFILL_PREFIX } from './autofill.js';
