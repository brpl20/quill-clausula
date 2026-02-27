import Quill from 'quill';
import type { AssinaturaConfig } from '../types.js';

const BlockEmbed = Quill.import('blots/block/embed') as any;

class AssinaturaEmbed extends BlockEmbed {
  static blotName = 'assinatura';
  static tagName = 'DIV' as const;
  static className = 'ql-assinatura-block';

  static create(value: AssinaturaConfig | string) {
    const node = super.create() as HTMLElement;
    const config = typeof value === 'string' ? JSON.parse(value) : (value || {});
    node.setAttribute('data-assinatura', JSON.stringify(config));
    node.setAttribute('contenteditable', 'false');
    return node;
  }

  static value(domNode: HTMLElement): AssinaturaConfig {
    const raw = domNode.getAttribute('data-assinatura');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  static formats(domNode: HTMLElement) {
    return undefined;
  }
}

export default AssinaturaEmbed;
