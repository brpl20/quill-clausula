import Quill from 'quill';
import ClausulaItem from './blots/clausula-item.js';
import ClausulaContainer from './blots/clausula-container.js';
import ParteItem from './blots/parte-item.js';
import ParteContainer from './blots/parte-container.js';
import ObjetoItem from './blots/objeto-item.js';
import ObjetoContainer from './blots/objeto-container.js';
import AssinaturaEmbed from './blots/assinatura-embed.js';
import LockedAttribute from './formats/locked.js';
import AgreedAttribute from './formats/agreed.js';
import { computeIndices } from './numbering/counter.js';
import { formatLabel } from './numbering/formatter.js';
import { computeParteIndices, formatParteLabel } from './partes/partes-counter.js';
import { extractSignatureLines } from './assinatura/assinatura-sync.js';
import { renderAssinatura } from './assinatura/assinatura-renderer.js';
import { clausulaHandler, parteHandler, objetoHandler, assinaturaHandler } from './toolbar/handler.js';
import { AUTOFILL_PREFIX, matchTrigger, matchExtraTrigger } from './autofill.js';
import { PROMOTE_ORDER, HIERARCHY, DEFAULT_OPTIONS } from './types.js';
import { createActionButtons, syncButtonState } from './actions/action-buttons.js';
import { createFloatingBar, createUndoModal, isContractFullyAgreed } from './actions/floating-bar.js';
import type { ClausulaModuleOptions, ClausulaType, ConversationContext } from './types.js';

const Module = Quill.import('core/module') as any;
const Sources = (Quill as any).sources || { USER: 'user', SILENT: 'silent', API: 'api' };

class ClausulaModule extends Module {
  static DEFAULTS = { ...DEFAULT_OPTIONS };

  options: ClausulaModuleOptions;
  private renumberScheduled = false;
  private floatingBar: HTMLElement | null = null;

  static register() {
    Quill.register(ClausulaItem, true);
    Quill.register(ClausulaContainer, true);
    Quill.register(ParteItem, true);
    Quill.register(ParteContainer, true);
    Quill.register(ObjetoItem, true);
    Quill.register(ObjetoContainer, true);
    Quill.register(AssinaturaEmbed, true);
    Quill.register(LockedAttribute, true);
    Quill.register(AgreedAttribute, true);
  }

  constructor(quill: any, options: Partial<ClausulaModuleOptions>) {
    super(quill, options);
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Register toolbar handlers
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('clausula', clausulaHandler);
      toolbar.addHandler('parte', parteHandler);
      toolbar.addHandler('objeto', objetoHandler);
      toolbar.addHandler('assinatura', assinaturaHandler);
    }

    // Add keyboard bindings
    this.addKeyboardBindings();

    // Listen for text changes to trigger renumbering
    quill.on('text-change', () => {
      this.scheduleRenumber();
    });

    // Locked-line edit prevention
    this.addLockedLinePrevention();

    // Floating action bar
    if (this.options.showFloatingBar !== false) {
      this.initFloatingBar();
    }

    // Initial renumber
    this.scheduleRenumber();
  }

  /**
   * Prepend a binding so it fires before Quill's built-in handlers.
   * Quill's addBinding() uses push(), so built-in Backspace/Enter handlers
   * consume events before late-registered bindings. We unshift instead.
   */
  private prependBinding(keyboard: any, key: string, binding: any) {
    keyboard.bindings[key] = keyboard.bindings[key] || [];
    keyboard.bindings[key].unshift(binding);
  }

  private removeClausulaFormat() {
    this.quill.format('clausula', false, Sources.USER);
  }

  private removeParteFormat() {
    this.quill.format('parte', false, Sources.USER);
  }

  private removeObjetoFormat() {
    this.quill.format('objeto', false, Sources.USER);
  }

  private addKeyboardBindings() {
    const keyboard = this.quill.getModule('keyboard') as any;
    const self = this;

    // ── Clausula bindings ──

    // Enter on empty clausula item: remove format
    this.prependBinding(keyboard, 'Enter', {
      key: 'Enter',
      collapsed: true,
      empty: true,
      format: ['clausula'],
      handler() {
        self.removeClausulaFormat();
        return false;
      },
    });

    // Backspace at offset 0 on clausula line: remove format
    this.prependBinding(keyboard, 'Backspace', {
      key: 'Backspace',
      collapsed: true,
      offset: 0,
      format: ['clausula'],
      shiftKey: null,
      metaKey: null,
      ctrlKey: null,
      altKey: null,
      handler() {
        self.removeClausulaFormat();
        return false;
      },
    });

    // Delete on empty clausula line: also remove format
    this.prependBinding(keyboard, 'Delete', {
      key: 'Delete',
      collapsed: true,
      empty: true,
      format: ['clausula'],
      shiftKey: null,
      metaKey: null,
      ctrlKey: null,
      altKey: null,
      handler() {
        self.removeClausulaFormat();
        return false;
      },
    });

    // Tab: promote to deeper type in hierarchy
    this.prependBinding(keyboard, 'Tab', {
      key: 'Tab',
      format: ['clausula'],
      handler(range: any, context: any) {
        if (context.collapsed && context.offset !== 0) return true;
        const currentType = context.format.clausula as ClausulaType;
        const currentIdx = PROMOTE_ORDER.indexOf(currentType);
        if (currentIdx < PROMOTE_ORDER.length - 1) {
          self.quill.format('clausula', PROMOTE_ORDER[currentIdx + 1], Sources.USER);
        }
        return false;
      },
    });

    // Shift+Tab: demote to shallower type
    this.prependBinding(keyboard, 'Tab', {
      key: 'Tab',
      shiftKey: true,
      format: ['clausula'],
      handler(range: any, context: any) {
        if (context.collapsed && context.offset !== 0) return true;
        const currentType = context.format.clausula as ClausulaType;
        const currentIdx = PROMOTE_ORDER.indexOf(currentType);
        if (currentIdx > 0) {
          self.quill.format('clausula', PROMOTE_ORDER[currentIdx - 1], Sources.USER);
        } else {
          self.removeClausulaFormat();
        }
        return false;
      },
    });

    // ── Parte bindings ──

    // Enter on empty parte item: remove format
    this.prependBinding(keyboard, 'Enter', {
      key: 'Enter',
      collapsed: true,
      empty: true,
      format: ['parte'],
      handler() {
        self.removeParteFormat();
        return false;
      },
    });

    // Backspace at offset 0 on parte line: remove format
    this.prependBinding(keyboard, 'Backspace', {
      key: 'Backspace',
      collapsed: true,
      offset: 0,
      format: ['parte'],
      shiftKey: null,
      metaKey: null,
      ctrlKey: null,
      altKey: null,
      handler() {
        self.removeParteFormat();
        return false;
      },
    });

    // Tab on parte line: toggle between contratante/contratado
    this.prependBinding(keyboard, 'Tab', {
      key: 'Tab',
      format: ['parte'],
      handler(range: any, context: any) {
        const currentType = context.format.parte;
        const newType = currentType === 'contratante' ? 'contratado' : 'contratante';
        self.quill.format('parte', newType, Sources.USER);
        return false;
      },
    });

    // ── Objeto bindings ──

    // Enter on empty objeto item: remove format
    this.prependBinding(keyboard, 'Enter', {
      key: 'Enter',
      collapsed: true,
      empty: true,
      format: ['objeto'],
      handler() {
        self.removeObjetoFormat();
        return false;
      },
    });

    // Backspace at offset 0 on objeto line: remove format
    this.prependBinding(keyboard, 'Backspace', {
      key: 'Backspace',
      collapsed: true,
      offset: 0,
      format: ['objeto'],
      shiftKey: null,
      metaKey: null,
      ctrlKey: null,
      altKey: null,
      handler() {
        self.removeObjetoFormat();
        return false;
      },
    });

    // ── Autofill: type a trigger word + Space at the start of a plain line ──
    this.prependBinding(keyboard, ' ', {
      key: ' ',
      shiftKey: null,
      collapsed: true,
      format: {
        'code-block': false,
        blockquote: false,
        table: false,
        clausula: false,
        parte: false,
        objeto: false,
      },
      prefix: AUTOFILL_PREFIX,
      handler(range: any, context: any) {
        const triggerText = context.prefix as string;

        // Check clausula triggers first
        const clausulaType = matchTrigger(triggerText);
        // Check extra triggers (parte, objeto)
        const extraTrigger = matchExtraTrigger(triggerText);

        if (!clausulaType && !extraTrigger) return true;

        const formatName = clausulaType ? 'clausula' : extraTrigger!.format;
        const formatValue = clausulaType || extraTrigger!.value;

        const { length } = triggerText;
        const [line, offset] = self.quill.getLine(range.index);
        if (offset > length) return true;

        // Insert the space first so undo works cleanly
        self.quill.insertText(range.index, ' ', Sources.USER);
        self.quill.history.cutoff();

        // Delete the trigger text + the space we just inserted,
        // then apply the format to the line's trailing \n
        const delta = new (self.quill.constructor.import('delta'))()
          .retain(range.index - offset)
          .delete(length + 1)
          .retain(line.length() - 2 - offset)
          .retain(1, { [formatName]: formatValue });

        self.quill.updateContents(delta, Sources.USER);
        self.quill.history.cutoff();
        self.quill.setSelection(range.index - length, Sources.SILENT);
        return false;
      },
    });
  }

  private addLockedLinePrevention() {
    const root = this.quill.root as HTMLElement;

    // beforeinput: block typing on locked lines
    root.addEventListener(
      'beforeinput',
      (e: InputEvent) => {
        if (this.isSelectionOnLockedLine()) {
          e.preventDefault();
        }
      },
      true,
    );

    // paste: block paste on locked lines
    root.addEventListener(
      'paste',
      (e: ClipboardEvent) => {
        if (this.isSelectionOnLockedLine()) {
          e.preventDefault();
        }
      },
      true,
    );

    // Safety net: undo USER changes that touch locked lines
    this.quill.on('text-change', (delta: any, _oldDelta: any, source: string) => {
      if (source !== Sources.USER) return;
      if (this.doesDeltaTouchLockedLine(delta)) {
        this.quill.history.undo();
      }
    });
  }

  private isSelectionOnLockedLine(): boolean {
    const selection = this.quill.getSelection();
    if (!selection) return false;
    const [line] = this.quill.getLine(selection.index);
    if (!line || !line.domNode) return false;
    return line.domNode.classList.contains('ql-locked-true');
  }

  private doesDeltaTouchLockedLine(delta: any): boolean {
    let index = 0;
    for (const op of delta.ops) {
      if (op.retain && !op.attributes) {
        index += op.retain;
      } else if (op.insert || op.delete || (op.retain && op.attributes)) {
        const [line] = this.quill.getLine(index);
        if (line && line.domNode && line.domNode.classList.contains('ql-locked-true')) {
          return true;
        }
        if (op.retain) index += op.retain;
        else if (op.insert) {
          index += typeof op.insert === 'string' ? op.insert.length : 1;
        }
      }
    }
    return false;
  }

  private initFloatingBar() {
    const doc = this.quill.root.ownerDocument;
    const editorContainer = this.quill.container as HTMLElement;

    this.floatingBar = createFloatingBar(doc, {
      onUndo: () => this.handleGlobalUndo(),
      onAgreeAll: () => this.handleGlobalAgree(),
      onDisagreeAll: () => this.handleGlobalDisagree(),
      onLockAll: () => this.handleGlobalLock(),
      onJudge: () => this.options.onJudge?.(),
      onShare: () => this.options.onShare?.(),
      onSign: () => this.options.onSign?.(),
    });

    editorContainer.appendChild(this.floatingBar);
  }

  private getAllItems(): any[] {
    const containers = this.quill.scroll.descendants(ClausulaContainer) as any[];
    const allItems: any[] = [];
    for (const container of containers) {
      if (!container.children) continue;
      let cur = container.children.head;
      while (cur) {
        allItems.push(cur);
        cur = cur.next;
      }
    }
    return allItems;
  }

  private getAllParteItems(): any[] {
    const containers = this.quill.scroll.descendants(ParteContainer) as any[];
    const allItems: any[] = [];
    for (const container of containers) {
      if (!container.children) continue;
      let cur = container.children.head;
      while (cur) {
        allItems.push(cur);
        cur = cur.next;
      }
    }
    return allItems;
  }

  private getAllObjetoItems(): any[] {
    const containers = this.quill.scroll.descendants(ObjetoContainer) as any[];
    const allItems: any[] = [];
    for (const container of containers) {
      if (!container.children) continue;
      let cur = container.children.head;
      while (cur) {
        allItems.push(cur);
        cur = cur.next;
      }
    }
    return allItems;
  }

  private handleGlobalUndo() {
    const doc = this.quill.root.ownerDocument;
    const modal = createUndoModal(
      doc,
      () => {
        // Confirm: remove all locks and agreements
        const allItems = this.getAllItems();
        for (const item of allItems) {
          const index = this.quill.getIndex(item);
          this.quill.formatLine(index, 1, 'locked', false, Sources.SILENT);
          this.quill.formatLine(index, 1, 'agreed', false, Sources.SILENT);
        }
        this.scheduleRenumber();
      },
      () => { /* cancel – noop */ },
    );
    doc.body.appendChild(modal);
  }

  private handleGlobalAgree() {
    const currentUser = this.options.currentUser;
    if (!currentUser) return;

    const allItems = this.getAllItems();
    for (const item of allItems) {
      const domNode = item.domNode as HTMLElement;
      if (domNode.classList.contains('ql-locked-true')) continue;
      this.setAgreed(item, currentUser, true);
    }
    this.scheduleRenumber();
  }

  private handleGlobalDisagree() {
    const currentUser = this.options.currentUser;
    if (!currentUser) return;

    const allItems = this.getAllItems();
    for (const item of allItems) {
      const domNode = item.domNode as HTMLElement;
      if (domNode.classList.contains('ql-locked-true')) continue;
      this.setAgreed(item, currentUser, false);
    }
    this.scheduleRenumber();
  }

  private handleGlobalLock() {
    const allItems = this.getAllItems();
    // If any item is unlocked, lock all. If all are locked, unlock all.
    const anyUnlocked = allItems.some(
      (item: any) => !item.domNode.classList.contains('ql-locked-true'),
    );
    const newValue = anyUnlocked ? 'true' : false;

    for (const item of allItems) {
      const index = this.quill.getIndex(item);
      this.quill.formatLine(index, 1, 'locked', newValue, Sources.SILENT);
    }
    this.scheduleRenumber();
  }

  private syncFloatingBar() {
    if (!this.floatingBar) return;

    const signBtn = this.floatingBar.querySelector('.ql-floating-sign') as HTMLButtonElement | null;
    if (!signBtn) return;

    const allItems = this.getAllItems();
    const domNodes = allItems.map((item: any) => item.domNode as HTMLElement);
    const users = this.options.users || (this.options.currentUser ? [this.options.currentUser] : []);

    const fullyAgreed = isContractFullyAgreed(domNodes, users);
    signBtn.disabled = !fullyAgreed;
    signBtn.classList.toggle('ready', fullyAgreed);
  }

  private scheduleRenumber() {
    if (this.renumberScheduled) return;
    this.renumberScheduled = true;
    requestAnimationFrame(() => {
      this.renumberScheduled = false;
      this.renumber();
      this.renumberPartes();
      this.enforceSingletonObjeto();
      this.syncAssinatura();
    });
  }

  renumber() {
    // Collect ALL clausula items across every container in document order.
    const containers = this.quill.scroll.descendants(
      ClausulaContainer,
    ) as any[];

    const allItems: any[] = [];
    for (const container of containers) {
      if (!container.children) continue;
      let cur = container.children.head;
      while (cur) {
        allItems.push(cur);
        cur = cur.next;
      }
    }

    const indices = computeIndices(allItems);

    allItems.forEach((item: any, i: number) => {
      const info = indices[i];
      if (!info) return;
      const label = formatLabel(info, this.options);
      const uiNode = item.domNode.querySelector('.ql-ui');
      if (uiNode) {
        uiNode.textContent = label;
      }
    });

    // Update action buttons if enabled
    if (this.options.showActions !== false) {
      this.updateActions(allItems);
    }

    // Sync floating bar sign button state
    this.syncFloatingBar();
  }

  renumberPartes() {
    const allItems = this.getAllParteItems();
    if (allItems.length === 0) return;

    const indices = computeParteIndices(allItems);

    allItems.forEach((item: any, i: number) => {
      const info = indices[i];
      if (!info) return;
      const label = formatParteLabel(info);
      const uiNode = item.domNode.querySelector('.ql-ui');
      if (uiNode) {
        uiNode.textContent = label;
      }
    });
  }

  enforceSingletonObjeto() {
    const allItems = this.getAllObjetoItems();
    if (allItems.length <= 1) return;

    // Keep the first objeto, remove the rest by converting to plain text
    for (let i = 1; i < allItems.length; i++) {
      const index = this.quill.getIndex(allItems[i]);
      this.quill.formatLine(index, 1, 'objeto', false, Sources.SILENT);
    }
  }

  syncAssinatura() {
    const assinaturaBlots = this.quill.scroll.descendants(AssinaturaEmbed) as any[];
    if (assinaturaBlots.length === 0) return;

    const parteItems = this.getAllParteItems();
    const lines = extractSignatureLines(parteItems);

    for (const blot of assinaturaBlots) {
      const config = AssinaturaEmbed.value(blot.domNode);
      const html = renderAssinatura(lines, config);
      blot.domNode.innerHTML = html;
    }
  }

  private updateActions(allItems: any[]) {
    const doc = this.quill.root.ownerDocument;

    for (const item of allItems) {
      const domNode = item.domNode as HTMLElement;
      let actionsContainer = domNode.querySelector('.ql-clausula-actions') as HTMLElement | null;

      if (!actionsContainer) {
        actionsContainer = createActionButtons(doc);
        domNode.appendChild(actionsContainer);
        item.actionsNode = actionsContainer;

        // Event delegation on the actions container
        actionsContainer.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault(); // Keep editor focus
          const target = (e.target as HTMLElement).closest('.ql-clausula-btn') as HTMLElement | null;
          if (!target) return;

          if (target.classList.contains('ql-clausula-lock')) {
            this.handleLock(item, allItems);
          } else if (target.classList.contains('ql-clausula-agree')) {
            if (!target.hasAttribute('disabled') && !(target as HTMLButtonElement).disabled) {
              this.handleAgree(item, allItems);
            }
          } else if (target.classList.contains('ql-clausula-disagree')) {
            if (!target.hasAttribute('disabled') && !(target as HTMLButtonElement).disabled) {
              this.handleDisagree(item, allItems);
            }
          } else if (target.classList.contains('ql-clausula-conversation')) {
            this.handleConversation(item);
          }
        });
      }

      // Sync button state
      const type = domNode.getAttribute('data-clausula-type') as ClausulaType | null;
      const isParent = type ? HIERARCHY[type] === 0 : false;
      const children = isParent
        ? this.getChildren(item, allItems).map((b: any) => b.domNode as HTMLElement)
        : undefined;

      syncButtonState(
        actionsContainer,
        domNode,
        this.options.currentUser,
        this.options.users,
        children,
      );
    }
  }

  private handleLock(blot: any, allItems: any[]) {
    const domNode = blot.domNode as HTMLElement;
    const type = domNode.getAttribute('data-clausula-type') as ClausulaType | null;
    const isParent = type ? HIERARCHY[type] === 0 : false;
    const isLocked = domNode.classList.contains('ql-locked-true');
    const newValue = isLocked ? false : 'true';

    // Apply to self
    const index = this.quill.getIndex(blot);
    this.quill.formatLine(index, 1, 'locked', newValue, Sources.SILENT);

    // If parent clausula, cascade to children
    if (isParent) {
      const children = this.getChildren(blot, allItems);
      for (const child of children) {
        const childIndex = this.quill.getIndex(child);
        this.quill.formatLine(childIndex, 1, 'locked', newValue, Sources.SILENT);
      }
    }

    this.scheduleRenumber();
  }

  private handleAgree(blot: any, allItems: any[]) {
    const currentUser = this.options.currentUser;
    if (!currentUser) return;

    const domNode = blot.domNode as HTMLElement;
    const type = domNode.getAttribute('data-clausula-type') as ClausulaType | null;
    const isParent = type ? HIERARCHY[type] === 0 : false;

    if (isParent) {
      // Agree all children for current user
      const children = this.getChildren(blot, allItems);
      for (const child of children) {
        this.setAgreed(child, currentUser, true);
      }
    } else {
      // Agree self
      this.setAgreed(blot, currentUser, true);
    }

    this.scheduleRenumber();
  }

  private handleDisagree(blot: any, allItems: any[]) {
    const currentUser = this.options.currentUser;
    if (!currentUser) return;

    const domNode = blot.domNode as HTMLElement;
    const type = domNode.getAttribute('data-clausula-type') as ClausulaType | null;
    const isParent = type ? HIERARCHY[type] === 0 : false;

    if (isParent) {
      // Disagree all children for current user
      const children = this.getChildren(blot, allItems);
      for (const child of children) {
        this.setAgreed(child, currentUser, false);
      }
    } else {
      // Disagree self
      this.setAgreed(blot, currentUser, false);
    }

    this.scheduleRenumber();
  }

  private handleConversation(blot: any) {
    const callback = this.options.onConversation;
    if (!callback) return;

    const domNode = blot.domNode as HTMLElement;
    const type = domNode.getAttribute('data-clausula-type') as ClausulaType;
    const uiNode = domNode.querySelector('.ql-ui');
    const text = domNode.textContent?.replace(uiNode?.textContent || '', '').trim() || '';

    const context: ConversationContext = {
      type,
      text,
      domNode,
      currentUser: this.options.currentUser,
    };

    callback(context);
  }

  private setAgreed(blot: any, user: string, agree: boolean) {
    const domNode = blot.domNode as HTMLElement;
    const raw = domNode.getAttribute('data-agreed');
    let agreed: Record<string, boolean> = {};
    if (raw) {
      try {
        agreed = JSON.parse(raw);
      } catch {
        agreed = {};
      }
    }

    agreed[user] = agree;

    const index = this.quill.getIndex(blot);
    const value = Object.keys(agreed).length > 0 ? agreed : false;
    this.quill.formatLine(index, 1, 'agreed', value, Sources.SILENT);
  }

  /**
   * Get all children after the given clausula (level 0) until the next level-0 item.
   * Works across container boundaries using the flattened allItems array.
   */
  private getChildren(blot: any, allItems: any[]): any[] {
    const startIdx = allItems.indexOf(blot);
    if (startIdx === -1) return [];

    const children: any[] = [];
    for (let i = startIdx + 1; i < allItems.length; i++) {
      const node = allItems[i].domNode as HTMLElement;
      const childType = node.getAttribute('data-clausula-type') as ClausulaType | null;
      if (childType && HIERARCHY[childType] === 0) break; // Next parent clausula
      children.push(allItems[i]);
    }
    return children;
  }
}

export default ClausulaModule;
