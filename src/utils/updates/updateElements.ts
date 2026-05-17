import { TFile, CachedMetadata, MarkdownView, BasesView, HoverPopover } from "obsidian";

import PrettyPropertiesPlugin from "src/main";
import { renderCover, updateCoverForView } from "./updateCovers";
import { renderIcon, updateIconForView } from "./updateIcons";
import { updateSettingPills, updateTagPaneTagsAll } from "./updatePills";
import { renderBanner, updateBannerForView } from "./updateBanners";
import { getNestedProperty } from "../propertyUtils";
import { updateAllMetadataContainers } from "./updateHiddenProperties";
import { querySelectorsWithIframes } from "../querySelectorsHelper";
import { processTagsInPreviewElement } from "src/extensions/tagPostProcessor";
import { updateWidgets } from "src/patches/patchWidgets";
import { processBaseCardProperties } from "src/patches/patchBaseCards";
import { processBaseListProperties } from "src/patches/patchBaseList";
import { processBaseTableCellTags } from "src/patches/patchBaseTable";
import { AliasesPropertyWidgetComponent, 
    BasesView as BasesLeafView, 
    CanvasView, 
    DatePropertyWidgetComponentBase,  
    MetadataEditor, 
    MultitextPropertyWidgetComponent, 
    PropertyWidgetComponentBase, 
    TagsPropertyWidgetComponent, 
    TextPropertyWidgetComponent 
} from "@obsidian-typings/obsidian-public-latest";


interface TableBasesView extends BasesView {
    updateVirtualDisplay: () => void
    rows: {
        cells: {
            prop: string,
            el: HTMLElement,
            renderer: {
                propertyEditor: PropertyWidgetComponentBase,
                inferredType: {type: string},
                entry: {file: {path: string}},
                el: HTMLElement,
                val: string
            }
        }[]
    }[],
}

interface Popover extends HoverPopover {
    embed: {file: TFile}
}



export const updateAllProperties = (plugin:PrettyPropertiesPlugin) => { 

    

    let mdLeaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of mdLeaves) {
        
        let view = leaf.view

        if (view instanceof MarkdownView) {
            
            //@ts-ignore
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
                editorView.dispatch({
                    userEvent: "updatePillColors"
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
                    editorView.dispatch({
                        userEvent: "updatePillColors"
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
          


            

            if (baseView.type == "table") {

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


                            

                            let args = [cell.renderer.el, value, ctx]
                            updateWidgets(type, propertyEditor, args, plugin)



                            

                        } else {
                            processBaseTableCellTags(cell, plugin)
                        }
                    }
                }
            }

            else if (baseView.type == "cards") {
                processBaseCardProperties(baseView, plugin)
            }

            else if (baseView.type == "list") {
                processBaseListProperties(baseView, plugin)
            }
        }

        
        

        
        
    }

    updateTagPaneTagsAll(plugin)
    updateSettingPills(plugin)
    updateAllMetadataContainers(plugin)
}




export const updateEmptyProperties = (plugin: PrettyPropertiesPlugin) => {
    let propertyEls = querySelectorsWithIframes(".metadata-property")
    for (let propertyEl of propertyEls) {
        let emptyLongtext = propertyEl.querySelector(".metadata-input-longtext:empty")
    }
    //??????????????????????
}





export const updateImagesInPopover = (popover: HoverPopover, plugin: PrettyPropertiesPlugin) => {

    let embed = (popover as Popover).embed
    

    

    if (embed) {
        let file = embed.file

        let contentEl = popover.hoverEl
        if (file instanceof TFile) {
            let cache = plugin.app.metadataCache.getFileCache(file);
            let frontmatter = cache?.frontmatter;
            let sourcePath = file.path || "";
                
            if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && plugin.settings.enableBanner && plugin.settings.enableBannersInPopover) {
                void renderBanner(contentEl, frontmatter, sourcePath, popover, plugin);
            } else {
                let oldBannerDivSource = contentEl?.querySelector(".cm-scroller .banner-image");
                let oldBannerDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .banner-image");
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

            

            if (frontmatter && hasCover  && plugin.settings.enableCover && plugin.settings.enableCoversInPopover) {
                
                void renderCover(popover, contentEl, frontmatter, sourcePath, plugin);
            } else {    
                let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
                oldCoverDiv?.remove();
            }
            if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon && plugin.settings.enableIconsInPopover) {
                renderIcon(contentEl, frontmatter, sourcePath, popover, plugin);
            } else {
                let oldIconDivSource = contentEl?.querySelector(".cm-scroller .icon-wrapper");
                let oldIconDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .icon-wrapper");
                oldIconDivSource?.remove();
                oldIconDivPreview?.remove();
                let titleIconWrappers = contentEl?.querySelectorAll(".title-icon-wrapper")
                for (let titleIconWrapper of titleIconWrappers) {
                    titleIconWrapper.remove()
                }
            }
        }
    }
}








export const updateImagesForView = (view: MarkdownView, plugin: PrettyPropertiesPlugin) => {

    

    let file = view.file;
    let contentEl = view.contentEl;

    if (file) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache == null ? void 0 : cache.frontmatter;
        let sourcePath = file.path || "";
          
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && plugin.settings.enableBanner) {
            void renderBanner(contentEl, frontmatter, sourcePath, view, plugin);
        } else {
            let oldBannerDivSource = contentEl?.querySelector(".cm-scroller .banner-image");
            let oldBannerDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .banner-image");
            oldBannerDivSource?.remove();
            oldBannerDivPreview?.remove();
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

        
    
        if (frontmatter && hasCover  && plugin.settings.enableCover) {
            void renderCover(view, contentEl, frontmatter, sourcePath, plugin);
        } else {    
            let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
            oldCoverDiv?.remove();
        }
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon) {
            renderIcon(contentEl, frontmatter, sourcePath, view, plugin);
            
        } else {
            let oldIconDivSource = contentEl?.querySelector(".cm-scroller .icon-wrapper");
            let oldIconDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .icon-wrapper");
            oldIconDivSource?.remove();
            oldIconDivPreview?.remove();
            let titleIconWrappers = contentEl?.querySelectorAll(".title-icon-wrapper")
            for (let titleIconWrapper of titleIconWrappers) {
                titleIconWrapper.remove()
            }
        }
    }


  };









export const updateImagesOnCacheChanged = (file: TFile, cache: CachedMetadata, plugin: PrettyPropertiesPlugin) => {

    let sourcePath = file.path || ""
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
      let view = leaf.view;
      if (view instanceof MarkdownView && view.file?.path == sourcePath) {
        let frontmatter = cache?.frontmatter;
        let contentEl = view.contentEl;
      
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && plugin.settings.enableBanner) {
          void renderBanner(contentEl, frontmatter, sourcePath, view, plugin);
        } else {
            let oldBannerDivSource = contentEl?.querySelector(".cm-scroller .banner-image");
            let oldBannerDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .banner-image");
            oldBannerDivSource?.remove();
            oldBannerDivPreview?.remove();
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




        

        if (frontmatter && hasCover && plugin.settings.enableCover) {
          void renderCover(view, contentEl, frontmatter, sourcePath, plugin);
        } else {
          let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
          oldCoverDiv?.remove();
        }
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon) {
          renderIcon(contentEl, frontmatter, sourcePath, view, plugin);
         
        } else {
            let oldIconDivSource = contentEl?.querySelector(".cm-scroller .icon-wrapper");
            let oldIconDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .icon-wrapper");
            oldIconDivSource?.remove();
            oldIconDivPreview?.remove();
            let titleIconWrappers = contentEl?.querySelectorAll(".title-icon-wrapper")
            for (let titleIconWrapper of titleIconWrappers) {
                titleIconWrapper.remove()
            }
        }


        





      }
    }
  }
