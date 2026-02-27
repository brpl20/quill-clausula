export type ClausulaType =
  | 'clausula'
  | 'subclausula'
  | 'paragrafo'
  | 'inciso'
  | 'alinea';

export type ClausulaFormat =
  | 'extenso'
  | 'numeric'
  | 'numeric-padded'
  | 'ordinal'
  | 'abbreviation'
  | 'regular'
  | 'regular-padded';

export type SubclausulaFormat = 'dotted' | 'dotted-padded' | 'numeric' | 'extenso';

export type ParagrafoFormat = 'extenso' | 'uppercase' | 'numeric' | 'symbol';

export type IncisoFormat = 'roman' | 'roman-lower';

export type AlineaFormat = 'letter-parenthesis' | 'letter';

export interface ConversationContext {
  /** The clausula type (clausula, subclausula, paragrafo, etc.) */
  type: ClausulaType;
  /** The text content of the clausula item */
  text: string;
  /** The DOM element of the clausula item */
  domNode: HTMLElement;
  /** The current user, if set */
  currentUser?: string;
}

export interface ClausulaModuleOptions {
  clausulaFormat: ClausulaFormat;
  subclausulaFormat: SubclausulaFormat;
  paragrafoFormat: ParagrafoFormat;
  incisoFormat: IncisoFormat;
  alineaFormat: AlineaFormat;
  currentUser?: string;
  users?: string[];
  showActions?: boolean;
  showFloatingBar?: boolean;
  /** Callback invoked when the conversation button is clicked on a clausula item */
  onConversation?: (context: ConversationContext) => void;
  /** Callback invoked when the AI Judge button is clicked */
  onJudge?: () => void;
  /** Callback invoked when the Share button is clicked */
  onShare?: () => void;
  /** Callback invoked when the Sign button is clicked */
  onSign?: () => void;
}

export interface ClausulaIndex {
  type: ClausulaType;
  /** 1-based index within its parent scope */
  index: number;
  /** Parent cláusula 1-based index (for subclausula dotted format) */
  parentClausulaIndex: number;
  /** Whether this is the only parágrafo under its parent cláusula */
  isUnico: boolean;
}

export const CLAUSULA_TYPES: ClausulaType[] = [
  'clausula',
  'subclausula',
  'paragrafo',
  'inciso',
  'alinea',
];

export const HIERARCHY: Record<ClausulaType, number> = {
  clausula: 0,
  subclausula: 1,
  paragrafo: 1,
  inciso: 2,
  alinea: 3,
};

/** Tab promotes to next-deeper type; Shift+Tab demotes to next-shallower */
export const PROMOTE_ORDER: ClausulaType[] = [
  'clausula',
  'subclausula',
  'paragrafo',
  'inciso',
  'alinea',
];

/* ── Parte (contract party) types ── */

export type ParteType = 'contratante' | 'contratado';

export interface ParteIndex {
  type: ParteType;
  /** 1-based index within its role (1st contratante, 2nd contratante, etc.) */
  index: number;
  /** Total count of parties with the same role */
  total: number;
}

/* ── Assinatura (signature) types ── */

export interface AssinaturaConfig {
  local?: string;
  dataAssinatura?: string;
  testemunhas?: number;
}

export interface SignatureLine {
  nome: string;
  role: ParteType;
}

export const DEFAULT_OPTIONS: ClausulaModuleOptions = {
  clausulaFormat: 'extenso',
  subclausulaFormat: 'dotted',
  paragrafoFormat: 'extenso',
  incisoFormat: 'roman',
  alineaFormat: 'letter-parenthesis',
  showActions: true,
  showFloatingBar: true,
};
