import { MarkdownView, FrontMatterCache, getIcon, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";


export const renderIcon = async (
  contentEl: HTMLElement, 
  frontmatter: FrontMatterCache,
  sourcePath: string,
  plugin: PrettyPropertiesPlugin) => {

    let iconContainerPreview = contentEl.querySelector(".markdown-reading-view > .markdown-preview-view");
    let iconContainerSource = contentEl.querySelector(".cm-scroller");

    if (contentEl.classList.contains("hover-popover")) {
      iconContainerPreview = contentEl.querySelector(".markdown-preview-view.markdown-rendered.node-insert-event");
    }

    let iconVal = getNestedProperty(frontmatter, plugin.settings.iconProperty);

    // Fix wrong property types

    if (Array.isArray(iconVal)) {
        iconVal = iconVal[0]
    }
    
    if (iconVal && typeof iconVal != "string") {
        iconVal = null
    }



    let oldIconDivSource = iconContainerSource?.querySelector(".icon-wrapper");
    let oldIconDivPreview = iconContainerPreview?.querySelector(".icon-wrapper");

    let oldIconValue = oldIconDivSource?.getAttribute("data-value") || ""

    if (iconVal == oldIconValue) {
        return
    }

    let iconDiv = document.createElement("div");
    iconDiv.setAttribute("data-value", iconVal)
    
    iconDiv.classList.add("icon-wrapper");

    if (iconVal && plugin.settings.enableIcon) {
        let image:
            | HTMLDivElement
            | HTMLImageElement
            | SVGSVGElement
            | null = getIcon(iconVal);

        if (!image) {
            let iconLink = iconVal;
            if (iconLink.startsWith("http"))
                iconLink = "![](" + iconLink + ")";
            if (!iconLink.startsWith("!")) iconLink = "!" + iconLink;
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

        if (image) {
            image.classList.add("pp-icon");
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
    }

    let iconDivClone = iconDiv.cloneNode(true) as HTMLElement

    if (oldIconDivSource) {
        if (oldIconDivSource.outerHTML != iconDiv.outerHTML) {
            oldIconDivSource.remove();
            iconContainerSource?.prepend(iconDiv);
        }
    } else {
        iconContainerSource?.prepend(iconDiv);
    }

    if (oldIconDivPreview) {
        if (oldIconDivPreview.outerHTML != iconDivClone.outerHTML) {
            oldIconDivPreview.remove();
            iconContainerPreview?.prepend(iconDivClone);
        }
    } else {
        iconContainerPreview?.prepend(iconDivClone);
    }
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
      renderIcon(contentEl, frontmatter, sourcePath, plugin)
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