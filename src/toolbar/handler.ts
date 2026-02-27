import type Quill from 'quill';

const CLAUSULA_OPTIONS = [
  { value: 'clausula', label: 'Cláusula' },
  { value: 'subclausula', label: 'Sub-cláusula' },
  { value: 'paragrafo', label: 'Parágrafo' },
  { value: 'inciso', label: 'Inciso' },
  { value: 'alinea', label: 'Alínea' },
  { value: '', label: 'Normal' },
];

export function clausulaHandler(this: { quill: Quill }, value: string) {
  this.quill.format('clausula', value || false);
}

export { CLAUSULA_OPTIONS };
