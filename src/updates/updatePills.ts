import PrettyPropertiesPlugin from "src/main";
import { createColorButton } from "src/menus/selectColorMenus";
import { HSL } from "obsidian"
import { hideMetadataContainerIfAllPropertiesHidden } from "./updateHiddenProperties";
import { querySelectorsWithIframesForContainer } from "../utils/querySelectorsHelper";
import { getPropertyFormatObj, updatePropertyFormatting } from "./updatePropertyFormattings";
import { updateProgress } from "./updateProgress";


export const getTextLightness = (color: HSL) => {
	let textLightness = 30
	if (color.l < 80) textLightness = 20
	if (color.l < 70) textLightness = 10
	if (color.l < 60) textLightness = 5
	if (color.l < 50) textLightness = 95
	if (color.l < 40) textLightness = 90
	if (color.l < 30) textLightness = 80
	return textLightness
}


export const generateInlineStyles = (propName: string, propVal: string, plugin: PrettyPropertiesPlugin) => {
    let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
    
    let colorClass = ""
	let textColorClass = "";
	let styleProps: Record<string, string> = {}
	let colorSettings = plugin.settings.propertyColors[propName]

    if (colorSettings) {

		let colorSetting = colorSettings[propVal];

		if (colorSetting) {
	
		  let color = colorSetting.pillColor
		  let textColor = colorSetting.textColor
	
		  if (color && color != "default") {
			colorClass = "colored";

			if (colors.find((c) => c == color) && typeof color == "string") {
			  styleProps = {
				"--pp-color": "rgb(var(--color-" + color + "-rgb))",
				"--pp-bg": "rgba(var(--color-" + color + "-rgb), 0.15)",
				"--pp-bg-hov": "rgba(var(--color-" + color + "-rgb), 0.25)"
			  };
			} else if (color == "accent") {
			  styleProps = {
				"--pp-color": "var(--text-accent)",
				"--pp-bg": "hsla(var(--interactive-accent-hsl), 0.15)",
				"--pp-bg-hov": "hsla(var(--interactive-accent-hsl), 0.25)"
			  };
			} else if (color == "none") {
			  colorClass = "transparent-color"
			} else if (typeof color != "string") {
			  let textLightness = getTextLightness(color);
			  let hslString = color.h + " ," + color.s + "% ," + color.l + "%";
			  let hslStringHover = color.h + " ," + color.s + "% ," + (color.l - 5) + "%";
			  let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%";
			  styleProps = {
				"--pp-color": "hsl(" + hslStringText + ")",
				"--pp-bg": "hsl(" + hslString + ")",
				"--pp-bg-hov": "hsl(" + hslStringHover + ")"
			  };
			}
		  }
	
	
		  if (textColor && textColor != "default") {
			textColorClass = "text-colored";
			if (colors.find((c) => c == textColor) && typeof textColor == "string") {
			  styleProps["--pp-color"] = "rgb(var(--color-" + textColor + "-rgb))"
			  
			} else if (textColor == "accent") {
			  styleProps["--pp-color"] = "var(--text-accent)"
			} else if (textColor == "none") {
			  textColorClass = "none-text-color";
			} else if (typeof textColor != "string") {
			  let hslStringText = textColor.h + " ," + textColor.s + "% ," + textColor.l + "%";
			  styleProps["--pp-color"] = "hsl(" + hslStringText + ")"
			}
		  }
	
	
	
		}
	  }
	
	
	  return { colorClass, textColorClass, styleProps };
}


export const setPillStyles = (
	pill: HTMLElement,
	propName: string,
	propVal: string,
	plugin: PrettyPropertiesPlugin
) => {

	//console.log("set pill styles")

	


	let colorClasses = ["colored", "transparent-color", "text-colored", "none-text-color"];
	
	pill.removeAttribute("data-property-value")
	pill.removeAttribute("data-property-key")

	pill.setAttribute("data-property-value", propVal);
	pill.setAttribute("data-property-key", propName);
	
	
	let styles = generateInlineStyles(propName, propVal, plugin)



	for (let className of colorClasses) {
		pill.classList.remove(className)
		
	}

	if (styles.colorClass) {
		pill.classList.add(styles.colorClass)
	}

	if (styles.textColorClass) {
	  pill.classList.add(styles.textColorClass);
	}
  
	if (styles.colorClass || styles.textColorClass) {
		pill.setCssProps(styles.styleProps)
	} 


	if (pill.classList.contains("value-list-element")) {
		pill.classList.add("pp-value-list-element")
	}
}






export const updateMultiselectPill = (pill: HTMLElement, propName: string, plugin: PrettyPropertiesPlugin) => {



	if (plugin.settings.enableColoredProperties) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let value = content.innerText;
			setPillStyles(pill, propName, value, plugin);
		}
	}
}


export const updateValueListElement = (pill: HTMLElement, propName: string, styleType: string, plugin: PrettyPropertiesPlugin) => {

	
	if (plugin.settings.enableColoredProperties) {
		let value = pill.innerText;
		setPillStyles(pill, propName, value, plugin);
	}
}


export const updateTagPill = (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {

	//console.log("update tag pill")


	if (plugin.settings.enableColoredProperties) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let value = content.innerText;
			if (value.startsWith("#")) {
			value = value.replace("#", "");
			}
			setPillStyles(pill, "tags", value, plugin);
		}
	}
}


export const updateTag = (tag: HTMLElement, plugin: PrettyPropertiesPlugin) => {
	let value = tag.innerText.replace("#", "")

	if (plugin.settings.enableColoredProperties) {
		setPillStyles(tag, "tags", value, plugin)
	}
}







const updateColorButton = (parent: HTMLElement, propName: string, value:string, isBase: boolean | undefined, plugin:PrettyPropertiesPlugin) => {
	if (plugin.settings.enableColoredProperties) {
		if (parent) {
			createColorButton(parent, propName, value, plugin)
		}
	}
}


export const updateLongtext = (pill: HTMLElement, plugin: PrettyPropertiesPlugin, propName?: string) => {

	let parent = pill.parentElement
	if (!parent) return
	let grandParent = parent?.parentElement
	let text = pill.innerText

	if (text === "") {
		grandParent?.classList.add("is-empty")
	} else {
		grandParent?.classList.remove("is-empty")
	}
	

	//if (plugin.settings.enableColoredProperties || plugin.settings.enableMath) {
		
		let isBase = parent?.classList.contains("bases-table-cell") 

		let existingColorButton = parent?.querySelector(".longtext-color-button")
		existingColorButton?.remove()

		//let text = pill.innerText

		let propEl = parent?.parentElement
		//let propName = propEl?.getAttribute("data-property-key") || ""

		propName = propName || ""

		if (isBase) {
			propName = propEl?.getAttribute("data-property") || ""
			propName = propName.replace(/^note./, "")
		}

		let propertyFormatObj = getPropertyFormatObj(propName, text, plugin)


		let overlayElement
		if (grandParent) {

			overlayElement = updatePropertyFormatting(grandParent, propName, text, "text", propertyFormatObj.format, propertyFormatObj.textFormat, plugin)

			

			
		}

		if (plugin.settings.enableColoredProperties) {
			if (text) {
				text = text.slice(0, 200).trim()
			}

			setPillStyles(pill, propName, text, plugin)

			if (overlayElement) {
				setPillStyles(overlayElement, propName, text, plugin)
			}

			if (parent) {
				updateColorButton(parent, propName, text, isBase, plugin)
			}
		}

		

		
		



	//}


	
	
	let metadataContainer = pill.closest(".metadata-container")
	if (metadataContainer?.instanceOf(HTMLElement)) {
		hideMetadataContainerIfAllPropertiesHidden(metadataContainer, plugin)
	}
	
	
}


export const updateCardLongtext = (pill: HTMLElement, propName: string, plugin: PrettyPropertiesPlugin) => {



	if (plugin.settings.enableColoredProperties || plugin.settings.enableMath) {
		let text = pill.innerText

		/*
		if (plugin.settings.enableMath) {
			let match = text?.match(/^(\$\$)(.+)(\$\$)$/)
			if (!match) {
				match = text?.match(/^(\$)(.+)(\$)$/)
			}
		}
		*/

		if (plugin.settings.enableColoredProperties) {
			if (text) {
				text = text.slice(0, 200).trim()
			}
			setPillStyles(pill, propName, text, plugin)
		}

	}
}






export const updateLongTexts = (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {

	
	
	let longtexts = querySelectorsWithIframesForContainer(".metadata-input-longtext", container);

	
	for (let pill of longtexts) {
		if (pill?.instanceOf(HTMLElement)) {
			updateLongtext(pill, plugin)
		}
	}

	let cardsLongtexts = container.querySelectorAll(".bases-cards-line:not(:has(*))")

	

	for (let pill of cardsLongtexts) {
		if (pill?.instanceOf(HTMLElement)) {
			let propName = pill.getAttribute("data-property-key") || ""
			updateCardLongtext(pill, propName, plugin)
		}
	}

	let listLongtexts = container.querySelectorAll(".bases-list-property .bases-rendered-value[data-property-type='text']")

	for (let pill of listLongtexts) {
		if (pill?.instanceOf(HTMLElement)) {
			let propName = pill.getAttribute("data-property-key") || ""
			updateCardLongtext(pill, propName, plugin)
		}
	}
}


export const updateSettingPills = (plugin: PrettyPropertiesPlugin) => {

	let pills = document.querySelectorAll(".setting-multi-select-pill");
	for (let pill of pills) {
	  if (pill?.instanceOf(HTMLElement)) {
		let content = pill.querySelector(".multi-select-pill-content");
		let propName = pill.getAttribute("data-property-key") || ""
		if (content?.instanceOf(HTMLElement)) {
			let text = content?.innerText
			setPillStyles(pill, propName, text, plugin)
		}
	  }
	}
  
	let tagPills = document.querySelectorAll(".setting-tag-pill");
	for (let pill of tagPills) {
	  if (pill?.instanceOf(HTMLElement)) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let text = content?.innerText
			setPillStyles(pill, "tags", text, plugin)
		}
		
	  }
	}
  
	let longtextPills = document.querySelectorAll(".setting-longtext-pill");
	for (let pill of longtextPills) {
	  if (pill?.instanceOf(HTMLElement)) {
		let text = pill.innerText
		let propName = pill.getAttribute("data-property-key") || ""
		setPillStyles(pill, propName, text, plugin);
	  }
	}
}






















export const updateTagPaneTags = (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {



    let tags = container.querySelectorAll(".tag-pane-tag span.tree-item-inner-text")



    for (let tag of tags) {

		

		if (tag?.instanceOf(HTMLElement)) {
			let value = tag.innerText
			if (!plugin.settings.enableColoredProperties) {
				value = ""
			}
			
			let parentTag = tag.previousSibling
			if (parentTag?.instanceOf(HTMLElement)) {
				let parentValue = parentTag.innerText
				if (parentValue) {
					value = parentValue + value
					setPillStyles(parentTag, "tags", value, plugin);
				}
			}

			setPillStyles(tag, "tags", value, plugin);
		}
    }
}


export const updateTagPaneTagsAll = (plugin: PrettyPropertiesPlugin) => {
	let leaves = plugin.app.workspace.getLeavesOfType("tag");
	for (let leaf of leaves) {
		let view = leaf.view
		let container = view.containerEl
		updateTagPaneTags(container, plugin)
	}
	
	
}







export const updateNumberWidget = (propName: string, value: string, parent: HTMLElement, sourcePath: string, plugin: PrettyPropertiesPlugin) => {
	let propertyFormatObj = getPropertyFormatObj(propName, value, plugin)
	updateProgress(parent, plugin, sourcePath)
	updatePropertyFormatting(parent, propName, value, "number", propertyFormatObj.format, propertyFormatObj.textFormat, plugin)

	if (value === "") {
		parent.classList.add("is-empty")
	} else {
		parent.classList.remove("is-empty")
	}
}