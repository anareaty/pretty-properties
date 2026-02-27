import {
	MarkdownView,
	FrontMatterCache,
	MarkdownRenderer,
	loadPdfJs,
	normalizePath,
	Component
} from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";
import { hookUpLinks } from "../internalLinksUtils";

enum CoverType {
	Pdf,
	Url,
	Wikilink,
	Markdown,
}

const pdfRegex = /^(\!)?(?:\[\[(.+\.pdf)\]\]|\[([^\]]*)\]\((.+\.pdf)\))$/;
const urlRegex = /^(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/i;
const wikiLinkRegex = /^\[\[(.+?)\]\]$/;

export const renderCover = async (
	component: Component,
	contentEl: HTMLElement,
	frontmatter: FrontMatterCache,
	sourcePath: string,
	plugin: PrettyPropertiesPlugin
) => {
	const mdContainer = contentEl.querySelector(".metadata-container");
	if (!(mdContainer instanceof HTMLElement))
		return;

	const properties = [plugin.settings.coverProperty, ...plugin.settings.extraCoverProperties];
	const propertyFormats = [
		plugin.settings.coverPropertyFormat,
		...plugin.settings.extraCoverPropertyFormats,
	];

	let coverDiv: HTMLDivElement | undefined;

	if (plugin.settings.enableCover) {
		const coverItems: HTMLElement[] = [];

		for (let i = 0; i < properties.length; i++) {
			const property = properties[i];
			let propertyValue = getNestedProperty(frontmatter, property);

			if (Array.isArray(propertyValue))
				propertyValue = propertyValue[0];
			if (!propertyValue)
				continue;

			let coverVal = propertyValue.toString();
			const formatString = propertyFormats[i];

			if (formatString)
				coverVal = plugin.formatter.format(property, coverVal, formatString);

			const coverType = getCoverType(coverVal);

			let coverItem;

			if (coverType === CoverType.Pdf) {
				const relativePath = extractPdfPath(coverVal);
				if (relativePath) {
					const pdfCover = await renderPdfCover(relativePath, sourcePath, plugin);
					if (pdfCover)
						coverItem = pdfCover;
				}
			} else {
				if (coverType === CoverType.Url)
					coverVal = `![](${coverVal})`;
				if (coverType === CoverType.Wikilink)
					coverVal = `!${coverVal}`;

				const coverTemp = document.createElement("div");
				await MarkdownRenderer.render(plugin.app, coverVal, coverTemp, sourcePath, plugin);

				hookUpLinks(plugin.app, component, coverTemp, sourcePath);

				coverTemp.classList.add("pp-cover-image");
				coverItem = coverTemp;
			}

			if (coverItem){
				coverItem.setAttribute("data-property", coverVal);
				coverItem.classList.add("pp-cover-item");
				coverItems.push(coverItem);
			}
		}

		if (coverItems.length > 0) {
			coverDiv = document.createElement("div");
			coverDiv.classList.add("metadata-side-image");

			applyCoverCssClasses(frontmatter, coverDiv, plugin);

			for (const coverItem of coverItems)
				coverDiv.appendChild(coverItem);
		}
	}

	const oldCoverDiv = mdContainer.querySelector(".metadata-side-image");
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

function getCoverType(coverVal: string): CoverType{

	if(pdfRegex.test(coverVal))
		return CoverType.Pdf;

	if (urlRegex.test(coverVal))
		return CoverType.Url;

	if (wikiLinkRegex.test(coverVal))
		return CoverType.Wikilink

	return CoverType.Markdown;
}

function applyCoverCssClasses(
	frontmatter: FrontMatterCache,
	coverDiv: HTMLElement,
	plugin: PrettyPropertiesPlugin
) {
	const cssVal = frontmatter?.cssclasses;

	if (cssVal && (cssVal.includes("cover-vertical") || cssVal.includes("cover-vertical-cover")))
		coverDiv.classList.add("vertical-cover");
	else if (cssVal && cssVal.includes("cover-vertical-contain"))
		coverDiv.classList.add("vertical-contain");
	else if (cssVal && cssVal.includes("cover-horizontal-contain"))
		coverDiv.classList.add("horizontal-contain");
	else if (cssVal && (cssVal.includes("cover-horizontal") || cssVal.includes("cover-horizontal-cover")))
		coverDiv.classList.add("horizontal-cover");
	else if (cssVal && cssVal.includes("cover-square"))
		coverDiv.classList.add("square");
	else if (cssVal && cssVal.includes("cover-circle"))
		coverDiv.classList.add("circle");
	else if (cssVal && cssVal.includes("cover-initial-width-2"))
		coverDiv.classList.add("initial-2");
	else if (cssVal && cssVal.includes("cover-initial-width-3"))
		coverDiv.classList.add("initial-3");
	else
		coverDiv.classList.add("initial");

	if (cssVal && cssVal.includes("cover-top"))
		coverDiv.classList.add("top");
	else if (cssVal && cssVal.includes("cover-bottom"))
		coverDiv.classList.add("bottom");
	else if (cssVal && cssVal.includes("cover-right"))
		coverDiv.classList.add("right");
	else if (cssVal && cssVal.includes("cover-left"))
		coverDiv.classList.add("left");
	else
		coverDiv.classList.add(plugin.settings.coverPosition);
}

function extractPdfPath(valueStr: string): string | null {

	const pdfMatch = valueStr.match(pdfRegex);

	if (pdfMatch?.[2])// wiki-style: [[file.pdf]] / ![[file.pdf]]
		return pdfMatch[2];
	else if (pdfMatch?.[4])// markdown-style: [text](file.pdf) / ![text](file.pdf)
		return pdfMatch[4].replaceAll("%20", " ");

	return null;
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
      renderCover(view, contentEl, frontmatter, sourcePath, plugin)
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