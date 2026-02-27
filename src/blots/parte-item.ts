import Quill from 'quill';
import ParteContainer from './parte-container.js';
import type { ParteType } from '../types.js';

const Block = Quill.import('blots/block') as any;

class ParteItem extends Block {
  static blotName = 'parte';
  static tagName = 'DIV' as const;
  static className = 'ql-parte-item';

  static create(value: ParteType) {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-parte-type', value);
    return node;
  }

  static formats(domNode: HTMLElement) {
    return domNode.getAttribute('data-parte-type') || undefined;
  }

  static register() {
    Quill.register(ParteContainer, true);
  }

  constructor(scroll: any, domNode: HTMLElement) {
    super(scroll, domNode);
    const ui = domNode.ownerDocument.createElement('span');
    ui.classList.add('ql-parte-prefix');
    this.attachUI(ui);
  }

  format(name: string, value: string) {
    if (name === ParteItem.blotName && value) {
      this.domNode.setAttribute('data-parte-type', value);
    } else {
      super.format(name, value);
    }
  }
}

ParteContainer.allowedChildren = [ParteItem];
ParteItem.requiredContainer = ParteContainer;

export default ParteItem;
