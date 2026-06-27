import { MarkdownView, FrontMatterCache, getIcon, MarkdownRenderer, Component } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";
import { renderImageFromValue } from "../imageUtils";



export const renderIcon = async (
  contentEl: HTMLElement, 
  frontmatter: FrontMatterCache,
  sourcePath: string,
  component: Component,
  plugin: PrettyPropertiesPlugin) => {

    contentEl.classList.remove("has-icon")

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
        let image = await getIconImage(iconVal, sourcePath, component, plugin)

     

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
                        titleIconWrapper = createSpan()
                        titleIconWrapper.classList.add("title-icon-wrapper")
                        titleIconWrapper.setAttribute("data-value", iconVal)
                        titleIconWrapper.append(image)
                    }
                }
                
                if (titleWrapper) {
                    titleWrapper.remove()
                }

                titleWrapper = createDiv()
                titleWrapper.classList.add("title-wrapper")
                parent?.prepend(titleWrapper)
                titleWrapper.append(inlineTitle)

                if (titleWrapper && titleIconWrapper) {
                    titleWrapper.prepend(titleIconWrapper)
                }

                if (titleWrapper?.instanceOf(HTMLElement)) {
                    titleWrapper.onclick = (e) => {
                        if (e.target instanceof HTMLElement && 
                            e.target?.classList.contains("title-wrapper") && 
                            inlineTitle?.instanceOf(HTMLElement)) {
                                inlineTitle.focus()
                                // @ts-ignore: Property 'modify' is a non-standard API
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

            let iconDiv = createDiv();
            iconDiv.setAttribute("data-value", iconVal)
            iconDiv.classList.add("icon-wrapper");

            if (image) {

                contentEl.classList.add("has-icon")
                
                let iconOuter = iconDiv.createDiv({
                    cls: "icon-outer",
                });
                let iconSizer = iconOuter.createDiv({
                    cls: "icon-sizer",
                });

                
                let iconImage = iconSizer.createDiv({
                    cls: "pp-icon",
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



export const getIconValue = (frontmatter: FrontMatterCache, plugin: PrettyPropertiesPlugin) : string |  null | undefined => {
    let iconValInitial = getNestedProperty(frontmatter, plugin.settings.iconProperty);
    let iconVal: string | null | undefined

    // Fix wrong property types
    if (Array.isArray(iconValInitial)) {
        iconVal = iconValInitial[0]
    } else if (typeof iconValInitial == "string") {
        iconVal = iconValInitial
    } else {
        iconVal = null
    }

    return iconVal
}



export const getIconImage = async (iconVal: string, sourcePath: string, component: Component, plugin: PrettyPropertiesPlugin) => {
    if (!iconVal) return
    let image:
        | HTMLDivElement
        | HTMLImageElement
        | SVGSVGElement
        | null = getIcon(iconVal);

    if (!image) {
        let iconLink = iconVal;
        let imageEl = await renderImageFromValue(iconLink, "icon", sourcePath, component, plugin)

        

        if (imageEl) {
            return imageEl
        }
    }

    if (!image) {
        image = createDiv();
        image.classList.add("pp-text-icon");
        image.append(iconVal);
    }

    image.classList.add("pp-icon-image");

    return image
}


export const updateIconForView = (
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

        renderIcon(contentEl, frontmatter, sourcePath, view, plugin)
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





export const renderTitleIcon = async (view: MarkdownView, plugin: PrettyPropertiesPlugin) => {
  if (plugin.settings.enableIcon && plugin.settings.iconInTitle) {

    let currentMode = view.getMode()
    let containerEl: HTMLElement

    if (currentMode == "preview") {
        //@ts-expect-error, not typed
        containerEl = (view.previewMode.renderer as {header: {el: HTMLElement}}).header.el
    } else {
       
        containerEl = (view.editMode as {editorEl: HTMLElement}).editorEl
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
          if (iconVal) {
            iconImage = await getIconImage(iconVal, sourcePath, view, plugin)
            
          }
          
          
        }
    }

    if (!wrappedTitle) {
      let inlineTitle = containerEl.querySelector(".inline-title")

      if (inlineTitle) {
        let titleWrapper = containerEl.querySelector(".title-wrapper")
        
        if (iconVal && iconImage) {
          if (titleIconWrapper) {
            titleIconWrapper?.setAttribute("data-value", iconVal)
            titleIconWrapper?.empty()
            titleIconWrapper?.append(iconImage)
          } else {
            titleIconWrapper = createSpan()
            titleIconWrapper.classList.add("title-icon-wrapper")
            titleIconWrapper.append(iconImage)
          }
        }
        
        if (titleWrapper) {
          titleWrapper.remove()
        }

        let parent = inlineTitle.parentElement
        titleWrapper = createDiv()
        titleWrapper.classList.add("title-wrapper")
        parent?.prepend(titleWrapper)
        titleWrapper.append(inlineTitle)

        if (titleWrapper && titleIconWrapper) {
          titleWrapper.prepend(titleIconWrapper)
        }

        if (titleWrapper?.instanceOf(HTMLElement)) {

            titleWrapper.onmousedown = (e) => {
                if (e.target instanceof HTMLElement && e.target?.classList.contains("title-wrapper")) {
                    let selection = window.getSelection()
                    selection?.collapse(selection.focusNode)
                }
            }

            titleWrapper.onmouseup = (e) => {
                let selection = window.getSelection()
                if (selection && !selection.isCollapsed) {
                    let selectionContainer = selection.focusNode?.parentElement
                    if (selectionContainer?.classList.contains("inline-title")) {
                        return;
                    }
                }

                if (e.target instanceof HTMLElement && 
                e.target?.classList.contains("title-wrapper") && 
                inlineTitle?.instanceOf(HTMLElement)) {
                    inlineTitle.focus()
                    // @ts-ignore: Property 'modify' is a non-standard API
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