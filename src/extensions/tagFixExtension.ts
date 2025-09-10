//@ts-ignore
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import {
Decoration,
DecorationSet,
EditorView,
PluginSpec,
PluginValue,
ViewPlugin,
ViewUpdate
} from '@codemirror/view';


class TagFixPlugin implements PluginValue {
    decorations: DecorationSet;
    view: EditorView

    constructor(view: EditorView) {
        this.view = view
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    destroy() {}

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node: any) {
                
                    if (node.type.name.includes('hashtag-end')) {
                        let tagId = view.state.doc.sliceString(node.from, node.to)
                        let deco = Decoration.mark({ attributes: {"data-tag-value": tagId} })
                        builder.add(node.from - 1, node.from, deco);
                        builder.add(node.from, node.to, deco);
                    }
                },
            });
        }
        return builder.finish();
    }
}

const pluginSpec: PluginSpec<TagFixPlugin> = {
    decorations: (value: TagFixPlugin) => value.decorations,
};

export const tagFixPlugin = ViewPlugin.fromClass(
    TagFixPlugin,
    pluginSpec
)