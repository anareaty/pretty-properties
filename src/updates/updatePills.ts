import PrettyPropertiesPlugin from "src/main";
import { createColorButton } from "src/menus/selectColorMenus";
import { HSL } from "obsidian"
import { hideMetadataContainerIfAllPropertiesHidden } from "./updateHiddenProperties";
import { querySelectorsWithIframesForContainer } from "../utils/querySelectorsHelper";
import { getPropertyFormatObj, updatePropertyFormatting } from "./updatePropertyFormattings";


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


export const generateInlineStyles = (text: string, type: string, plugin: PrettyPropertiesPlugin) => {
    let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
    let colorSettings
    let colorClass = ""
	let textColorClass = "";
	let styleProps: Record<string, string> = {}




	

    if (type == "tag") {
        colorSettings = plugin.settings.tagColors
    }

    if (type == "multiselect-pill") {
        colorSettings = plugin.settings.propertyPillColors
    }

    if (type == "longtext") {
        colorSettings = plugin.settings.propertyLongtextColors
    }

	if (type == "tag-pane-tag") {
		colorSettings = plugin.settings.tagColors
	}



    if (colorSettings) {

		

		let colorSetting = colorSettings[text];

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
	attributeName: string,
	value: string,
	type: string,
	plugin: PrettyPropertiesPlugin
) => {

	


	let colorClasses = ["colored", "transparent-color", "text-colored", "none-text-color"];
	
	pill.removeAttribute("data-property-pill-value")
	pill.removeAttribute("data-tag-value")
	pill.setAttribute(attributeName, value);
	
	
	let styles = generateInlineStyles(value, type, plugin)


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






export const updateMultiselectPill = (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {



	if (plugin.settings.enableColoredProperties) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let value = content.innerText;
			setPillStyles(pill, "data-property-pill-value", value, "multiselect-pill", plugin);
		}
	}
}


export const updateValueListElement = (pill: HTMLElement, dataValueString: string, styleType: string, plugin: PrettyPropertiesPlugin) => {

	
	if (plugin.settings.enableColoredProperties) {
		let value = pill.innerText;
		setPillStyles(pill, dataValueString, value, styleType, plugin);
	}
}


export const updateTagPill = (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {



	if (plugin.settings.enableColoredProperties) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let value = content.innerText;
			if (value.startsWith("#")) {
			value = value.replace("#", "");
			}
			setPillStyles(pill, "data-tag-value", value, "tag", plugin);
		}
	}
}


export const updateTag = (tag: HTMLElement, plugin: PrettyPropertiesPlugin) => {

	let value = tag.innerText.replace("#", "")
	let parent = tag.parentElement
	let isBase = parent?.classList.contains("value-list-element")

	if ((!isBase && plugin.settings.enableColoredInlineTags) || 
	(isBase && plugin.settings.enableColoredProperties)) {
		setPillStyles(tag, "data-tag-value", value, "tag", plugin)
	}
}







const updateColorButton = (parent: HTMLElement, value:string, isBase: boolean | undefined, plugin:PrettyPropertiesPlugin) => {
	if (!isBase || plugin.settings.enableColorButtonInBases) {
		if (parent) {
			createColorButton(parent, value, plugin)
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
	

	if (plugin.settings.enableColoredProperties || plugin.settings.enableMath) {
		
		let isBase = parent?.classList.contains("bases-table-cell") 

		let existingColorButton = parent?.querySelector(".longtext-color-button")
		existingColorButton?.remove()

		let text = pill.innerText

		let propEl = parent?.parentElement
		let propName = propEl?.getAttribute("data-property-key") || ""

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

			setPillStyles(pill, "data-property-longtext-value", text, "longtext", plugin)

			if (overlayElement) {
				setPillStyles(overlayElement, "data-property-longtext-value", text, "longtext", plugin)
			}

			if (parent) {
				updateColorButton(parent, text, isBase, plugin)
			}
		}

		

		
		



	}


	
	
	let metadataContainer = pill.closest(".metadata-container")
	if (metadataContainer?.instanceOf(HTMLElement)) {
		hideMetadataContainerIfAllPropertiesHidden(metadataContainer)
	}
	
	
}


export const updateCardLongtext = (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {

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
			setPillStyles(pill, "data-property-longtext-value", text, "longtext", plugin)
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
			updateCardLongtext(pill, plugin)
		}
	}

	let listLongtexts = container.querySelectorAll(".bases-list-property .bases-rendered-value[data-property-type='text']")

	for (let pill of listLongtexts) {
		if (pill?.instanceOf(HTMLElement)) {
			updateCardLongtext(pill, plugin)
		}
	}
}


export const updateSettingPills = (plugin: PrettyPropertiesPlugin) => {

	let pills = document.querySelectorAll(".setting-multi-select-pill");
	for (let pill of pills) {
	  if (pill?.instanceOf(HTMLElement)) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let text = content?.innerText
			setPillStyles(pill, "data-property-pill-value", text, "multiselect-pill", plugin)
		}
	  }
	}
  
	let tagPills = document.querySelectorAll(".setting-tag-pill");
	for (let pill of tagPills) {
	  if (pill?.instanceOf(HTMLElement)) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content?.instanceOf(HTMLElement)) {
			let text = content?.innerText
			setPillStyles(pill, "data-tag-value", text, "tag", plugin)
		}
		
	  }
	}
  
	let longtextPills = document.querySelectorAll(".setting-longtext-pill");
	for (let pill of longtextPills) {
	  if (pill?.instanceOf(HTMLElement)) {
		let text = pill.innerText
		setPillStyles(pill, "data-property-longtext-value", text, "longtext", plugin);
	  }
	}
}






















export const updateTagPaneTags = (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {



    let tags = container.querySelectorAll(".tag-pane-tag span.tree-item-inner-text")
    for (let tag of tags) {
		if (tag?.instanceOf(HTMLElement)) {
			let value = tag.innerText
			if (!plugin.settings.enableColoredTagsInTagPane) {
				value = ""
			}
			
			let parentTag = tag.previousSibling
			if (parentTag?.instanceOf(HTMLElement)) {
				let parentValue = parentTag.innerText
				if (parentValue) {
					value = parentValue + value
					setPillStyles(parentTag, "data-tag-value", value, "tag-pane-tag", plugin);
				}
			}

			setPillStyles(tag, "data-tag-value", value, "tag-pane-tag", plugin);
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

