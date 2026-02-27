import Quill from 'quill';
import ClausulaContainer from './clausula-container.js';
import type { ClausulaType } from '../types.js';

const Block = Quill.import('blots/block') as any;

class ClausulaItem extends Block {
  static blotName = 'clausula';
  static tagName = 'DIV' as const;
  static className = 'ql-clausula-item';

  actionsNode: HTMLElement | null = null;

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

  update(mutations: MutationRecord[], context: Record<string, any>) {
    // Filter out mutations that involve the actions container so Parchment
    // doesn't treat the buttons as document content (which would corrupt deltas).
    const filtered = mutations.filter((m) => {
      if (!this.actionsNode) return true;
      if (m.type === 'childList') {
        const addedHasActions = Array.from(m.addedNodes).some(
          (n) => n === this.actionsNode || (this.actionsNode && this.actionsNode.contains(n)),
        );
        const removedHasActions = Array.from(m.removedNodes).some(
          (n) => n === this.actionsNode || (this.actionsNode && this.actionsNode.contains(n)),
        );
        if (addedHasActions || removedHasActions) return false;
      }
      // Also ignore attribute mutations on the actions container itself
      if (m.target === this.actionsNode || (this.actionsNode && this.actionsNode.contains(m.target as Node))) {
        return false;
      }
      return true;
    });
    if (filtered.length > 0) {
      super.update(filtered, context);
    }
  }
}

ClausulaContainer.allowedChildren = [ClausulaItem];
ClausulaItem.requiredContainer = ClausulaContainer;

export default ClausulaItem;
