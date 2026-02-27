import { Attributor, Scope } from 'parchment';

class AgreedAttributor extends Attributor {
  add(node: HTMLElement, value: Record<string, boolean> | string) {
    const normalized = typeof value === 'string' ? JSON.parse(value) : value;
    node.setAttribute('data-agreed', JSON.stringify(normalized));

    const allAgreed = Object.keys(normalized).length > 0
      && Object.values(normalized).every(Boolean);
    node.classList.toggle('ql-agreed', allAgreed);

    return true;
  }

  remove(node: HTMLElement) {
    node.removeAttribute('data-agreed');
    node.classList.remove('ql-agreed');
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
