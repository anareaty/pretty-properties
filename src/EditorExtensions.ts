import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

class TagFixPlugin implements PluginValue {
  constructor(view: EditorView) {}

  update(update: ViewUpdate) {
    let viewport = update.view.viewport;
    let tree = syntaxTree(update.view.state);

    tree.iterate({ from: viewport.from, to: viewport.to, enter: (nodeRef: any) => {
        if (!nodeRef.name.includes('hashtag-begin')) return;
        const beginEl = update.view.domAtPos(nodeRef.to).node.parentElement;
        if (!(beginEl instanceof HTMLElement)) return;
        const endEl = beginEl?.nextElementSibling;
        if (!(endEl instanceof HTMLElement) || !endEl.hasClass('cm-hashtag-end')) return;
        const tagId = endEl.getText();

        if (!endEl.hasClass("cm-tag-" + tagId)) {
          beginEl.classList.add("cm-tag-" + tagId)
          endEl.classList.add("cm-tag-" + tagId)
        }

        beginEl.setAttribute("data-tag-value", tagId)
        endEl.setAttribute("data-tag-value", tagId)
    }})
  }

  destroy() {}
}

export const tagFixPlugin = ViewPlugin.fromClass(TagFixPlugin);