//@ts-ignore
import { syntaxTree } from '@codemirror/language';
import { EditorState, RangeSetBuilder, StateEffect } from '@codemirror/state';
import {
Decoration,
DecorationSet,
EditorView,
PluginSpec,
PluginValue,
ViewPlugin,
ViewUpdate
} from '@codemirror/view';
import { LezerTree, SyntaxNode } from '@obsidian-typings/obsidian-public-latest';
import { editorLivePreviewField } from 'obsidian';
import PrettyPropertiesPlugin from 'src/main';
import { generateInlineStyles } from 'src/updates/updatePills';


interface Tree extends LezerTree {
    iterate: (item: { from: number; to: number; enter(node: SyntaxNode): void; }) => void
}



export const updateTags = StateEffect.define()

export const registerTagFixExtension = (plugin: PrettyPropertiesPlugin) => {

    class TagFixPlugin implements PluginValue {
        decorations: DecorationSet;
        view: EditorView

        constructor(view: EditorView) {
            this.view = view
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            const updateEvent = update.transactions.some(tr => {
                return tr.effects.some(e => e.is(updateTags))
            })

            if (update.docChanged || update.viewportChanged || updateEvent) {
                this.decorations = this.buildDecorations(update.view);
            }
        }

        destroy() {}

        buildDecorations(view: EditorView): DecorationSet {
            const builder = new RangeSetBuilder<Decoration>();
            if (!view.state.field(editorLivePreviewField)) {return builder.finish();}

            try {
                if (plugin.settings.enableColoredInlineTags) {
                    for (let { from, to } of view.visibleRanges) {
    
                        let tagTextStart = 0;
                        
                        (syntaxTree as (state: EditorState) => Tree)(view.state).iterate({
                            from,
                            to,
                            enter(node: SyntaxNode) {
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
            } catch {
                console.error("Can not build tag decorations")
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


