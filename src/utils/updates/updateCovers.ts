import {
	MarkdownView,
	FrontMatterCache,
	Component, 
	MarkdownPreviewView,
	TFile
} from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { getNestedProperty } from "../propertyUtils";
import { EmbedMarkdownComponent, WidgetEditorView } from "@obsidian-typings/obsidian-public-latest";
import { renderImageFromValue } from "../imageUtils";


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

	const mdContainer = contentEl.querySelector(".metadata-container");
	
	if (!(mdContainer?.instanceOf(HTMLElement))) return;

	mdContainer.classList.remove("has-cover")

	let coverDiv: HTMLElement | undefined;

	if (plugin.settings.enableCover) {
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

		if (coverVal) {
			coverDiv = await renderImageFromValue(coverVal, "cover", sourcePath, component, plugin)
		}

		if (coverDiv) {
			coverDiv.classList.add("pp-cover");
			if (contentEl.classList.contains("canvas-node-content")) {
				coverDiv.classList.add("pp-canvas-cover")
			}
			applyCoverCssClasses(frontmatter, coverDiv, mdContainer, plugin);
		}
	}

	const oldCoverDiv = mdContainer.querySelector(".pp-cover");
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






const  applyCoverCssClasses = (
	frontmatter: FrontMatterCache,
	coverDiv: HTMLElement,
	mdContainer: HTMLElement,
	plugin: PrettyPropertiesPlugin
) => {

	mdContainer.classList.add("has-cover")

	let oldClasses = [
		"left", 
		"right", 
		"top", 
		"bottom",
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

	for (let cls of oldClasses) {
		mdContainer.classList.remove(cls)
	}


	let coverShapeVal = getNestedProperty(frontmatter, plugin.settings.coverShapeProperty)

	if (coverShapeVal && typeof coverShapeVal == "string") {
		coverDiv.classList.add(coverShapeVal);
		mdContainer.classList.add(coverShapeVal);
	}
		
	else {
		coverDiv.classList.add("initial");
		mdContainer.classList.add("initial");
	}
		

	let coverPositionVal = getNestedProperty(frontmatter, plugin.settings.coverPositionProperty)

	if (coverPositionVal && typeof coverPositionVal == "string") {
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










