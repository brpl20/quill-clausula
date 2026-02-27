import Quill from 'quill';
import ClausulaContainer from './clausula-container.js';
import type { ClausulaType } from '../types.js';

const Block = Quill.import('blots/block') as any;

class ClausulaItem extends Block {
  static blotName = 'clausula';
  static tagName = 'DIV' as const;
  static className = 'ql-clausula-item';

  static create(value: ClausulaType) {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-clausula-type', value);
    return node;
  }

  static formats(domNode: HTMLElement) {
    return domNode.getAttribute('data-clausula-type') || undefined;
  }

  static register() {
    Quill.register(ClausulaContainer, true);
  }

  constructor(scroll: any, domNode: HTMLElement) {
    super(scroll, domNode);
    const ui = domNode.ownerDocument.createElement('span');
    ui.classList.add('ql-clausula-prefix');
    this.attachUI(ui);
  }

  format(name: string, value: string) {
    if (name === ClausulaItem.blotName && value) {
      this.domNode.setAttribute('data-clausula-type', value);
    } else {
      super.format(name, value);
    }
  }
}

ClausulaContainer.allowedChildren = [ClausulaItem];
ClausulaItem.requiredContainer = ClausulaContainer;

export default ClausulaItem;
