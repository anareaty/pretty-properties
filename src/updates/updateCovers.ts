import {
	MarkdownView,
	FrontMatterCache,
	Component, 
	MarkdownPreviewView,
	TFile
} from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../utils/propertyUtils";
import { CanvasView, EmbedMarkdownComponent, WidgetEditorView } from "@obsidian-typings/obsidian-public-latest";
import { getImageValue, renderImageFromValue } from "../utils/imageUtils";


interface EmbedMarkdownComponentExtended extends EmbedMarkdownComponent {
    containerEl: HTMLElement,
    previewMode: MarkdownPreviewView,
	file: TFile
}



export const renderCover = async (
	component: Component,
	contentEl: HTMLElement,
	frontmatter: FrontMatterCache,
	sourcePath: string,
	plugin: PrettyPropertiesPlugin
) => {

	//console.log("render cover")

	const mdContainer = contentEl.querySelector(".metadata-container");

	//console.log(contentEl)

	if (!(mdContainer?.instanceOf(HTMLElement))) return;

	let oldCoverDiv: Element | undefined
	let oldCoverDivs = mdContainer.querySelectorAll(".pp-cover");

	if (oldCoverDivs) {
      oldCoverDivs.forEach((div, i) => {
        if (i == 0) oldCoverDiv = div
        else div.remove()
      })
    } 


	if (!plugin.settings.enableCover) {
		oldCoverDiv?.remove();
		mdContainer.classList.remove("has-cover")
		return
	}

	let coverDiv: HTMLElement | undefined;
	let coverVal = ""

	for (let entry of plugin.settings.coverProperties) {
		let propertyValue = getNestedProperty(frontmatter, entry.property)
		if (propertyValue) {
			if (Array.isArray(propertyValue)) {
				propertyValue = propertyValue[0]
			}
			if (!propertyValue) continue
			coverVal = propertyValue.toString()

			const formatString = entry.format;
			if (formatString) {
				coverVal = plugin.formatter.format(entry.property, coverVal, formatString)
			}
			break
		}
	}

	coverVal = getImageValue(coverVal)

	if (coverVal) {
		coverDiv = await renderImageFromValue(coverVal, "cover", sourcePath, component, plugin)
	}
	
	if (coverDiv) {
		applyCoverCssClasses(frontmatter, coverDiv, mdContainer, contentEl, plugin);


		/* Remove all old covers again, because sometimes we get extra ones when the view is opened more then once */

		oldCoverDivs = mdContainer.querySelectorAll(".pp-cover");

		if (oldCoverDivs) {
			oldCoverDivs.forEach((div, i) => {
				if (i == 0) oldCoverDiv = div
				else div.remove()
			})
		} 

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






const  applyCoverCssClasses = (
	frontmatter: FrontMatterCache,
	coverDiv: HTMLElement,
	mdContainer: HTMLElement,
	contentEl: HTMLElement,
	plugin: PrettyPropertiesPlugin
) => {

	mdContainer.classList.add("has-cover")
	coverDiv.classList.add("pp-cover");


	if (contentEl.classList.contains("canvas-node-content")) {
		mdContainer.classList.add("in-canvas")
	} else if (contentEl.classList.contains("hover-popover")) {
		mdContainer.classList.add("in-popover")
	}

	let positionClasses = [
		"left", 
		"right", 
		"top", 
		"bottom"
	]

	let shapeClasses = [
		"initial",
		"initial-2",
		"initial-3",
		"vertical-cover",
		"vertical-contain",
		"horizontal-cover",
		"horizontal-contain",
		"square",
		"circle"
	]

	for (let cls of positionClasses) {
		mdContainer.classList.remove(cls)
	}

	for (let cls of shapeClasses) {
		mdContainer.classList.remove(cls)
	}

	let coverShapeVal = getNestedProperty(frontmatter, plugin.settings.coverShapeProperty)
	
	if (coverShapeVal && typeof coverShapeVal == "string" && shapeClasses.find(c => c == coverShapeVal)) {
		coverDiv.classList.add(coverShapeVal);
		mdContainer.classList.add(coverShapeVal);
	}
		
	else {
		coverDiv.classList.add("initial");
		mdContainer.classList.add("initial");
	}

	let coverPositionVal = getNestedProperty(frontmatter, plugin.settings.coverPositionProperty)

	if (coverPositionVal && typeof coverPositionVal == "string" && positionClasses.find(c => c == coverPositionVal)) {
		coverDiv.classList.add(coverPositionVal);
		mdContainer.classList.add(coverPositionVal);
	}
		
	else {
		coverDiv.classList.add(plugin.settings.coverPosition)
		mdContainer.classList.add(plugin.settings.coverPosition)
	}
}












export const updateCoverForView = (
    view: MarkdownView | WidgetEditorView | EmbedMarkdownComponentExtended,
    plugin: PrettyPropertiesPlugin
) => {



  let file = view.file
  if (file) {
    let cache = plugin.app.metadataCache.getFileCache(file);
    let frontmatter = cache?.frontmatter;
    let contentEl = view.containerEl;
    let sourcePath = view.file?.path || ""
    if (frontmatter) {
      void renderCover(view, contentEl, frontmatter, sourcePath, plugin)

	  if ("editMode" in view && view.editMode) {
        void renderCover(view.editMode, view.editMode.containerEl, frontmatter, sourcePath, plugin);
      }
    }
  }

}



export const updateAllCovers = (plugin: PrettyPropertiesPlugin) => {

	let mdLeaves = plugin.app.workspace.getLeavesOfType("markdown");
		for (let leaf of mdLeaves) {
		let view = leaf.view
		if (view instanceof MarkdownView) {
			updateCoverForView(view, plugin);
		} 
	}


	let canvasLeaves = plugin.app.workspace.getLeavesOfType("canvas");
	for (let leaf of canvasLeaves) {
		let view = leaf.view as CanvasView

		view.canvas?.nodes?.forEach(node => {
			let nodeView = node.child
			
			if (nodeView) {
				updateCoverForView(nodeView, plugin);
			}
		})
	}



}










