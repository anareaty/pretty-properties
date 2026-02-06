import { MarkdownView, FrontMatterCache, MarkdownRenderer, loadPdfJs, normalizePath, TFile } from "obsidian";
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
        let isPdf

        

        if (coverVal) {
            isPdf = coverVal.match(/^(\!)?(\[\[)(.+\.pdf)(\]\])$/) || 
            coverVal.match(/^(\!)?(\[)([^\]]*)(\])(\()(.+\.pdf)(\))$/)
        }


        
        

        if (coverVal && plugin.settings.enableCover) {
            if (coverVal.startsWith("http")) coverVal = "![](" + coverVal + ")";
            if (coverVal.startsWith("[") && !coverVal.startsWith("!")) coverVal = "!" + coverVal;
            if (!coverVal.startsWith("![")) coverVal = "![[" + coverVal + "]]"

            coverDiv = document.createElement("div");
            coverDiv.setAttribute("data-value", coverVal)
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

            

            if (isPdf) {

                let relativePath = ""
                if (isPdf.length == 5) {
                    relativePath = isPdf[3]
                } else if (isPdf.length == 8) {
                    relativePath = isPdf[6]
                    relativePath = relativePath.replaceAll("%20", " ")
                }

                let pdfCover = await renderPdfCover(relativePath, sourcePath, plugin)

                if (pdfCover) {
                    coverDiv.append(pdfCover);
                }
            } else {
                
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
                    image.classList.add("pp-cover-image")
                    coverDiv.append(image);
                }
            }
        }

        let oldCoverDiv = mdContainer.querySelector(".metadata-side-image")
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



export const renderPdfCover = async (relativePath: string, sourcePath: string, plugin: PrettyPropertiesPlugin) => {

    let pdfPath = plugin.app.metadataCache.getFirstLinkpathDest(relativePath, sourcePath)?.path || ""

    if (!pdfPath) return

    //@ts-ignore
    let pdfjsLib = window.pdfjsLib
    if (!pdfjsLib) {
        pdfjsLib = await loadPdfJs()
    }
    let canvas
    let pdf
    let path = plugin.app.vault.adapter.getResourcePath(normalizePath(pdfPath))

    try {
        pdf = await pdfjsLib.getDocument(path)?.promise
    } catch(err) {
        return
    }

    if (pdf) {
        let firstPage = await pdf.getPage(1)
        if (firstPage) {
            let viewport = firstPage.getViewport({scale: 1});
            canvas = document.createElement("canvas")
            canvas.classList.add("pp-pdf-cover-canvas")
            canvas.classList.add("pp-cover-image")
            let context = canvas.getContext('2d')
            canvas.width = viewport.width
            canvas.height = viewport.height
            await firstPage.render({
                canvasContext: context,
                viewport: viewport
            });
            let pdfContainer = document.createElement("div")
            pdfContainer.classList.add("pp-pdf-cover-container")
            pdfContainer.append(canvas)
            return pdfContainer
        }
    }
    return 
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