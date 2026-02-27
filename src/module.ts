import Quill from 'quill';
import ClausulaItem from './blots/clausula-item.js';
import ClausulaContainer from './blots/clausula-container.js';
import { computeIndices } from './numbering/counter.js';
import { formatLabel } from './numbering/formatter.js';
import { clausulaHandler } from './toolbar/handler.js';
import { AUTOFILL_PREFIX, matchTrigger } from './autofill.js';
import { PROMOTE_ORDER, DEFAULT_OPTIONS } from './types.js';
import type { ClausulaModuleOptions, ClausulaType } from './types.js';

const Module = Quill.import('core/module') as any;
const Sources = (Quill as any).sources || { USER: 'user', SILENT: 'silent', API: 'api' };

class ClausulaModule extends Module {
  static DEFAULTS = { ...DEFAULT_OPTIONS };

  options: ClausulaModuleOptions;
  private renumberScheduled = false;

  static register() {
    Quill.register(ClausulaItem, true);
    Quill.register(ClausulaContainer, true);
  }

  constructor(quill: any, options: Partial<ClausulaModuleOptions>) {
    super(quill, options);
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Register toolbar handler
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('clausula', clausulaHandler);
    }

    // Add keyboard bindings
    this.addKeyboardBindings();

    // Listen for text changes to trigger renumbering
    quill.on('text-change', () => {
      this.scheduleRenumber();
    });

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

  private addKeyboardBindings() {
    const keyboard = this.quill.getModule('keyboard') as any;
    const self = this;

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
    // Must prepend — Quill's default 'tab' binding inserts \t and would consume the event
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

    // Autofill: type a trigger word + Space at the start of a plain line
    // e.g. "cl " → Cláusula, "§ " → Parágrafo, "inc " → Inciso
    this.prependBinding(keyboard, ' ', {
      key: ' ',
      shiftKey: null,
      collapsed: true,
      format: {
        'code-block': false,
        blockquote: false,
        table: false,
        clausula: false,
      },
      prefix: AUTOFILL_PREFIX,
      handler(range: any, context: any) {
        const triggerText = context.prefix as string;
        const clausulaType = matchTrigger(triggerText);
        if (!clausulaType) return true;

        const { length } = triggerText;
        const [line, offset] = self.quill.getLine(range.index);
        if (offset > length) return true;

        // Insert the space first so undo works cleanly
        self.quill.insertText(range.index, ' ', Sources.USER);
        self.quill.history.cutoff();

        // Delete the trigger text + the space we just inserted,
        // then apply the clausula format to the line's trailing \n
        const delta = new (self.quill.constructor.import('delta'))()
          .retain(range.index - offset)
          .delete(length + 1)
          .retain(line.length() - 2 - offset)
          .retain(1, { clausula: clausulaType });

        self.quill.updateContents(delta, Sources.USER);
        self.quill.history.cutoff();
        self.quill.setSelection(range.index - length, Sources.SILENT);
        return false;
      },
    });
  }

  private scheduleRenumber() {
    if (this.renumberScheduled) return;
    this.renumberScheduled = true;
    requestAnimationFrame(() => {
      this.renumberScheduled = false;
      this.renumber();
    });
  }

  renumber() {
    // Collect ALL clausula items across every container in document order.
    // This ensures cláusula numbering is continuous even when plain paragraphs
    // or empty lines split them into separate containers.
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
  }
}

export default ClausulaModule;
