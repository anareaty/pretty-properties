import { TFile, CachedMetadata, MarkdownView, HoverPopover } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { renderCover, updateCoverForView } from "./updateCovers";
import { renderIcon, updateIconForView } from "./updateIcons";
import { updateDateInput, updateDateTimeInput } from "./updateDates";
import { updateProgress  } from "./updateProgress";
import { updateCardLongtext, updateLongtext, updateMultiselectPill, updateSettingPills, updateTag, updateTagPaneTagsAll, updateTagPill, updateValueListElement } from "./updatePills";
import { renderBanner, updateBannerForView } from "./updateBanners";
import { updateBaseProgressEls } from "./updateBaseProgress";
import { getNestedProperty } from "../propertyUtils";





export const updateAllProperties = async (plugin:PrettyPropertiesPlugin) => { 

    
   
    let multitexts = document.querySelectorAll(".metadata-property:not([data-property-key='tags']) .multi-select-pill")
    
    for (let pill of multitexts) {
        if (pill instanceof HTMLElement) updateMultiselectPill(pill, plugin) 
    }
    
    let tagPills = document.querySelectorAll(".metadata-property[data-property-key='tags'] .multi-select-pill")
    for (let pill of tagPills) {
        if (pill instanceof HTMLElement) updateTagPill(pill, plugin)
    }


    let baseMultitexts = document.querySelectorAll(".bases-metadata-value[data-property-type='multitext'] .multi-select-pill")
    
    for (let pill of baseMultitexts) {
        if (pill instanceof HTMLElement) updateMultiselectPill(pill, plugin) 
    }

    

    let baseCardMultitexts = document.querySelectorAll(".bases-rendered-value[data-property-type='multitext'] .value-list-element:not(:has(a.tag))")

    for (let pill of baseCardMultitexts) {
        if (pill instanceof HTMLElement) updateValueListElement(pill, "data-property-pill-value", "multiselect-pill", plugin) 
    }

        

    

    let baseTagPills = document.querySelectorAll(".bases-metadata-value[data-property-type='tags'] .multi-select-pill")
    
    for (let pill of baseTagPills) {
        if (pill instanceof HTMLElement) updateTagPill(pill, plugin) 
    }

    

    

    let tags = document.querySelectorAll("a.tag")
    
    for (let pill of tags) {
        if (pill instanceof HTMLElement) updateTag(pill, plugin)
    }

    

    let dates = document.querySelectorAll(".metadata-input.mod-date")
    for (let input of dates) {
        if (input instanceof HTMLInputElement) {
            updateDateInput(input, plugin)
            input.onchange = () => {
                if (input instanceof HTMLInputElement) updateDateInput(input, plugin)
            }
        }
    }

    let datetimes = document.querySelectorAll(".metadata-input.mod-datetime")
    for (let input of datetimes) {
        if (input instanceof HTMLInputElement) {
            updateDateTimeInput(input, plugin)
            input.onchange = () => {
                if (input instanceof HTMLInputElement) updateDateTimeInput(input, plugin)
            }
        }
    }

    

    

    let longtexts = document.querySelectorAll(".metadata-input-longtext")

    for (let input of longtexts) {
        if (input instanceof HTMLElement) {
            updateLongtext(input, plugin);
            input.onblur = () => {
                if (input instanceof HTMLElement) updateLongtext(input, plugin);
            }
        }
    }



    let cardLongTexts = document.querySelectorAll(".bases-rendered-value[data-property-type='text']")
    for (let el of cardLongTexts) {
        if (el instanceof HTMLElement) {
            updateCardLongtext(el, plugin);
        }
    }


    

    plugin.app.workspace.iterateAllLeaves((leaf) => {
        let view = leaf.view

        //@ts-ignore
        let file = view.file

        if (file instanceof TFile) {
            let numbers = view.containerEl.querySelectorAll("input.metadata-input-number")
            for (let input of numbers) {
                if (input instanceof HTMLElement) {
                    let num = input.closest(".metadata-property")
                    let sourcePath = file.path
                    if (num instanceof HTMLElement) {
                        updateProgress(num, plugin, sourcePath)
                        input.onchange = () => {
                            if (num instanceof HTMLElement) updateProgress(num, plugin, sourcePath)
                        }
                    }
                }
            }
        }


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

    
    
    updateTagPaneTagsAll(plugin)
    updateSettingPills(plugin)



    // Remove this after Obsidian v.1.10 goes public

    updateBaseProgressEls()

    

    
}






export const updateImagesInPopover = async (popover: HoverPopover, plugin: PrettyPropertiesPlugin) => {
    //@ts-ignore
    let embed = popover.embed

    

   
    if (embed) {
        let file = embed.file

        let contentEl = popover.hoverEl
        if (file) {
            let cache = plugin.app.metadataCache.getFileCache(file);
            let frontmatter = cache == null ? void 0 : cache.frontmatter;
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
                if (getNestedProperty(frontmatter, plugin.settings.coverProperty)) {
                    hasCover = true
                } else {
                    for (let prop of plugin.settings.extraCoverProperties) {
                        if (getNestedProperty(frontmatter, prop)) {
                            hasCover = true
                            break
                        }
                    }
                }
            }

            

            if (frontmatter && hasCover  && plugin.settings.enableCover && plugin.settings.enableCoversInPopover) {
                
                renderCover(contentEl, frontmatter, sourcePath, plugin);
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
          
        if (frontmatter && frontmatter[plugin.settings.bannerProperty]  && plugin.settings.enableBanner) {
            renderBanner(contentEl, frontmatter, sourcePath, plugin);
        } else {
            let oldBannerDivSource = contentEl?.querySelector(".cm-scroller .banner-image");
            let oldBannerDivPreview = contentEl?.querySelector(".markdown-reading-view > .markdown-preview-view .banner-image");
            oldBannerDivSource?.remove();
            oldBannerDivPreview?.remove();
        }
    
        let hasCover = false
    
        if (frontmatter) {
            if (getNestedProperty(frontmatter, plugin.settings.coverProperty)) {
                hasCover = true
            } else {
                for (let prop of plugin.settings.extraCoverProperties) {
                    if (getNestedProperty(frontmatter, prop)) {
                        hasCover = true
                        break
                    }
                }
            }
        }
    
        if (frontmatter && hasCover  && plugin.settings.enableCover) {
            renderCover(contentEl, frontmatter, sourcePath, plugin);
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
          let oldBannerDiv = contentEl?.querySelector(".banner-image");
          oldBannerDiv?.remove();
        }

        let hasCover = false

        if (frontmatter) {
            if (getNestedProperty(frontmatter, plugin.settings.coverProperty)) {
                hasCover = true
            } else {
                for (let prop of plugin.settings.extraCoverProperties) {
                    if (getNestedProperty(frontmatter, prop)) {
                        hasCover = true
                        break
                    }
                }
            }
        }




        

        if (frontmatter && hasCover && plugin.settings.enableCover) {
          renderCover(contentEl, frontmatter, sourcePath, plugin);
        } else {
          let oldCoverDiv = contentEl?.querySelector(".metadata-side-image");
          oldCoverDiv?.remove();
        }
        if (frontmatter && getNestedProperty(frontmatter, plugin.settings.iconProperty)  && plugin.settings.enableIcon) {
          renderIcon(contentEl, frontmatter, sourcePath, plugin);
        } else {
          let oldIconDiv = contentEl?.querySelector(".icon-image");
          oldIconDiv?.remove();
        }


        





      }
    }
  }