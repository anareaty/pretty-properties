import {
	MarkdownView,
	FrontMatterCache,
	MarkdownRenderer,
	loadPdfJs,
	normalizePath,
	Component, setIcon,
	Menu
} from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";
import { hookUpLinks } from "../internalLinksUtils";
import {handleCoverMenu} from "../../menus/coverMenu";

enum CoverType {
	Pdf,
	Url,
	Wikilink,
	Markdown,
}

const pdfRegex = /^(\!)?(?:\[\[(.+\.pdf)\]\]|\[([^\]]*)\]\((.+\.pdf)\))$/;
const urlRegex = /^(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/i;
const localFileRegex = /^(file:\/\/\/\/.)[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/i;
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

	let coverDiv: HTMLDivElement | undefined;

	if (plugin.settings.enableCover) {
		const coverItems: HTMLElement[] = [];

		for (let i = 0; i < plugin.settings.coverProperties.length; i++) {
			const entry = plugin.settings.coverProperties[i];
			let propertyValue = getNestedProperty(frontmatter, entry.property);

			if (Array.isArray(propertyValue))
				propertyValue = propertyValue[0];
			if (!propertyValue)
				continue;

			let coverVal = propertyValue.toString();
			const formatString = entry.format;

			if (formatString)
				coverVal = plugin.formatter.format(entry.property, coverVal, formatString);

			const coverType = getCoverType(coverVal);

			let coverItem: HTMLElement | undefined;

			if (coverType === CoverType.Pdf) {
				const relativePath = extractPdfPath(coverVal);
				if (relativePath) {
					const pdfCover = await renderPdfCover(relativePath, sourcePath, plugin);
					if (pdfCover)
						coverItem = pdfCover;
				}
			} else {
				let renderValue = coverVal;

				if (coverType === CoverType.Url)
					coverVal = coverVal.replace(/(https:\/\/www\.youtube\.com\/watch\?v\=)(.*)/, "https://img.youtube.com/vi/$2/maxresdefault.jpg")
					renderValue = `![](${coverVal})`;
				if (coverType === CoverType.Wikilink)
					renderValue = `!${coverVal}`;

				const coverTemp = document.createElement("div");
				await MarkdownRenderer.render(plugin.app, renderValue, coverTemp, sourcePath, plugin);

				hookUpLinks(plugin.app, component, coverTemp, sourcePath);

				coverItem = styleCoverItem(coverTemp, component, plugin);
			}

			if (coverItem){
				coverItem.setAttribute("data-property", coverVal);
				coverItem.classList.add("pp-cover-item");
				coverItems.push(coverItem);
				break;
			}
		}

		if (coverItems.length > 0) {
			coverDiv = document.createElement("div");
			coverDiv.classList.add("metadata-side-image");

			applyCoverCssClasses(frontmatter, coverDiv, plugin);

			for (const coverItem of coverItems) {
				coverDiv.appendChild(coverItem);

				if (coverItem.classList.contains("pp-cover-img") || 
				coverItem.classList.contains("pp-cover-svg")) {
					coverDiv.classList.add("mode-image")
				} else if (coverItem.classList.contains("pp-pdf-cover-container")) {
					coverDiv.classList.add("mode-pdf")
				} else if (coverItem.classList.contains("pp-cover-markdown")) {
					coverDiv.classList.add("mode-markdown")
				} else if (coverItem.classList.contains("pp-cover-has-iframe")) {
					coverDiv.classList.add("mode-iframe")
				}

				
			}
				
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
};

function styleCoverItem(
	coverTemp: HTMLDivElement,
	component: Component,
	plugin: PrettyPropertiesPlugin
): HTMLElement {
	const img = coverTemp.querySelector("img");
	if (img instanceof HTMLImageElement) {
		img.classList.add("pp-cover-image");
		img.classList.add("pp-cover-img");
		return img;
	}

	const svg = coverTemp.querySelector("svg");
	if (svg instanceof SVGElement) {
		svg.classList.add("pp-cover-image");
		svg.classList.add("pp-cover-svg");
		return svg as unknown as HTMLElement;
	}

	const iframe = coverTemp.querySelector("iframe");
	if (iframe instanceof HTMLIFrameElement) {
		coverTemp.classList.add("pp-cover-image");
		addCoverMenuButton(component, coverTemp, plugin);
		return coverTemp;
	}

	coverTemp.classList.add("pp-cover-image");
	coverTemp.classList.add("pp-cover-markdown");
	return coverTemp;
}

function getCoverType(coverVal: string): CoverType{

	if(pdfRegex.test(coverVal))
		return CoverType.Pdf;

	if (urlRegex.test(coverVal) || localFileRegex.test(coverVal))
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
	const coverShapeVal = frontmatter?.cover_shape

	if (coverShapeVal)
		coverDiv.classList.add(coverShapeVal);
	else
		coverDiv.classList.add("initial");

	let coverPositionVal = frontmatter?.cover_position

	if (coverPositionVal)
		coverDiv.classList.add(coverPositionVal);
	else
		coverDiv.classList.add(plugin.settings.coverPosition)
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

function addCoverMenuButton(
	component: Component,
	coverItem: HTMLElement,
	plugin: PrettyPropertiesPlugin
) {
	const iframe = coverItem.querySelector("iframe");
	if (!(iframe instanceof HTMLIFrameElement))
		return;

	coverItem.classList.add("pp-cover-has-iframe");

	const button = document.createElement("div");
	button.classList.add("pp-cover-menu-button", "edit-block-button");

	setIcon(button, "code-2");

	const openMenu = (e: PointerEvent) => {
		e.preventDefault();
		e.stopPropagation();
		let menu = new Menu();
		//handleCoverMenu(menu, plugin);
		menu.showAtMouseEvent(e)
	};

	component.registerDomEvent(button, "contextmenu", openMenu);
	component.registerDomEvent(button, "click", openMenu);

	coverItem.appendChild(button);
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

	if (!contentEl) {
		contentEl = view.containerEl
	}



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
