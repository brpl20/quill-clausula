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

const PARTE_TEMPLATE =
  '[NOME COMPLETO], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], ' +
  'inscrito(a) no CPF sob o nº [CPF], RG nº [RG], ' +
  'residente e domiciliado(a) em [ENDEREÇO COMPLETO]';

export function parteHandler(this: { quill: Quill }, value: string) {
  if (!value) {
    this.quill.format('parte', false);
    return;
  }

  // Apply the parte format
  this.quill.format('parte', value);

  // If the current line is empty, insert the template text
  const range = this.quill.getSelection();
  if (range) {
    const [line] = (this.quill as any).getLine(range.index);
    if (line) {
      const uiNode = line.domNode.querySelector('.ql-ui');
      let text = line.domNode.textContent || '';
      if (uiNode && uiNode.textContent) {
        text = text.replace(uiNode.textContent, '');
      }
      if (text.trim() === '') {
        this.quill.insertText(range.index, PARTE_TEMPLATE, 'user' as any);
      }
    }
  }
}

export function objetoHandler(this: { quill: Quill }, value: string) {
  this.quill.format('objeto', value || false);
}

export function assinaturaHandler(this: { quill: Quill }) {
  const quill = this.quill as any;
  const range = quill.getSelection(true);
  if (!range) return;

  // Insert the assinatura embed at the end of the document
  const length = quill.getLength();
  quill.insertEmbed(length - 1, 'assinatura', {}, 'user');
  quill.setSelection(length, 0, 'silent');
}

export { CLAUSULA_OPTIONS };
