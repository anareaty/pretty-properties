import { TFile, CachedMetadata, MarkdownView, BasesView, HoverPopover, requireApiVersion } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { renderCover, updateCoverForView } from "./updateCovers";
import { renderIcon, updateIconForView } from "./updateIcons";
import { updateSettingPills, updateTagPaneTagsAll } from "./updatePills";
import { renderBanner, updateBannerForView } from "./updateBanners";
import { getNestedProperty } from "../utils/propertyUtils";
import { processTagsInPreviewElement } from "src/extensions/tagPostProcessor";
import { updateWidgets } from "src/patches/patchWidgets";
import { CardsBasesView, processBaseCardProperties } from "src/patches/patchBaseCards";
import { ListBasesView, processBaseListProperties } from "src/patches/patchBaseList";
import { processBaseTableCellTags, TableBasesView } from "src/patches/patchBaseTable";
import { AliasesPropertyWidgetComponent, 
    BasesView as BasesLeafView, 
    CanvasView, 
    DatePropertyWidgetComponentBase,  
    EmbeddedEditorView,  
    EmbedMarkdownComponent,  
    MetadataEditor, 
    MultitextPropertyWidgetComponent,  
    TagsPropertyWidgetComponent, 
    TextPropertyWidgetComponent, 
    WidgetEditorView
} from "@obsidian-typings/obsidian-public-latest";
import { updateTags } from "src/extensions/tagFixExtension";
import { KanbanBasesView, processBaseKanbanProperties } from "src/patches/patchBaseKanban";


interface Popover extends HoverPopover {
    embed: EmbeddedEditorView
}



export const updateAllProperties = (plugin:PrettyPropertiesPlugin) => { 



    let mdLeaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of mdLeaves) {
        let view = leaf.view

        if (view instanceof MarkdownView) {
            view.metadataEditor?.rendered?.forEach(p => {
                p.renderProperty(p.entry, !0)
            })

            updateBannerForView(view, plugin);
            updateIconForView(view, plugin);
            updateCoverForView(view, plugin);
            processTagsInPreviewElement(view.containerEl, plugin)
            
            let state = view.getState()

            if (state.mode == "source") {
                const editorView = view.editor.cm

                //@ts-expect-error
                editorView.dispatch({
                    effects: [updateTags.of(null)]
                })
            }
        }
    }



    
    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        let view = leaf.view as CanvasView

        view.canvas?.nodes?.forEach(node => {
            let nodeView = node.child
            if (nodeView) {
                //@ts-ignore
                (nodeView.metadataEditor as MetadataEditor)?.rendered?.forEach(p => {
                    p.renderProperty(p.entry, !0)
                })

                updateCoverForView(nodeView, plugin);
                processTagsInPreviewElement(nodeView.containerEl, plugin)

                if (nodeView.editor) {
                    const editorView = nodeView.editor.cm





                   
                    //@ts-expect-error
                    editorView.dispatch({
                        effects: [updateTags.of(null)]
                    })






                    
                }
            }
        })
    }


    let baseLeaves = plugin.app.workspace.getLeavesOfType("bases");
    for (let leaf of baseLeaves) {

        let view = leaf.view as BasesLeafView

        

        
        let baseView = view.controller?.view

        if (baseView instanceof BasesView) {
          


            if (requireApiVersion("1.10.0")) {
                let baseViewType = baseView.type

                if (baseViewType == "table") {

                    let tableBaseView = baseView as unknown as TableBasesView
    
                    
                    for (let row of tableBaseView.rows) {
                        for (let cell of row.cells) {
    
    
                            let propertyEditor = cell.renderer.propertyEditor
    
                            if (propertyEditor) {
                                let type = cell.renderer.inferredType.type
                                let value: string | string[] | number | boolean | null | undefined
                                
                                let ctx = {
                                    key: cell.prop.replace("note.", ""),
                                    sourcePath: cell.renderer.entry.file.path
                                }
                                
                                if (propertyEditor.type == "multitext" || propertyEditor.type == "tags" || propertyEditor.type == "aliases") {
                                    let rendered = propertyEditor as MultitextPropertyWidgetComponent | AliasesPropertyWidgetComponent | TagsPropertyWidgetComponent
                                    value = rendered.multiselect?.values
                                } else if (propertyEditor.type == "text" || propertyEditor.type == "datetime") {
                                    let rendered = propertyEditor as TextPropertyWidgetComponent | DatePropertyWidgetComponentBase
                                    value = rendered.value
                                } else if (propertyEditor.type == "number" || propertyEditor.type == "checkbox") {
                                    value = cell.renderer.val
                                } 
    
    
                                
    
                            
                                updateWidgets(type, propertyEditor, [cell.renderer.el, value, ctx], plugin)
    
    
    
                                
    
                            } else {
                                processBaseTableCellTags(cell, plugin)
                            }
                        }
                    }
                }
    
                else if (baseViewType == "cards") {
                    let cardsBaseView = baseView as unknown as CardsBasesView
                    processBaseCardProperties(cardsBaseView, plugin)
                }
    
                else if (baseViewType == "kanban") {
                    let kanbanBaseView = baseView as unknown as KanbanBasesView
                    processBaseKanbanProperties(kanbanBaseView, plugin)
                }
    
                else if (baseViewType == "list") {
                    let listBaseView = baseView as unknown as ListBasesView
                    processBaseListProperties(listBaseView, plugin)
                }
            }

            
        }

        
        

        
        
    }

    updateTagPaneTagsAll(plugin)
    updateSettingPills(plugin)
}




export const updateEmptyProperties = (plugin: PrettyPropertiesPlugin) => {
    /*
    let propertyEls = querySelectorsWithIframes(".metadata-property")
    for (let propertyEl of propertyEls) {
        let emptyLongtext = propertyEl.querySelector(".metadata-input-longtext:empty")
    }
    //??????????????????????
    */
}





export const updateImagesInPopover = (popover: HoverPopover, plugin: PrettyPropertiesPlugin) => {
    let embed = (popover as Popover).embed
    
    if (embed) {
        let file = embed.file

        let contentEl = popover.hoverEl
        if (file instanceof TFile) {
            let cache = plugin.app.metadataCache.getFileCache(file);
            let sourcePath = file.path || "";
            if (cache) {
                updateImagesWithCacheForView(cache, popover, contentEl, sourcePath, "popover", plugin)
            }
            
        }
    }
}



export const updateImagesForView = (view: MarkdownView, plugin: PrettyPropertiesPlugin) => {
    let file = view.file;

    if (file) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let sourcePath = file.path || "";
        let contentEl = view.contentEl;
        if (cache) {
            updateImagesWithCacheForView(cache, view, contentEl, sourcePath, "normal", plugin)
        }
        
    }
};



export const updateImagesOnCacheChanged = (file: TFile, cache: CachedMetadata, plugin: PrettyPropertiesPlugin) => {
    
    let sourcePath = file.path || ""

    let mdLeaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of mdLeaves) {
        let view = leaf.view;
        if (view instanceof MarkdownView && view.file?.path == sourcePath) {
            let contentEl = view.contentEl;
            updateImagesWithCacheForView(cache, view, contentEl, sourcePath, "normal", plugin)
        }
    }

    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        let view = leaf.view as CanvasView

        view.canvas?.nodes?.forEach(node => {
            let nodeView = node.child

            if (nodeView && nodeView.file?.path == sourcePath) {
                updateCoverForView(nodeView, plugin);
            }
        })
    }
}










export const updateImagesWithCacheForView = (cache: CachedMetadata, view: MarkdownView | HoverPopover, contentEl: HTMLElement, sourcePath: string, type: string, plugin: PrettyPropertiesPlugin) => {
    let frontmatter = cache?.frontmatter;
    let enableBanner = plugin.settings.enableBanner
    let enableCover = plugin.settings.enableCover
    let enableIcon = plugin.settings.enableIcon

    if (type == "popover") {
        enableBanner = plugin.settings.enableBanner && plugin.settings.enableBannersInPopover
        enableCover = plugin.settings.enableCover && plugin.settings.enableCoversInPopover
        enableIcon = plugin.settings.enableIcon && plugin.settings.enableIconsInPopover
    }
    
    if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && enableBanner) {
        void renderBanner(contentEl, frontmatter, sourcePath, view, plugin);
    } else {
        let oldBannerDivSource = contentEl?.querySelector(".cm-scroller .pp-banner");
        let oldBannerDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .pp-banner");
        oldBannerDivSource?.remove();
        oldBannerDivPreview?.remove();
        contentEl.classList.remove("has-banner")
    }

    let hasCover = false

    if (frontmatter) {
        for (let extraCover of plugin.settings.coverProperties) {
            if (getNestedProperty(frontmatter, extraCover.property)) {
                hasCover = true
                break
            }
        }
    }

    if (frontmatter && hasCover && enableCover) {
        void renderCover(view, contentEl, frontmatter, sourcePath, plugin);
    } else {
        let oldCoverDiv = contentEl?.querySelector(".pp-cover");
        oldCoverDiv?.remove();
        const mdContainer = contentEl.querySelector(".metadata-container");
        mdContainer?.classList.remove("has-cover")
    }
    if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && enableIcon) {
        void renderIcon(contentEl, frontmatter, sourcePath, view, plugin);
        
    } else {
        let oldIconDivSource = contentEl?.querySelector(".cm-scroller .icon-wrapper");
        let oldIconDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .icon-wrapper");
        oldIconDivSource?.remove();
        oldIconDivPreview?.remove();
        contentEl.classList.remove("has-icon")
        let titleIconWrappers = contentEl?.querySelectorAll(".title-icon-wrapper")
        for (let titleIconWrapper of titleIconWrappers) {
            titleIconWrapper.remove()
        }
    }
}









const updateSourcePathsForView = (path: string, metadataEditor: MetadataEditor) => {
    for (let r of metadataEditor.rendered) {
        let propEl = r.containerEl
        propEl.setAttribute("data-source-path", path)
    }
}


export const updateSourcePaths = (file: TFile, plugin: PrettyPropertiesPlugin) => {
    
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
        let view = leaf.view
        if (view instanceof MarkdownView) {
            let viewPath = view?.file?.path
            if (viewPath == file.path) {
                updateSourcePathsForView(viewPath, view.metadataEditor)
            }
        }
    }


    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        let view = leaf.view as CanvasView

        view.canvas?.nodes?.forEach(node => {
            let nodeView = node.child as EmbedMarkdownComponent

            if (nodeView) {
                if ("metadataEditor" in nodeView && "file" in nodeView) {
                    let metadataEditor = nodeView.metadataEditor as MetadataEditor
                    let viewFile = nodeView?.file
                    if (viewFile instanceof TFile && viewFile.path == file.path) {
                        updateSourcePathsForView(viewFile.path, metadataEditor)
                    }
                }
            }
        })
    }

    let propLeaves = plugin.app.workspace.getLeavesOfType("file-properties");
    for (let leaf of propLeaves) {
        let view = leaf.view
        if ("metadataEditor" in view && "file" in view) {
            let metadataEditor = view.metadataEditor as MetadataEditor
            let viewFile = view?.file
            if (viewFile instanceof TFile && viewFile.path == file.path) {
                updateSourcePathsForView(viewFile.path, metadataEditor)
            }
        }
    }
}










export const removeAllExtraElements = (plugin: PrettyPropertiesPlugin) => {

    let mdLeaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of mdLeaves) {
        let view = leaf.view;
        if (view instanceof MarkdownView) {
            removeExtraElementsForView(view)
        }
    }

    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        let view = leaf.view as CanvasView

        view.canvas?.nodes?.forEach(node => {
            let nodeView = node.child

            if (nodeView) {
                removeExtraElementsForView(nodeView)
            }
        })
    }
}







export const removeExtraElementsForView = (view: MarkdownView | WidgetEditorView ) => {


    if ("contentEl" in view) {
        let contentEl = view.contentEl;
        let oldBannerDivSource = contentEl?.querySelector(".cm-scroller .pp-banner");
        let oldBannerDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .pp-banner");
        oldBannerDivSource?.remove();
        oldBannerDivPreview?.remove();
        contentEl.classList.remove("has-banner")

        let oldIconDivSource = contentEl?.querySelector(".cm-scroller .icon-wrapper");
        let oldIconDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .icon-wrapper");
        oldIconDivSource?.remove();
        oldIconDivPreview?.remove();
        contentEl.classList.remove("has-icon")
        let titleIconWrappers = contentEl?.querySelectorAll(".title-icon-wrapper")
        for (let titleIconWrapper of titleIconWrappers) {
            titleIconWrapper.remove()
        } 
    }

    let containerEl = view.containerEl

    let oldCoverDiv = containerEl?.querySelector(".pp-cover");
    oldCoverDiv?.remove();
    const mdContainer = containerEl.querySelector(".metadata-container");
    mdContainer?.classList.remove("has-cover")
    

    let progressWrappers = containerEl.querySelectorAll(".metadata-progress-wrapper")

    for (let progressWrapper of progressWrappers) {
        progressWrapper.remove()
    }

    let overlays = containerEl.querySelectorAll(".pp-formatted-value-overlay")

    for (let overlay of overlays) {
        let property = overlay.closest(".has-property-formatting")
        overlay.remove()
        if (property) {
            property.classList.remove("has-property-formatting")
        }
    }


    if ("metadataEditor" in view) {
        let metadataEditor = view.metadataEditor

        metadataEditor.rendered.forEach(p => {
            p.renderProperty(p.entry, !0)
            
        })
    }
};



















