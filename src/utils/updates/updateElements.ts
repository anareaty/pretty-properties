import { TFile, CachedMetadata, MarkdownView, HoverPopover } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { renderCover, updateCoverForView } from "./updateCovers";
import { renderIcon, updateIconForView } from "./updateIcons";
import { updateDateInput, updateDateTimeInput } from "./updateDates";
import { updateProgress  } from "./updateProgress";
import { updateCardLongtext, updateLongtext, updateMultiselectPill, updateSettingPills, updateTag, updateTagPaneTagsAll, updateTagPill, updateValueListElement } from "./updatePills";
import { renderBanner, updateBannerForView } from "./updateBanners";
import { getNestedProperty } from "../propertyUtils";
import { updateAllMetadataContainers } from "./updateHiddenProperties";
import { querySelectorsWithIframes, querySelectorsWithIframesForContainer } from "../querySelectorsHelper";
import { getPropertyFormatObj, updatePropertyFormatting } from "./updatePropertyFormattings";






export const updateAllProperties = async (plugin:PrettyPropertiesPlugin) => { 

    

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
            
            let state = view.getState()

            if (state.mode == "source") {
                // @ts-expect-error, not typed
                const editorView = view.editor.cm as EditorView;
                editorView.dispatch({
                    userEvent: "updatePillColors"
                })
            }
        }
    }

    
    let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
    for (let leaf of canvasLeaves) {
        //@ts-ignore
        leaf.view.canvas?.nodes?.forEach(n => {

            let nodeView = n.child


            if (nodeView) {
           
                updateCoverForView(nodeView, plugin);
            }
            //@ts-ignore
            



            n.child?.metadataEditor?.rendered?.forEach(p => {
                p.renderProperty(p.entry, !0)
            })
        })
    }


    let baseLeaves = plugin.app.workspace.getLeavesOfType("bases");
    for (let leaf of baseLeaves) {
        //@ts-ignore
        leaf.rebuildView()
    }



    let tags = querySelectorsWithIframes("a.tag")
    
    for (let pill of tags) {
        if (pill instanceof HTMLElement) updateTag(pill, plugin)
    }





    // Also dispatch active editor (useful for canvas)
    let editor = plugin.app.workspace.activeEditor?.editor
    if (editor) {
        // @ts-expect-error, not typed
        const editorView = editor.cm as EditorView;
        editorView.dispatch({
            userEvent: "updatePillColors"
        })
    }

    
    
    updateTagPaneTagsAll(plugin)
    updateSettingPills(plugin)
    updateAllMetadataContainers(plugin)




    /*




    plugin.app.workspace.iterateAllLeaves((leaf) => {

        
        let view = leaf.view



    
        //@ts-ignore
        let file = view.file



        if (view instanceof MarkdownView) {

            updateBannerForView(view, plugin);
            updateIconForView(view, plugin);
            updateCoverForView(view, plugin);
            
            let state = view.getState()

            if (state.mode == "source") {
                // @ts-expect-error, not typed
                const editorView = view.editor.cm as EditorView;
                editorView.dispatch({
                    userEvent: "updatePillColors"
                })
            }
        }

    })


    // Also dispatch active editor (useful for canvas)
    let editor = plugin.app.workspace.activeEditor?.editor
    if (editor) {
        // @ts-expect-error, not typed
        const editorView = editor.cm as EditorView;
        editorView.dispatch({
            userEvent: "updatePillColors"
        })
    }

    
    
    updateTagPaneTagsAll(plugin)
    updateSettingPills(plugin)
    updateAllMetadataContainers(plugin)

    */
    
}




export const updateEmptyProperties = async (plugin: PrettyPropertiesPlugin) => {
    let propertyEls = querySelectorsWithIframes(".metadata-property")
    for (let propertyEl of propertyEls) {
        let emptyLongtext = propertyEl.querySelector(".metadata-input-longtext:empty")
    }
}






export const updateImagesInPopover = async (popover: HoverPopover, plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
    let embed = popover.embed

    if (embed) {
        let file = embed.file

        let contentEl = popover.hoverEl
        if (file instanceof TFile) {
            let cache = plugin.app.metadataCache.getFileCache(file);
            let frontmatter = cache?.frontmatter;
            let sourcePath = file.path || "";
                
            if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && plugin.settings.enableBanner && plugin.settings.enableBannersInPopover) {
                renderBanner(contentEl, frontmatter, sourcePath, plugin);
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

            

            if (frontmatter && hasCover  && plugin.settings.enableCover && plugin.settings.enableCoversInPopover) {
                
                renderCover(popover, contentEl, frontmatter, sourcePath, plugin);
            } else {    
                let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
                oldCoverDiv?.remove();
            }
            if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon && plugin.settings.enableIconsInPopover) {
                renderIcon(contentEl, frontmatter, sourcePath, plugin);
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








export const updateImagesForView = async (view: MarkdownView, plugin: PrettyPropertiesPlugin) => {

    

    let file = view.file;
    let contentEl = view.contentEl;

    if (file) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache == null ? void 0 : cache.frontmatter;
        let sourcePath = file.path || "";
          
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && plugin.settings.enableBanner) {
            renderBanner(contentEl, frontmatter, sourcePath, plugin);
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
            renderCover(view, contentEl, frontmatter, sourcePath, plugin);
        } else {    
            let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
            oldCoverDiv?.remove();
        }
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon) {
            renderIcon(contentEl, frontmatter, sourcePath, plugin);
            
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









export const updateImagesOnCacheChanged = async (file: TFile, cache: CachedMetadata, plugin: PrettyPropertiesPlugin) => {

    let sourcePath = file.path || ""
    let leaves = plugin.app.workspace.getLeavesOfType("markdown");
    for (let leaf of leaves) {
      let view = leaf.view;
      if (view instanceof MarkdownView && view.file?.path == sourcePath) {
        let frontmatter = cache?.frontmatter;
        let contentEl = view.contentEl;
      
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.bannerProperty)  && plugin.settings.enableBanner) {
          renderBanner(contentEl, frontmatter, sourcePath, plugin);
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
          renderCover(view, contentEl, frontmatter, sourcePath, plugin);
        } else {
          let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
          oldCoverDiv?.remove();
        }
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon) {
          renderIcon(contentEl, frontmatter, sourcePath, plugin);
         
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
