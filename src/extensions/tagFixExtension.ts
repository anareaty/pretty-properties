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
import PrettyPropertiesPlugin from 'src/main';
import { generateInlineStyles } from 'src/utils/updates/updatePills';




export const registerTagFixExtension = (plugin: PrettyPropertiesPlugin) => {

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

            if (plugin.settings.enableColoredInlineTags) {
                for (let { from, to } of view.visibleRanges) {

                    let tagTextStart = 0

                    syntaxTree(view.state).iterate({
                        from,
                        to,
                        enter(node: any) {

                            if (node.type.name.includes('hashtag-begin')) {
                                tagTextStart = node.to
                            }

                            if (node.type.name.includes('hashtag-end')) {
                                let tagId = view.state.doc.sliceString(tagTextStart, node.to)
                                let styles = generateInlineStyles(tagId, "tag", plugin)
                                let { styleProps, colorClass, textColorClass } = styles
                                let styleText = ""
                                for (let key in styleProps) {
                                    styleText = styleText + key + ": " + styleProps[key] + "; "
                                }

                                let decoBegin = Decoration.mark({ 
                                    attributes: {
                                        "data-tag-value": tagId, 
                                        style: styleText
                                    }, 
                                    class: "cm-hashtag-inner cm-hashtag cm-hashtag-begin cm-meta cm-tag-" + tagId + " " + colorClass + " " + textColorClass
                                })

                                let decoMiddle = Decoration.mark({ 
                                    attributes: {
                                        "data-tag-value": tagId, 
                                        style: styleText
                                    }, 
                                    class: "cm-hashtag-inner cm-hashtag cm-hashtag-middle cm-meta cm-tag-" + tagId + " " + colorClass + " " + textColorClass
                                })

                                let decoEnd = Decoration.mark({ 
                                    attributes: {
                                        "data-tag-value": tagId, 
                                        style: styleText
                                    }, 
                                    class: "cm-hashtag-inner cm-hashtag cm-hashtag-end cm-meta cm-tag-" + tagId + " " + colorClass + " " + textColorClass
                                })

                                builder.add(tagTextStart - 1, tagTextStart, decoBegin);

                                if (tagTextStart < node.from) {
                                    builder.add(tagTextStart, node.from, decoMiddle);
                                }
                                
                                builder.add(node.from, node.to, decoEnd);
                            }
                        },
                    });
                }
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


