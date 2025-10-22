import { MarkdownRenderer, MarkdownView } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { createColorButton } from "src/menus/selectColorMenus";
import { finishRenderMath, loadMathJax, renderMath } from "obsidian"


export const getTextLightness = (color: any) => {
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
    let colorSettings: any
    let colorClass = ""
	let textColorClass = "";
	let styleProps: any = {}

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
	
		  if (color) {
			if (colors.find((c) => c == color)) {
			  styleProps = {
				"--pp-color-rgb": "var(--color-" + color + "-rgb)"
			  };
			  colorClass = "theme-color";
			} else if (color == "none") {
			  colorClass = "transparent-color";
			} else {
			  let textLightness = getTextLightness(color);
			  let hslString = color.h + " ," + color.s + "% ," + color.l + "%";
			  let hslStringHover = color.h + " ," + color.s + "% ," + (color.l - 5) + "%";
			  let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%";
			  styleProps = {
				"--pp-background-hsl": hslString,
				"--pp-background-hover-hsl": hslStringHover,
				"--pp-text-hsl": hslStringText
			  };
			  colorClass = "custom-color";
			}
		  }
	
	
		  if (textColor) {
			if (colors.find((c) => c == textColor)) {
			  styleProps["--pp-text-rgb"] = "var(--color-" + textColor + "-rgb)"
			  textColorClass = "theme-text-color";
			  
			} else if (textColor == "none") {
			  textColorClass = "none-text-color";
			} else if (textColor != "default") {
			  let hslStringText = textColor.h + " ," + textColor.s + "% ," + textColor.l + "%";
			  styleProps["--pp-text-hsl"] = hslStringText
			  textColorClass = "custom-text-color";
			}
		  }
	
	
	
		}
	  }
	
	
	  return { colorClass, textColorClass, styleProps };
}


export const setPillStyles = async (
	pill: HTMLElement,
	attributeName: string,
	value: string,
	type: string,
	plugin: PrettyPropertiesPlugin
) => {
	let colorClasses = ["theme-color", "custom-color", "transparent-color", "default-color", "theme-text-color", "custom-text-color", "none-text-color", "default-text-color"];
	
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
}






export const updateMultiselectPill = async (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {
	if (plugin.settings.enableColoredProperties) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content instanceof HTMLElement) {
			let value = content.innerText;
			setPillStyles(pill, "data-property-pill-value", value, "multiselect-pill", plugin);
		}
	}
}


export const updateValueListElement = async (pill: HTMLElement, dataValueString: string, styleType: string, plugin: PrettyPropertiesPlugin) => {
	if (plugin.settings.enableColoredProperties) {
		let value = pill.innerText;
		setPillStyles(pill, dataValueString, value, styleType, plugin);
	}
}


export const updateTagPill = async (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {
	if (plugin.settings.enableColoredProperties) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content instanceof HTMLElement) {
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
	(isBase && plugin.settings.enableBases && plugin.settings.enableColoredProperties)) {
		setPillStyles(tag, "data-tag-value", value, "tag", plugin)
	}
}







const updateColorButton = async(parent: HTMLElement, value:string, isBase: boolean | undefined, plugin:PrettyPropertiesPlugin) => {
	if (!isBase || plugin.settings.enableColorButtonInBases) {
		if (parent) {
			createColorButton(parent, value, plugin)
		}
	}
}


export const updateLongtext = async (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {

	if (plugin.settings.enableColoredProperties || plugin.settings.enableMath /* || plugin.settings.enableMarkdown */) {
		let parent = pill.parentElement
		let isBase = parent?.classList.contains("bases-table-cell") 

		let existingColorButton = parent?.querySelector(".longtext-color-button")
		existingColorButton?.remove()

		if (isBase && !plugin.settings.enableBases) {
			return
		}

		let text = pill.innerText

		let propEl = parent?.parentElement
		let existingMathWrapper = propEl?.querySelector(".math-wrapper")
		//let existingMdWrapper = propEl?.querySelector(".md-wrapper")
		let match: any


		

		if (plugin.settings.enableMath) {

			

			//@ts-ignore
			if (!window.MathJax) {
				await loadMathJax()
			}


			match = text?.match(/^(\$\$)(.+)(\$\$)$/)
			if (!match) {
				match = text?.match(/^(\$)(.+)(\$)$/)
			}
		}

		if (match) {
			//render math

			let existingValue = existingMathWrapper?.getAttribute("data-math") || ""
			if (existingValue == text) { return }
			let formula = match[2]
			let symbols = match[1]
			existingMathWrapper?.remove()
			let display = false

			if (symbols == "$$") {
				display = true
			}
			
			let math = renderMath(formula, display)
			finishRenderMath()

			if (math) {
                propEl?.classList.add("has-math")
                let mathWrapper = document.createElement("div")
                mathWrapper.classList.add("math-wrapper")
                mathWrapper.setAttribute("data-math", text)
                mathWrapper.append(math)

				if (isBase) {
					propEl?.prepend(mathWrapper)
					mathWrapper.onclick = () => {
						pill.focus()
					}
				} else {
					let mathKeyEl = propEl?.querySelector(".metadata-property-key");
					mathKeyEl?.after(mathWrapper);
				}
            }

		
		/*

		// Wikilinks don't work if we render markdown this way
		
		} else if (plugin.settings.enableMarkdown) {

			let existingMdValue = existingMdWrapper?.getAttribute("data-md") || ""

			//if (existingMdValue == text) { return }

			existingMdWrapper?.remove()

			if (!text) return
			
			propEl?.classList.add("has-md")
			let mdWrapper = document.createElement("div")
			mdWrapper.classList.add("md-wrapper")
			mdWrapper.setAttribute("data-md", text)
			MarkdownRenderer.render(plugin.app, text, mdWrapper, "", plugin)

			if (isBase) {
				propEl?.prepend(mdWrapper)
				mdWrapper.onclick = () => {
					pill.focus()
				}
			} else {
				let mdKeyEl = propEl?.querySelector(".metadata-property-key");
				mdKeyEl?.after(mdWrapper);
			}



			if (plugin.settings.enableColoredProperties) {
				if (text) {
					text = text.slice(0, 200).trim()
				}
				setPillStyles(mdWrapper, "data-property-longtext-value", text, "longtext", plugin)				
				if (parent) {
					console.log("button")
					updateColorButton(parent, text, isBase, plugin)
				}
				
			}
	*/
		} else {
			
			existingMathWrapper?.remove()
			//existingMdWrapper?.remove()
			propEl?.classList.remove("has-math")
            //propEl?.classList.remove("has-md")

			if (plugin.settings.enableColoredProperties) {
				if (text) {
					text = text.slice(0, 200).trim()
				}
				setPillStyles(pill, "data-property-longtext-value", text, "longtext", plugin)
				if (parent) {
					updateColorButton(parent, text, isBase, plugin)
				}
				
			}

		}
	}
}


export const updateCardLongtext = async (pill: HTMLElement, plugin: PrettyPropertiesPlugin) => {

	if (plugin.settings.enableBases && (plugin.settings.enableColoredProperties || plugin.settings.enableMath)) {
		let parent = pill.parentElement
		let prop = parent?.getAttribute("data-property") || ""
		prop = prop.replace(/^note\./, "")
		//@ts-ignore
		let properties = plugin.app.metadataTypeManager.getAllProperties()
		//let type = properties[prop]?.widget || properties[prop]?.type;
		//if (type != "text") return
		
		let text = pill.innerText

		let propEl = parent
		let existingMathWrapper = propEl?.querySelector(".math-wrapper")
		let match: any

		if (plugin.settings.enableMath) {
			match = text?.match(/^(\$\$)(.+)(\$\$)$/)
			if (!match) {
				match = text?.match(/^(\$)(.+)(\$)$/)
			}
		}

		if (match) {
			//render math
			let existingValue = existingMathWrapper?.getAttribute("data-math") || ""
			if (existingValue == text) { return }
			let formula = match[2]
			let symbols = match[1]
			existingMathWrapper?.remove()
			let display = false			
			let math = renderMath(formula, display)
			finishRenderMath()

			if (math) {
                propEl?.classList.add("has-math")
                let mathWrapper = document.createElement("div")
                mathWrapper.classList.add("math-wrapper")
                mathWrapper.setAttribute("data-math", text)
                mathWrapper.append(math)
				propEl?.append(mathWrapper)
            }
		} else {
			
			existingMathWrapper?.remove()
            propEl?.classList.remove("has-math")

			if (plugin.settings.enableColoredProperties) {
				if (text) {
					text = text.slice(0, 200).trim()
				}
				setPillStyles(pill, "data-property-longtext-value", text, "longtext", plugin)
			}
		}

	}
}





export const updateLongTexts = async (container: HTMLElement, plugin: PrettyPropertiesPlugin) => {

	
	let longtexts = container.querySelectorAll(".metadata-input-longtext");
	
	for (let pill of longtexts) {
		if (pill instanceof HTMLElement) {
			updateLongtext(pill, plugin)
		}
	}

	let cardsLongtexts = container.querySelectorAll(".bases-cards-line:not(:has(*))")

	for (let pill of cardsLongtexts) {
		if (pill instanceof HTMLElement) {
			updateCardLongtext(pill, plugin)
		}
	}

	let listLongtexts = container.querySelectorAll(".bases-list-property .bases-rendered-value[data-property-type='text']")

	for (let pill of listLongtexts) {
		if (pill instanceof HTMLElement) {
			updateCardLongtext(pill, plugin)
		}
	}
}


export const updateSettingPills = async (plugin: PrettyPropertiesPlugin) => {

	let pills = document.querySelectorAll(".setting-multi-select-pill");
	for (let pill of pills) {
	  if (pill instanceof HTMLElement) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content instanceof HTMLElement) {
			let text = content?.innerText
			setPillStyles(pill, "data-property-pill-value", text, "multiselect-pill", plugin)
		}
	  }
	}
  
	let tagPills = document.querySelectorAll(".setting-tag-pill");
	for (let pill of tagPills) {
	  if (pill instanceof HTMLElement) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content instanceof HTMLElement) {
			let text = content?.innerText
			setPillStyles(pill, "data-tag-value", text, "tag", plugin)
		}
		
	  }
	}
  
	let longtextPills = document.querySelectorAll(".setting-longtext-pill");
	for (let pill of longtextPills) {
	  if (pill instanceof HTMLElement) {
		let text = pill.innerText
		setPillStyles(pill, "data-property-longtext-value", text, "longtext", plugin);
	  }
	}
}






















export const updateTagPaneTags = async(container: HTMLElement, plugin: PrettyPropertiesPlugin) => {
    let tags = container.querySelectorAll(".tag-pane-tag span.tree-item-inner-text")
    for (let tag of tags) {
		if (tag instanceof HTMLElement) {
			let value = tag.innerText
			if (!plugin.settings.enableColoredTagsInTagPane) {
				value = ""
			}
			
			let parentTag = tag.previousSibling
			if (parentTag instanceof HTMLElement) {
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


export const updateTagPaneTagsAll = async (plugin: PrettyPropertiesPlugin) => {
	let leaves = plugin.app.workspace.getLeavesOfType("tag");
	for (let leaf of leaves) {
		let view = leaf.view
		let container = view.containerEl
		updateTagPaneTags(container, plugin)
	}
	
	
}

