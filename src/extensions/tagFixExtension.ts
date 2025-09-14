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
ViewUpdate,
WidgetType
} from '@codemirror/view';
import PrettyPropertiesPlugin from 'src/main';
import { generateInlineStyles } from 'src/utils/updates/updatePills';




export const registerTagFixExtension = (plugin: PrettyPropertiesPlugin) => {

    let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "none", "default"]

    const getTextLightness = (color: any) => {
        let textLightness = 30
        if (color.l < 80) textLightness = 20
        if (color.l < 70) textLightness = 10
        if (color.l < 60) textLightness = 5
        if (color.l < 50) textLightness = 95
        if (color.l < 40) textLightness = 90
        if (color.l < 30) textLightness = 80
        return textLightness
    }
    class TagFixPlugin implements PluginValue {
        decorations: DecorationSet;
        view: EditorView

        constructor(view: EditorView) {
            this.view = view
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {

            //@ts-ignore
            if (update.docChanged || update.viewportChanged || update.transactions?.[0]?.annotations?.[0]?.value) {
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
                            let styles = generateInlineStyles(tagId, "tag", plugin)
                            let { styleProps, colorClass } = styles
                            let styleText = ""
                            for (let key in styleProps) {
                                styleText = styleText + key + ": " + styleProps[key] + "; "
                            }

                            let decoBegin = Decoration.mark({ 
                                attributes: {
                                    "data-tag-value": tagId, 
                                    style: styleText
                                }, 
                                class: "cm-hashtag-inner cm-hashtag cm-hashtag-begin cm-meta cm-tag-" + tagId + " " + colorClass
                            })

                            let decoEnd = Decoration.mark({ 
                                attributes: {
                                    "data-tag-value": tagId, 
                                    style: styleText
                                }, 
                                class: "cm-hashtag-inner cm-hashtag cm-hashtag-end cm-meta cm-tag-" + tagId + " " + colorClass
                            })

                            builder.add(node.from - 1, node.from, decoBegin);
                            builder.add(node.from, node.to, decoEnd);
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

    const tagFixPlugin = ViewPlugin.fromClass(
        TagFixPlugin,
        pluginSpec
    )

    plugin.registerEditorExtension(tagFixPlugin)

}


