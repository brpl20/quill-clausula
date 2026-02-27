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

export interface ClausulaModuleOptions {
  clausulaFormat: ClausulaFormat;
  subclausulaFormat: SubclausulaFormat;
  paragrafoFormat: ParagrafoFormat;
  incisoFormat: IncisoFormat;
  alineaFormat: AlineaFormat;
  currentUser?: string;
  users?: string[];
  showActions?: boolean;
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

export const DEFAULT_OPTIONS: ClausulaModuleOptions = {
  clausulaFormat: 'extenso',
  subclausulaFormat: 'dotted',
  paragrafoFormat: 'extenso',
  incisoFormat: 'roman',
  alineaFormat: 'letter-parenthesis',
  showActions: true,
};
