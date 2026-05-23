import { Component, ImageValue, loadPdfJs, MarkdownRenderer, Menu, normalizePath, setIcon, TFile } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "./propertyUtils";
import { LocalImageSuggestModal } from "src/modals/localImageSuggestModal";
import { BannerPositionModal } from "src/modals/bannerPositionModal";
import { CoverShapeSuggestModal } from "src/modals/coverShapeSuggestModal";
import { CoverPositionSuggestModal } from "src/modals/coverPositionSuggestModal";
import { ImageSuggestModal } from "src/modals/imageSuggestModal";

const pdfRegex = /^(!)?(?:\[\[(.+\.pdf)\]\]|\[([^\]]*)\]\((.+\.pdf)\))$/;
const urlRegex = /^(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)$/i;
const localFileRegex = /^(file:\/\/\/\/.)[-a-zA-Z0-9@%._+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)$/i;
const wikiLinkRegex = /^\[\[.+?\]\]$/;



export const selectLocalImage = (propName: string, folder: string, shape: string, plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let formats = [
            "avif",
            "bmp",
            "gif",
            "jpeg",
            "jpg",
            "png",
            "svg",
            "webp",
        ];
        let files = plugin.app.vault.getFiles();
        files = files.filter((f: TFile) => formats.find((e) => e == f.extension));

        let imageFiles = files;
        if (folder) {
            imageFiles = files.filter((f) => {
                return (
                    f.parent!.path == folder ||
                    f.parent!.path.startsWith(folder + "/")
                );
            });
        }

        let imagePaths = imageFiles.map((f) => f.path);
        let imageNames = imageFiles.map((f) => f.basename);

        new LocalImageSuggestModal(
            plugin.app,
            plugin,
            propName,
            shape,
            imagePaths,
            imageNames
        ).open();
    }
}



export const selectBannerPosition = (plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile()
    let bannerPositionProperty = plugin.settings.bannerPositionProperty
    if (file instanceof TFile && bannerPositionProperty) {
        new BannerPositionModal(plugin.app, plugin, file, bannerPositionProperty).open()
    }
}



export const selectCoverShape = (plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        new CoverShapeSuggestModal(plugin, file).open();
    }
}



export const selectCoverPosition = (plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        new CoverPositionSuggestModal(plugin, file).open();
    }
}



export const getCurrentCoverProperty = (plugin: PrettyPropertiesPlugin) => {
    let propName: string | undefined;
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let cache = plugin.app.metadataCache.getFileCache(file);
        let frontmatter = cache!.frontmatter;
		const props = plugin.settings.coverProperties
			.map((c) => c.property)
			.filter((p) => p);

        for (let prop of props) {
            if (frontmatter && getNestedProperty(frontmatter, prop) !== undefined) {
                propName = prop;
                break;
            }
        }
    }
    return propName;
}



export const selectCoverImage = (plugin: PrettyPropertiesPlugin) => {
    let file = plugin.app.workspace.getActiveFile();
    if (file instanceof TFile) {
        let propName = getCurrentCoverProperty(plugin);
        if (!propName) propName = plugin.settings.coverProperties[0]?.property;
        if (propName) {
            new ImageSuggestModal(
                plugin.app, 
                plugin, 
                propName, 
                plugin.settings.coversFolder,
                "cover"
            ).open();
        }
    }
}







export const renderImageFromValue = async (
	value: string,  
    type: string,
	sourcePath: string, 
	component: Component, 
	plugin: PrettyPropertiesPlugin
) => {

    let imageMode = "mode-markdown"


	if(type == "cover" && pdfRegex.test(value)) {
		const relativePath = extractPdfPath(value);
		if (relativePath) {
			const pdfCover = await renderPdfCover(relativePath, sourcePath, plugin);
			if (pdfCover) {
                pdfCover.setAttribute("data-property", value)
                return createImageWrapper(pdfCover, value, "mode-pdf", type)
            }
		}
	} 
	
	else if (urlRegex.test(value) || localFileRegex.test(value)) {
		value = value.replace(/^(https:\/\/www\.youtube.com\/watch\?v=)(.*)/, "https://img.youtube.com/vi/$2/maxresdefault.jpg")
		value = `![](${value})`;
	} 
	
	else if (wikiLinkRegex.test(value)) {
		value = `!${value}`;
	} 
	
	const imageTemp = createDiv();
	await MarkdownRenderer.render(plugin.app, value, imageTemp, sourcePath, component);

    const img = imageTemp.querySelector("img");
	if (img instanceof HTMLImageElement) {
		img.classList.add("pp-image-img");
		return createImageWrapper(img, value, "mode-image", type)
	}

    if (type == "banner") return

    const svg = imageTemp.querySelector("svg");
	if (svg instanceof SVGElement) {
		svg.classList.add("pp-image-svg");
		return createImageWrapper(svg as any as HTMLElement, value, "mode-image", type)
	}

    if (type == "icon") return

    const iframe = imageTemp.querySelector("iframe");
	if (iframe instanceof HTMLIFrameElement) {
		imageTemp.classList.add("pp-image-iframe");
        addIframeMenuButton(imageTemp);
		return createImageWrapper(imageTemp, value, "mode-iframe", type)
	}

    imageTemp.classList.add("pp-image-markdown");
	return createImageWrapper(imageTemp, value, "mode-markdown", type)
}






const createImageWrapper = (imageItem: HTMLElement, value: string, imageMode: string, type: string) => {

    imageItem.setAttribute("data-property", value)
    imageItem.classList.add("pp-" + type + "-image");

    if (type == "icon") return imageItem

    let imageDiv = createDiv();
    imageDiv.appendChild(imageItem);
    imageDiv.classList.add("pp-" + type);
    imageDiv.classList.add(imageMode)
    imageDiv.setAttribute("data-value", value)

    return imageDiv
}











const extractPdfPath = (valueStr: string): string | null => {
    const pdfMatch = valueStr.match(pdfRegex);
    if (pdfMatch?.[2])// wiki-style: [[file.pdf]] / ![[file.pdf]]
        return pdfMatch[2];
    else if (pdfMatch?.[4])// markdown-style: [text](file.pdf) / ![text](file.pdf)
        return pdfMatch[4].replaceAll("%20", " ");
    return null;
}



const renderPdfCover = async (relativePath: string, sourcePath: string, plugin: PrettyPropertiesPlugin) => {

    let pdfPath = plugin.app.metadataCache.getFirstLinkpathDest(relativePath, sourcePath)?.path || ""
    if (!pdfPath) return

    let pdfjsLib = window.pdfjsLib
    if (!pdfjsLib) {
        await loadPdfJs()
		pdfjsLib = window.pdfjsLib
    }
    let canvas
    let pdf
    let path = plugin.app.vault.adapter.getResourcePath(normalizePath(pdfPath))

    try {
        pdf = await pdfjsLib.getDocument(path)?.promise
    } catch(err) {
		console.error(err)
        return
    }

    if (pdf) {
        let firstPage = await pdf.getPage(1)
        if (firstPage) {
            let viewport = firstPage.getViewport({scale: 1});
            canvas = createEl("canvas")
            canvas.classList.add("pp-pdf-cover-canvas")
            canvas.classList.add("pp-cover-image")
            let context = canvas.getContext('2d')
            canvas.width = viewport.width
            canvas.height = viewport.height
			if (context) {
				firstPage.render({
					canvasContext: context,
					viewport: viewport
            	});
			}

            let pdfContainer = createDiv()
            pdfContainer.classList.add("pp-pdf-cover-container")
            pdfContainer.append(canvas)
            return pdfContainer
        }
    }
    return
}




const addIframeMenuButton = (
    coverItem: HTMLElement
) => {
    coverItem.classList.add("pp-cover-has-iframe");

    const menuButton = createEl("button");
    menuButton.classList.add("pp-cover-menu-button", "edit-block-button");
    setIcon(menuButton, "code-2");

    menuButton.onclick = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let menu = new Menu();
        menu.showAtMouseEvent(e)
    };

    coverItem.appendChild(menuButton);
}