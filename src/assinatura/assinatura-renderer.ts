import type { AssinaturaConfig, SignatureLine } from '../types.js';

/**
 * Renders the signature block HTML from extracted names + config.
 */
export function renderAssinatura(
  lines: SignatureLine[],
  config: AssinaturaConfig,
): string {
  const parts: string[] = [];

  // Header: location and date
  const local = config.local || '[Local]';
  const data = config.dataAssinatura || '[Data]';
  parts.push(`<div class="ql-assinatura-header">${local}, ${data}</div>`);

  // Signature lines for each party
  for (const line of lines) {
    const roleLabel = line.role === 'contratante' ? 'CONTRATANTE' : 'CONTRATADO';
    parts.push(
      `<div class="ql-assinatura-line">` +
        `<div class="ql-assinatura-rule">____________________________________</div>` +
        `<div class="ql-assinatura-nome">${escapeHtml(line.nome)}</div>` +
        `<div class="ql-assinatura-role">${roleLabel}</div>` +
      `</div>`,
    );
  }

  // Witness lines
  const testemunhas = config.testemunhas ?? 2;
  if (testemunhas > 0) {
    parts.push(`<div class="ql-assinatura-testemunhas-header">TESTEMUNHAS:</div>`);
    for (let i = 1; i <= testemunhas; i++) {
      parts.push(
        `<div class="ql-assinatura-line">` +
          `<div class="ql-assinatura-rule">____________________________________</div>` +
          `<div class="ql-assinatura-nome">Testemunha ${i}</div>` +
          `<div class="ql-assinatura-role">Nome / CPF</div>` +
        `</div>`,
      );
    }
  }

  return parts.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
