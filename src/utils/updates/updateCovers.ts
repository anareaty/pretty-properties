import { MarkdownView, FrontMatterCache, MarkdownRenderer } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";


export const renderCover = async (
  contentEl: HTMLElement, 
  frontmatter: FrontMatterCache,
  sourcePath: string,
  plugin: PrettyPropertiesPlugin) => {

    

   
   

    let mdContainer = contentEl.querySelector(".metadata-container")

    let coverVal;

    let props = [...plugin.settings.extraCoverProperties];
    props.unshift(plugin.settings.coverProperty);


    

    for (let prop of props) {
        coverVal = getNestedProperty(frontmatter, prop);
        if (coverVal) break;
    }

    

    // Fix wrong property types

    if (Array.isArray(coverVal)) {
        coverVal = coverVal[0]
    }

    if (coverVal && typeof coverVal != "string") {
        coverVal = null
    }

 



    let cssVal = frontmatter?.cssclasses;

    if (mdContainer instanceof HTMLElement) {
        let coverDiv;
        let oldCoverDiv = mdContainer.querySelector(".metadata-side-image");

        if (coverVal && plugin.settings.enableCover) {
            if (coverVal.startsWith("http")) coverVal = "![](" + coverVal + ")";
            if (!coverVal.startsWith("!")) coverVal = "!" + coverVal;
            coverDiv = document.createElement("div");
            coverDiv.classList.add("metadata-side-image");

            if (cssVal && (cssVal.includes("cover-vertical") || cssVal.includes("cover-vertical-cover"))) {
                coverDiv.classList.add("vertical-cover");
            } 
            else if (cssVal && cssVal.includes("cover-vertical-contain")) {
                coverDiv.classList.add("vertical-contain");
            }
            else if (cssVal && cssVal.includes("cover-horizontal-contain")) {
                coverDiv.classList.add("horizontal-contain");
            } 
            else if (cssVal && (cssVal.includes("cover-horizontal") || cssVal.includes("cover-horizontal-cover"))) {
                coverDiv.classList.add("horizontal-cover");
            } 
            else if (cssVal && cssVal.includes("cover-square")) {
                coverDiv.classList.add("square");
            } 
            else if (cssVal && cssVal.includes("cover-circle")) {
                coverDiv.classList.add("circle");
            } 
            else if (cssVal && cssVal.includes("cover-initial-width-2")) {
                coverDiv.classList.add("initial-2");
            }
            else if (cssVal && cssVal.includes("cover-initial-width-3")) {
                coverDiv.classList.add("initial-3");
            }
            else {
                coverDiv.classList.add("initial");
            }

            let coverTemp = document.createElement("div");
            MarkdownRenderer.render(
                plugin.app,
                coverVal,
                coverTemp,
                sourcePath,
                plugin
            );
            let image = coverTemp.querySelector("img");
            if (image) {
                coverDiv.append(image);
            }
        }

        if (coverDiv) {
            if (oldCoverDiv) {
                if (coverDiv.outerHTML != oldCoverDiv.outerHTML) {
                    oldCoverDiv.remove();
                    mdContainer.prepend(coverDiv);
                }
            } else {
                mdContainer.prepend(coverDiv);
            }
        } else {
            if (oldCoverDiv) oldCoverDiv.remove();
        }
    }

}


export const updateCoverForView = async (
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
      renderCover(contentEl, frontmatter, sourcePath, plugin)
    }
  }
}



export const updateAllCovers = (plugin: PrettyPropertiesPlugin) => {
  let leaves = plugin.app.workspace.getLeavesOfType("markdown");
  for (let leaf of leaves) {
    let view = leaf.view
    if (view instanceof MarkdownView) {
        updateCoverForView(view, plugin);
    }
  }
}