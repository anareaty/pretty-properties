import { MarkdownRenderer, MarkdownView, FrontMatterCache, Component } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";


export const renderBanner = async (
  contentEl: HTMLElement, 
  frontmatter: FrontMatterCache,
  sourcePath: string,
  component: Component,
  plugin: PrettyPropertiesPlugin) => {

    contentEl.classList.remove("has-banner")

    let bannerVal = getNestedProperty(frontmatter, plugin.settings.bannerProperty);

    
    // Fix wrong property types

    if (Array.isArray(bannerVal)) {
        bannerVal = bannerVal[0]
    }
    
    if (bannerVal && typeof bannerVal != "string") {
        bannerVal = ""
    }

    

    


    let positionVal = getNestedProperty(frontmatter, plugin.settings.bannerPositionProperty)
    if (!positionVal) positionVal = 50
    let positionString = positionVal.toString()

    let bannerContainerPreview = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
    let bannerContainerSource = contentEl.querySelector(".cm-scroller");


    

    if (contentEl.classList.contains("hover-popover")) {
      bannerContainerPreview = contentEl.querySelector(".markdown-preview-view.markdown-rendered.node-insert-event");
    }
    
    let oldBannerDivSource = bannerContainerSource?.querySelector(".banner-image");
    let oldBannerDivPreview = bannerContainerPreview?.querySelector(".banner-image");

    if (!plugin.settings.enableBanner) {
      oldBannerDivSource?.remove();
      oldBannerDivPreview?.remove();
      return
    }

    let oldBannerValue = oldBannerDivSource?.getAttribute("data-value") || ""

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

    let bannerDiv = createDiv();
    bannerDiv.setAttribute("data-value", bannerVal)
    bannerDiv.setAttribute("data-position", positionString)

    bannerDiv.classList.add("banner-image");

    if (bannerVal && typeof bannerVal == "string") {
        if (bannerVal.startsWith("http")) bannerVal = "![](" + bannerVal + ")";
        if (bannerVal.startsWith("[") && !bannerVal.startsWith("!")) bannerVal = "!" + bannerVal;
        if (!bannerVal.startsWith("![")) bannerVal = "![[" + bannerVal + "]]"

        let bannerTemp = createDiv();

        await MarkdownRenderer.render(
            plugin.app,
            bannerVal,
            bannerTemp,
            sourcePath,
            component
        );
        let image = bannerTemp.querySelector("img");
        if (image) {
            if (positionVal) {
                image.setAttribute("style", "object-position: center " + positionString + "%;")
            }

            bannerDiv.append(image);
            contentEl.classList.remove("has-banner")
        }
    }

    let bannerDivClone = bannerDiv.cloneNode(true) as HTMLElement

    if (oldBannerDivSource) {
        if (oldBannerDivSource.outerHTML != bannerDiv.outerHTML) {
            oldBannerDivSource.remove();
            bannerContainerSource?.prepend(bannerDiv);
        }
    } else {
        bannerContainerSource?.prepend(bannerDiv);
    }

    

    if (oldBannerDivPreview) {
        if (oldBannerDivPreview.outerHTML != bannerDivClone.outerHTML) {
            oldBannerDivPreview.remove();
            bannerContainerPreview?.prepend(bannerDivClone);
        }
    } else {
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




  