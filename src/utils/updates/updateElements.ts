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






export const updateAllProperties = async (plugin:PrettyPropertiesPlugin) => { 

    let multitexts = querySelectorsWithIframes(".metadata-property:not([data-property-key='tags']) .multi-select-pill")
    
    for (let pill of multitexts) {
        if (pill instanceof HTMLElement) updateMultiselectPill(pill, plugin) 
    }
    
    let tagPills = querySelectorsWithIframes(".metadata-property[data-property-key='tags'] .multi-select-pill")
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

    

    

    let tags = querySelectorsWithIframes("a.tag")
    
    for (let pill of tags) {
        if (pill instanceof HTMLElement) updateTag(pill, plugin)
    }

    

    let dates = querySelectorsWithIframes(".metadata-input.mod-date")
    for (let input of dates) {
        if (input instanceof HTMLInputElement) {
            updateDateInput(input, plugin)
            input.onchange = () => {
                if (input instanceof HTMLInputElement) updateDateInput(input, plugin)
            }
            input.onblur = () => {
                if (input instanceof HTMLInputElement) updateDateInput(input, plugin)
            }
        }
    }

    let datetimes = querySelectorsWithIframes(".metadata-input.mod-datetime")
    for (let input of datetimes) {
        if (input instanceof HTMLInputElement) {
            updateDateTimeInput(input, plugin)
            input.onchange = () => {
                if (input instanceof HTMLInputElement) updateDateTimeInput(input, plugin)
            }
            input.onblur = () => {
                if (input instanceof HTMLInputElement) updateDateTimeInput(input, plugin)
            }
        }
    }

    

    

    let longtexts = querySelectorsWithIframes(".metadata-input-longtext")

    for (let input of longtexts) {
        if (input instanceof HTMLElement) {
            updateLongtext(input, plugin);
            input.onblur = () => {
                if (input instanceof HTMLElement) updateLongtext(input, plugin);
            }
        }
    }



    let mdLinks = querySelectorsWithIframes(".metadata-property-value > .metadata-link")

    for (let link of mdLinks) {
        if (link instanceof HTMLElement) {
            let parent = link.parentElement
            if (parent instanceof HTMLElement) {
                let clickEvent = () => {
                    let longtext = parent!.querySelector(".metadata-input-longtext")
                    if (longtext instanceof HTMLElement) {
                        updateLongtext(longtext, plugin);
                        longtext.onblur = () => {
                            if (longtext instanceof HTMLElement) updateLongtext(longtext, plugin);
                        }
                    }
                    parent!.removeEventListener('click', clickEvent)
                }
                parent.addEventListener("click", clickEvent)
            }
        }
    }


    let unknown = querySelectorsWithIframes(".metadata-property-value-item.mod-unknown")

    for (let el of unknown) {
        if (el instanceof HTMLElement) {
            let property = el.parentElement?.parentElement
            if (el.innerText == "null") {
                property?.classList.add("is-empty")
            } else {
                property?.classList.remove("is-empty")
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
            let numbers = querySelectorsWithIframesForContainer("input.metadata-input-number", view.containerEl)
            for (let input of numbers) {
                if (input instanceof HTMLInputElement) {
                    
                    let num = input.closest(".metadata-property")
                    let sourcePath = file.path
                    if (num instanceof HTMLElement) {
                        updateProgress(num, plugin, sourcePath)
                        if (input.value === "") {
                            num.classList.add("is-empty")
                        } else {
                            num.classList.remove("is-empty")
                        }
                        input.onchange = () => {
                            if (num instanceof HTMLElement) {
                                updateProgress(num, plugin, sourcePath)
                                if (input instanceof HTMLInputElement && input.value === "") {
                                    num.classList.add("is-empty")
                                } else {
                                    num.classList.remove("is-empty")
                                }
                            }
                            updateAllMetadataContainers()
                            
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
    
    updateAllMetadataContainers()
    
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