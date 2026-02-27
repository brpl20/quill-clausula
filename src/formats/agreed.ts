import { Attributor, Scope } from 'parchment';

class AgreedAttributor extends Attributor {
  add(node: HTMLElement, value: Record<string, boolean> | string) {
    const normalized = typeof value === 'string' ? JSON.parse(value) : value;
    node.setAttribute('data-agreed', JSON.stringify(normalized));

    const values = Object.values(normalized);
    const allAgreed = values.length > 0 && values.every(Boolean);
    const anyDisagreed = values.some((v) => v === false);
    node.classList.toggle('ql-agreed', allAgreed);
    node.classList.toggle('ql-disagreed', anyDisagreed);

    return true;
  }

  remove(node: HTMLElement) {
    node.removeAttribute('data-agreed');
    node.classList.remove('ql-agreed');
    node.classList.remove('ql-disagreed');
  }

  value(node: HTMLElement): Record<string, boolean> | undefined {
    const raw = node.getAttribute('data-agreed');
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
}

const Agreed = new AgreedAttributor('agreed', 'data-agreed', {
  scope: Scope.BLOCK,
});

export default Agreed;
