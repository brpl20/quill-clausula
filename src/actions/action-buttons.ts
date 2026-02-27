import { HIERARCHY } from '../types.js';
import type { ClausulaType } from '../types.js';

const LOCK_SVG = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>`;
const AGREE_SVG = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg>`;
const DISAGREE_SVG = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>`;

export function createActionButtons(doc: Document): HTMLDivElement {
  const container = doc.createElement('div');
  container.className = 'ql-clausula-actions';
  container.setAttribute('contenteditable', 'false');

  const lockBtn = doc.createElement('button');
  lockBtn.className = 'ql-clausula-btn ql-clausula-lock';
  lockBtn.setAttribute('tabindex', '-1');
  lockBtn.setAttribute('type', 'button');
  lockBtn.setAttribute('title', 'Lock');
  lockBtn.innerHTML = LOCK_SVG;

  const agreeBtn = doc.createElement('button');
  agreeBtn.className = 'ql-clausula-btn ql-clausula-agree';
  agreeBtn.setAttribute('tabindex', '-1');
  agreeBtn.setAttribute('type', 'button');
  agreeBtn.setAttribute('title', 'Agree');
  agreeBtn.innerHTML = AGREE_SVG;

  const disagreeBtn = doc.createElement('button');
  disagreeBtn.className = 'ql-clausula-btn ql-clausula-disagree';
  disagreeBtn.setAttribute('tabindex', '-1');
  disagreeBtn.setAttribute('type', 'button');
  disagreeBtn.setAttribute('title', 'Disagree');
  disagreeBtn.innerHTML = DISAGREE_SVG;

  container.appendChild(lockBtn);
  container.appendChild(agreeBtn);
  container.appendChild(disagreeBtn);

  return container;
}

export function syncButtonState(
  actionsContainer: HTMLElement,
  domNode: HTMLElement,
  currentUser: string | undefined,
  users: string[] | undefined,
  children?: HTMLElement[],
): void {
  const lockBtn = actionsContainer.querySelector('.ql-clausula-lock') as HTMLButtonElement | null;
  const agreeBtn = actionsContainer.querySelector('.ql-clausula-agree') as HTMLButtonElement | null;
  const disagreeBtn = actionsContainer.querySelector('.ql-clausula-disagree') as HTMLButtonElement | null;
  if (!lockBtn || !agreeBtn || !disagreeBtn) return;

  const isLocked = domNode.classList.contains('ql-locked-true');
  lockBtn.classList.toggle('active', isLocked);

  // Disable agree/disagree on locked items
  agreeBtn.disabled = isLocked;
  disagreeBtn.disabled = isLocked;

  if (!currentUser) {
    agreeBtn.classList.remove('active');
    disagreeBtn.classList.remove('active');
    return;
  }

  const type = domNode.getAttribute('data-clausula-type') as ClausulaType | null;
  const isParent = type ? HIERARCHY[type] === 0 : false;

  if (isParent && children && children.length > 0) {
    // Parent clausula: agreed when ALL children have ALL users agreed
    const allUsers = users || [currentUser];
    const allAgreed = children.every((child) => {
      const raw = child.getAttribute('data-agreed');
      if (!raw) return false;
      try {
        const agreed = JSON.parse(raw) as Record<string, boolean>;
        return allUsers.every((u) => agreed[u] === true);
      } catch {
        return false;
      }
    });
    agreeBtn.classList.toggle('active', allAgreed);
    disagreeBtn.classList.toggle('active', false);
    domNode.classList.toggle('ql-agreed', allAgreed);
  } else {
    // Child or standalone: check own data-agreed
    const raw = domNode.getAttribute('data-agreed');
    let userAgreed = false;
    if (raw) {
      try {
        const agreed = JSON.parse(raw) as Record<string, boolean>;
        userAgreed = agreed[currentUser] === true;
      } catch {
        // ignore
      }
    }
    agreeBtn.classList.toggle('active', userAgreed);
    disagreeBtn.classList.toggle('active', false);
  }
}
