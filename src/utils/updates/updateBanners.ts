import { MarkdownView, FrontMatterCache, Component } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";
import { renderImageFromValue } from "../imageUtils";


export const renderBanner = async (
  contentEl: HTMLElement, 
  frontmatter: FrontMatterCache,
  sourcePath: string,
  component: Component,
  plugin: PrettyPropertiesPlugin) => {

    contentEl.classList.remove("has-banner")

    let bannerVal = ""
    let bannerValInitial = getNestedProperty(frontmatter, plugin.settings.bannerProperty);

    // Fix wrong property types

    if (Array.isArray(bannerValInitial) && typeof bannerValInitial[0] == "string") {
        bannerVal = bannerValInitial[0]
    }
    
    if (bannerValInitial && typeof bannerValInitial == "string") {
        bannerVal = bannerValInitial
    }

    let positionVal = getNestedProperty(frontmatter, plugin.settings.bannerPositionProperty)
    if (!positionVal) positionVal = 50
    let positionString = positionVal.toString()

    let bannerContainerPreview = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
    let bannerContainerSource = contentEl.querySelector(".cm-scroller");


    if (contentEl.classList.contains("hover-popover")) {
      bannerContainerPreview = contentEl.querySelector(".markdown-preview-view.markdown-rendered.node-insert-event");
    }
    
    let oldBannerDivSource = bannerContainerSource?.querySelector(".pp-banner");
    let oldBannerDivPreview = bannerContainerPreview?.querySelector(".pp-banner");

    if (!plugin.settings.enableBanner) {
      oldBannerDivSource?.remove();
      oldBannerDivPreview?.remove();
      return
    }

    let oldBannerValue = oldBannerDivSource?.getAttribute("data-value") || ""

    let bannerDiv: HTMLElement | undefined
    let bannerDivClone: HTMLElement | undefined

    if (bannerVal == oldBannerValue) {
      let oldPositionValue = oldBannerDivSource?.getAttribute("data-position") || ""

      if (positionString != oldPositionValue) {
        let imageSource = oldBannerDivSource?.querySelector("img")
        let imagePreview = oldBannerDivPreview?.querySelector("img")
        let styles = {"object-position": "center " + positionString + "%"}
        imageSource?.setCssStyles(styles)
        imagePreview?.setCssStyles(styles)
        oldBannerDivSource?.setAttribute("data-position", positionString)
        oldBannerDivPreview?.setAttribute("data-position", positionString)
      }
      return
    }

  
    if (bannerVal && typeof bannerVal == "string") {

      bannerDiv = await renderImageFromValue(bannerVal, "banner", sourcePath, component, plugin)
      
      if (bannerDiv) {
        contentEl.classList.add("has-banner")
        bannerDiv.setAttribute("data-position", positionString)
        bannerDiv.setCssProps({
          "--banner-position": "center " + positionString + "%"
        })
        bannerDivClone = bannerDiv.cloneNode(true) as HTMLElement
      }
    }

    

    if (oldBannerDivSource) {
      if (!bannerDiv) {
        oldBannerDivSource.remove();
      } else if (oldBannerDivSource.outerHTML != bannerDiv.outerHTML) {
          oldBannerDivSource.remove();
          bannerContainerSource?.prepend(bannerDiv);
      }
    } else if (bannerDiv) {
        bannerContainerSource?.prepend(bannerDiv);
    }

    
    if (oldBannerDivPreview) {
      if (!bannerDivClone) {
        oldBannerDivPreview.remove();
      } else if (oldBannerDivPreview.outerHTML != bannerDivClone.outerHTML) {
          oldBannerDivPreview.remove();
          bannerContainerPreview?.prepend(bannerDivClone);
      }
    } else if (bannerDivClone) {
        bannerContainerPreview?.prepend(bannerDivClone);
    }
}





export const updateBannerForView = (
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
      void renderBanner(contentEl, frontmatter, sourcePath, view, plugin)
    }
  }
}




export const updateAllBanners = (plugin: PrettyPropertiesPlugin) => {
  let leaves = plugin.app.workspace.getLeavesOfType("markdown");
  for (let leaf of leaves) {
    let view = leaf.view
    if (view instanceof MarkdownView) {
        updateBannerForView(view, plugin);
    }
  }
}




  