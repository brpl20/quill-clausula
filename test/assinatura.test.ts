import { describe, it, expect } from 'vitest';
import { extractSignatureLines } from '../src/assinatura/assinatura-sync.js';
import { renderAssinatura } from '../src/assinatura/assinatura-renderer.js';
import type { SignatureLine, AssinaturaConfig } from '../src/types.js';

/**
 * Minimal mock for a parte blot DOM node.
 * `textContent` returns the prefix + text, `querySelector('.ql-ui')` returns a
 * mock UI node whose `textContent` is the prefix label.
 */
function makeParteBlot(type: string, text: string, prefix = '') {
  const uiNode = { textContent: prefix };
  const domNode = {
    getAttribute: (name: string) => (name === 'data-parte-type' ? type : null),
    textContent: prefix + text,
    querySelector: (sel: string) => (sel === '.ql-ui' ? uiNode : null),
  } as unknown as HTMLElement;
  return { domNode };
}

describe('extractSignatureLines', () => {
  it('returns empty for no items', () => {
    expect(extractSignatureLines([])).toEqual([]);
  });

  it('extracts name before first comma', () => {
    const items = [
      makeParteBlot('contratante', 'João da Silva, brasileiro, casado', 'CONTRATANTE: '),
    ];
    const lines = extractSignatureLines(items);
    expect(lines).toEqual([
      { nome: 'João da Silva', role: 'contratante' },
    ]);
  });

  it('uses full text when no comma present', () => {
    const items = [makeParteBlot('contratado', 'Maria Oliveira', 'CONTRATADO: ')];
    const lines = extractSignatureLines(items);
    expect(lines).toEqual([
      { nome: 'Maria Oliveira', role: 'contratado' },
    ]);
  });

  it('extracts multiple parties', () => {
    const items = [
      makeParteBlot('contratante', 'João da Silva, brasileiro', 'CONTRATANTE: '),
      makeParteBlot('contratado', 'Maria Oliveira, brasileira', 'CONTRATADO: '),
    ];
    const lines = extractSignatureLines(items);
    expect(lines).toHaveLength(2);
    expect(lines[0].nome).toBe('João da Silva');
    expect(lines[0].role).toBe('contratante');
    expect(lines[1].nome).toBe('Maria Oliveira');
    expect(lines[1].role).toBe('contratado');
  });

  it('skips items with empty text', () => {
    const items = [makeParteBlot('contratante', '', 'CONTRATANTE: ')];
    const lines = extractSignatureLines(items);
    expect(lines).toEqual([]);
  });
});

describe('renderAssinatura', () => {
  it('renders empty with no lines', () => {
    const html = renderAssinatura([], {});
    expect(html).toContain('[Local]');
    expect(html).toContain('[Data]');
    expect(html).toContain('TESTEMUNHAS:');
  });

  it('renders signature lines for each party', () => {
    const lines: SignatureLine[] = [
      { nome: 'João da Silva', role: 'contratante' },
      { nome: 'Maria Oliveira', role: 'contratado' },
    ];
    const config: AssinaturaConfig = {
      local: 'São Paulo/SP',
      dataAssinatura: '27 de fevereiro de 2026',
      testemunhas: 2,
    };
    const html = renderAssinatura(lines, config);

    expect(html).toContain('São Paulo/SP');
    expect(html).toContain('27 de fevereiro de 2026');
    expect(html).toContain('João da Silva');
    expect(html).toContain('CONTRATANTE');
    expect(html).toContain('Maria Oliveira');
    expect(html).toContain('CONTRATADO');
    expect(html).toContain('Testemunha 1');
    expect(html).toContain('Testemunha 2');
  });

  it('renders without witnesses when testemunhas=0', () => {
    const lines: SignatureLine[] = [
      { nome: 'João', role: 'contratante' },
    ];
    const html = renderAssinatura(lines, { testemunhas: 0 });
    expect(html).not.toContain('TESTEMUNHAS:');
    expect(html).not.toContain('Testemunha 1');
  });

  it('escapes HTML in names', () => {
    const lines: SignatureLine[] = [
      { nome: '<script>alert("xss")</script>', role: 'contratante' },
    ];
    const html = renderAssinatura(lines, { testemunhas: 0 });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
