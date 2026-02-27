import { HIERARCHY } from '../types.js';
import type { ClausulaType } from '../types.js';

// ── SVG Icons ──

const UNDO_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`;

const AGREE_ALL_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg>`;

const DISAGREE_ALL_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

const LOCK_ALL_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

const JUDGE_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="12" x2="5" y2="16"/><line x1="19" y1="12" x2="19" y2="16"/><line x1="12" y1="12" x2="12" y2="20"/><rect x="8" y="20" width="8" height="2" rx="1"/></svg>`;

const SHARE_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

const SIGN_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-10 10H7v-4L17 3z"/><path d="M2 21h20"/><path d="M14 7l4 4"/></svg>`;

export interface FloatingBarCallbacks {
  onUndo?: () => void;
  onAgreeAll?: () => void;
  onDisagreeAll?: () => void;
  onLockAll?: () => void;
  onJudge?: () => void;
  onShare?: () => void;
  onSign?: () => void;
}

export function createFloatingBar(doc: Document, callbacks: FloatingBarCallbacks): HTMLDivElement {
  const bar = doc.createElement('div');
  bar.className = 'ql-clausula-floating-bar';
  bar.setAttribute('contenteditable', 'false');

  const buttons: Array<{
    className: string;
    title: string;
    svg: string;
    callback?: () => void;
  }> = [
    { className: 'ql-floating-undo', title: 'Undo / Remake Contract', svg: UNDO_SVG, callback: callbacks.onUndo },
    { className: 'ql-floating-agree-all', title: 'Agree to All', svg: AGREE_ALL_SVG, callback: callbacks.onAgreeAll },
    { className: 'ql-floating-disagree-all', title: 'Disagree to All', svg: DISAGREE_ALL_SVG, callback: callbacks.onDisagreeAll },
    { className: 'ql-floating-lock-all', title: 'Lock All', svg: LOCK_ALL_SVG, callback: callbacks.onLockAll },
    { className: 'ql-floating-judge', title: 'AI Judge', svg: JUDGE_SVG, callback: callbacks.onJudge },
    { className: 'ql-floating-share', title: 'Share', svg: SHARE_SVG, callback: callbacks.onShare },
    { className: 'ql-floating-sign', title: 'Sign Contract', svg: SIGN_SVG, callback: callbacks.onSign },
  ];

  for (const btn of buttons) {
    const el = doc.createElement('button');
    el.className = `ql-floating-btn ${btn.className}`;
    el.setAttribute('type', 'button');
    el.setAttribute('title', btn.title);
    el.innerHTML = btn.svg;
    if (btn.callback) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        btn.callback!();
      });
    }
    bar.appendChild(el);
  }

  return bar;
}

/**
 * Creates the undo warning modal overlay.
 */
export function createUndoModal(doc: Document, onConfirm: () => void, onCancel: () => void): HTMLDivElement {
  const overlay = doc.createElement('div');
  overlay.className = 'ql-clausula-modal-overlay';

  const modal = doc.createElement('div');
  modal.className = 'ql-clausula-modal';

  const title = doc.createElement('h3');
  title.className = 'ql-clausula-modal-title';
  title.textContent = 'Remake Contract';

  const message = doc.createElement('p');
  message.className = 'ql-clausula-modal-message';
  message.textContent = 'This will undo all agreements, disagreements, and locks on the entire contract. Are you sure you want to proceed?';

  const actions = doc.createElement('div');
  actions.className = 'ql-clausula-modal-actions';

  const cancelBtn = doc.createElement('button');
  cancelBtn.className = 'ql-clausula-modal-btn ql-clausula-modal-cancel';
  cancelBtn.setAttribute('type', 'button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
    onCancel();
  });

  const confirmBtn = doc.createElement('button');
  confirmBtn.className = 'ql-clausula-modal-btn ql-clausula-modal-confirm';
  confirmBtn.setAttribute('type', 'button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(actions);
  overlay.appendChild(modal);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      onCancel();
    }
  });

  return overlay;
}

/**
 * Check if all clausula items (leaf-level, non-parent) have all users agreed.
 * Returns true only when every leaf item has `agreed[user] === true` for every user.
 */
export function isContractFullyAgreed(
  allItems: HTMLElement[],
  users: string[],
): boolean {
  if (users.length === 0 || allItems.length === 0) return false;

  // Only check leaf items (non-parent clausula items that hold content)
  const leafItems = allItems.filter((el) => {
    const type = el.getAttribute('data-clausula-type') as ClausulaType | null;
    return type ? HIERARCHY[type] !== 0 : true;
  });

  if (leafItems.length === 0) return false;

  return leafItems.every((el) => {
    const raw = el.getAttribute('data-agreed');
    if (!raw) return false;
    try {
      const agreed = JSON.parse(raw) as Record<string, boolean>;
      return users.every((u) => agreed[u] === true);
    } catch {
      return false;
    }
  });
}
