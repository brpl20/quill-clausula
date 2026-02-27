import Quill from 'quill';
import ObjetoContainer from './objeto-container.js';

const Block = Quill.import('blots/block') as any;

class ObjetoItem extends Block {
  static blotName = 'objeto';
  static tagName = 'DIV' as const;
  static className = 'ql-objeto-item';

  static create(value: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-objeto', 'true');
    return node;
  }

  static formats(domNode: HTMLElement) {
    return domNode.getAttribute('data-objeto') ? 'true' : undefined;
  }

  static register() {
    Quill.register(ObjetoContainer, true);
  }

  constructor(scroll: any, domNode: HTMLElement) {
    super(scroll, domNode);
    const ui = domNode.ownerDocument.createElement('span');
    ui.classList.add('ql-objeto-prefix');
    ui.textContent = 'OBJETO: ';
    this.attachUI(ui);
  }

  format(name: string, value: string) {
    if (name === ObjetoItem.blotName && value) {
      this.domNode.setAttribute('data-objeto', 'true');
    } else {
      super.format(name, value);
    }
  }
}

ObjetoContainer.allowedChildren = [ObjetoItem];
ObjetoItem.requiredContainer = ObjetoContainer;

export default ObjetoItem;
