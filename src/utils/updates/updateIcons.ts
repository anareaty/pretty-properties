import { MarkdownView, FrontMatterCache, getIcon, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";



export const renderIcon = async (
  contentEl: HTMLElement, 
  frontmatter: FrontMatterCache,
  sourcePath: string,
  plugin: PrettyPropertiesPlugin) => {

    let preview = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
    let source = contentEl.querySelector(".cm-scroller");

    if (contentEl.classList.contains("hover-popover")) {
      preview = contentEl.querySelector(".markdown-preview-view.markdown-rendered.node-insert-event");
    }

    let oldIconDivSource = source?.querySelector(".icon-wrapper");
    let oldIconDivPreview = preview?.querySelector(".icon-wrapper");
    let titleIconWrapper = contentEl?.querySelector(".title-icon-wrapper");

    let iconVal = getIconValue(frontmatter, plugin)

    let oldIconValue
    if (plugin.settings.iconInTitle) {
        oldIconValue = titleIconWrapper?.getAttribute("data-value") || ""
    } else {
        oldIconValue = oldIconDivSource?.getAttribute("data-value") || ""
    }

    if (!iconVal && !oldIconValue) return

    



    if (iconVal && plugin.settings.enableIcon) {
        if (iconVal == oldIconValue) return
        let image = getIconImage(iconVal, sourcePath, plugin)

     

        if (plugin.settings.iconInTitle) {

         
            oldIconDivSource?.remove()
            oldIconDivPreview?.remove()
            let wrappedTitle = contentEl.querySelector(".title-wrapper .inline-title")
            let inlineTitle = contentEl.querySelector(".inline-title")
            let parent = inlineTitle?.parentElement

            if (wrappedTitle) {
                inlineTitle = wrappedTitle
                parent = inlineTitle.parentElement?.parentElement
            } 

            if (inlineTitle) {
                 
                let titleIconWrapper = parent?.querySelector(".title-icon-wrapper");
                let titleWrapper = contentEl.querySelector(".title-wrapper")


                if (image) {
                    if (titleIconWrapper) {
                        titleIconWrapper?.setAttribute("data-value", iconVal)
                        titleIconWrapper?.empty()
                        titleIconWrapper?.append(image)
                    } else {
                        titleIconWrapper = document.createElement("span")
                        titleIconWrapper.classList.add("title-icon-wrapper")
                        titleIconWrapper.setAttribute("data-value", iconVal)
                        titleIconWrapper.append(image)
                    }
                }
                
                if (titleWrapper) {
                    titleWrapper.remove()
                }

                titleWrapper = document.createElement("div")
                titleWrapper.classList.add("title-wrapper")
                parent?.prepend(titleWrapper)
                titleWrapper.append(inlineTitle)

                if (titleWrapper && titleIconWrapper) {
                    titleWrapper.prepend(titleIconWrapper)
                }

                if (titleWrapper instanceof HTMLElement) {
                    titleWrapper.onclick = (e) => {
                        if (e.target instanceof HTMLElement && 
                            e.target?.classList.contains("title-wrapper") && 
                            inlineTitle instanceof HTMLElement) {
                                inlineTitle.focus()
                                document.getSelection()?.modify("move", "forward", "documentboundary")
                            }
                    }
                }

                
            }

        } else {

            let titleIconWrappers = contentEl.querySelectorAll(".title-icon-wrapper")
            for (let titleIconWrapper of titleIconWrappers) {
                titleIconWrapper.remove()
            }

            let iconDiv = document.createElement("div");
            iconDiv.setAttribute("data-value", iconVal)
            iconDiv.classList.add("icon-wrapper");

            if (image) {
                
                let iconOuter = iconDiv.createEl("div", {
                    cls: "icon-outer",
                });
                let iconSizer = iconOuter.createEl("div", {
                    cls: "icon-sizer",
                });
                let iconImage = iconSizer.createEl("div", {
                    cls: "icon-image",
                });
                iconImage.append(image);
            }

            let iconDivClone = iconDiv.cloneNode(true) as HTMLElement

            if (oldIconDivSource) {
                if (oldIconDivSource.outerHTML != iconDiv.outerHTML) {
                    oldIconDivSource.remove();
                    source?.prepend(iconDiv);
                }
            } else {
                source?.prepend(iconDiv);
            }

            if (oldIconDivPreview) {
                if (oldIconDivPreview.outerHTML != iconDivClone.outerHTML) {
                    oldIconDivPreview.remove();
                    preview?.prepend(iconDivClone);
                }
            } else {
                preview?.prepend(iconDivClone);
            }
        }
    } else {

        oldIconDivSource?.remove()
        oldIconDivPreview?.remove()
        let titleIconWrappers = contentEl.querySelectorAll(".title-icon-wrapper")
        for (let titleIconWrapper of titleIconWrappers) {
            titleIconWrapper.remove()
        }
    }
}



export const getIconValue = (frontmatter: FrontMatterCache, plugin: PrettyPropertiesPlugin) => {
    let iconVal = getNestedProperty(frontmatter, plugin.settings.iconProperty);

    // Fix wrong property types
    if (Array.isArray(iconVal)) {
        iconVal = iconVal[0]
    }
    
    if (iconVal && typeof iconVal != "string") {
        iconVal = null
    }

    return iconVal
}



export const getIconImage = (iconVal: string, sourcePath: string, plugin: PrettyPropertiesPlugin) => {
    if (!iconVal) return
    let image:
        | HTMLDivElement
        | HTMLImageElement
        | SVGSVGElement
        | null = getIcon(iconVal);

    if (!image) {
        let iconLink = iconVal;
        if (iconLink.startsWith("http"))
            iconLink = "![](" + iconLink + ")";
        if (iconLink.startsWith("[") && !iconLink.startsWith("!")) iconLink = "!" + iconLink;
        if (!iconLink.startsWith("![")) iconLink = "![[" + iconLink + "]]"
        let iconTemp = document.createElement("div");
        MarkdownRenderer.render(
            plugin.app,
            iconLink,
            iconTemp,
            sourcePath,
            plugin
        );
        image = iconTemp.querySelector("img");
    }

    if (!image) {
        image = document.createElement("div");
        image.classList.add("pp-text-icon");
        image.append(iconVal);
    }
    image.classList.add("pp-icon");

    return image
}


export const updateIconForView = async (
    view: MarkdownView,
    plugin: PrettyPropertiesPlugin
) => {

    let file = view.file
    if (file) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache?.frontmatter;
        let contentEl = view.contentEl;
        let sourcePath = view.file?.path || ""
        if (frontmatter) {

        await renderIcon(contentEl, frontmatter, sourcePath, plugin)
        }
    }

    
}


export const updateAllIcons = (plugin: PrettyPropertiesPlugin) => {

  let leaves = plugin.app.workspace.getLeavesOfType("markdown");
  for (let leaf of leaves) {
    let view = leaf.view
    if (view instanceof MarkdownView) {
        updateIconForView(view, plugin);
    }
  }
}





export const renderTitleIcon = (view: any, plugin: PrettyPropertiesPlugin) => {
  if (plugin.settings.enableIcon && plugin.settings.iconInTitle) {

    
    let currentMode = view.currentMode
    let containerEl = currentMode.containerEl
    if (currentMode.type == "source") {
      containerEl = currentMode.editorEl
    } else {
      containerEl = currentMode.renderer.header.el
    }

    

    let wrappedTitle = containerEl.querySelector(".title-wrapper .inline-title")
    let titleIconWrapper = containerEl.querySelector(".title-icon-wrapper")


    

    let iconVal
    let iconImage
    let file = view.file

    
    if (file) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache?.frontmatter;
        let sourcePath = view.file?.path || ""

        
        
        if (frontmatter) {
          iconVal = getIconValue(frontmatter, plugin)
          
          iconImage = getIconImage(iconVal, sourcePath, plugin)
          
        }
    }

    if (!wrappedTitle) {
      let inlineTitle = containerEl.querySelector(".inline-title")

      if (inlineTitle) {
        let titleWrapper = containerEl.querySelector(".title-wrapper")
        
        if (iconImage) {
          if (titleIconWrapper) {
            titleIconWrapper?.setAttribute("data-value", iconVal)
            titleIconWrapper?.empty()
            titleIconWrapper?.append(iconImage)
          } else {
            titleIconWrapper = document.createElement("span")
            titleIconWrapper.classList.add("title-icon-wrapper")
            titleIconWrapper.append(iconImage)
          }
        }
        
        if (titleWrapper) {
          titleWrapper.remove()
        }

        let parent = inlineTitle.parentElement
        titleWrapper = document.createElement("div")
        titleWrapper.classList.add("title-wrapper")
        parent.prepend(titleWrapper)
        titleWrapper.append(inlineTitle)

        if (titleWrapper && titleIconWrapper) {
          titleWrapper.prepend(titleIconWrapper)
        }

        if (titleWrapper instanceof HTMLElement) {
            titleWrapper.onclick = (e) => {
                if (e.target instanceof HTMLElement && 
                    e.target?.classList.contains("title-wrapper") && 
                    inlineTitle instanceof HTMLElement) {
                        inlineTitle.focus()
                        document.getSelection()?.modify("move", "forward", "documentboundary")
                    }
            }
        }
      } 
    } 

    let iconWrapper = containerEl.querySelector(".icon-wrapper")
    iconWrapper?.remove()
  }
}