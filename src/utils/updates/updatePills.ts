import { View, MarkdownView } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { createColorButton } from "src/menus/selectColorMenus";


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

    if (colorSettings) {
        let color = colorSettings[text]

        if (color) {
            if (colors.find(c => c == color)) {

				styleProps = {
					"--pp-color-rgb": "var(--color-" + color + "-rgb)"
				}

                colorClass = "theme-color"
            } else if (color == "none") {
                colorClass = "transparent-color"
            } else {
                let textLightness = getTextLightness(color)
                let hslString = color.h + " ," + color.s + "% ," + color.l + "%"
                let hslStringHover = color.h + " ," + color.s + "% ," + (color.l - 5) + "%"
                let hslStringText = color.h + " ," + color.s + "% ," + textLightness + "%"

				styleProps = {
					"--pp-background-hsl": hslString, 
                	"--pp-background-hover-hsl": hslStringHover,
                	"--pp-text-hsl": hslStringText
				}

                colorClass = "custom-color"
            }
        }
    }
    return {colorClass, styleProps}
}


export const setPillStyles = async (
	pill: HTMLElement,
	attributeName: string,
	value: string,
	type: string,
	plugin: PrettyPropertiesPlugin
) => {
	let colorClasses = ["theme-color", "custom-color", "transparent-color", "default-color"]
	
	pill.setAttribute(attributeName, value);
	let styles = generateInlineStyles(value, type, plugin)

	for (let className of colorClasses) {
		pill.classList.remove(className)
	}

	if (styles.colorClass) {
		pill.classList.add(styles.colorClass)
		pill.setCssProps(styles.styleProps)
	}
}


export const updatePill = async (pill: HTMLElement, propName: string, plugin: PrettyPropertiesPlugin) => {
	let content = pill.querySelector(".multi-select-pill-content");
    if (content instanceof HTMLElement) {
        let value = content.innerText;

        let attributeName = "data-property-pill-value"
        let type = "multiselect-pill"

        if (propName == "tags" || propName == "note.tags") {
            if (value.startsWith("#")) {value = value.replace("#", "")}
            attributeName = "data-tag-value"
            type = "tag"
        }

		setPillStyles(pill, attributeName, value, type, plugin)
    }
}



export const updateCardPill = async (pill: HTMLElement, propName: string, plugin: PrettyPropertiesPlugin) => {
	let value = pill.innerText

	if (propName == "note.tags") {
		value = value.replace("#", "")
		setPillStyles(pill, "data-tag-value", value, "tag", plugin)
	} else {
		setPillStyles(pill, "data-property-pill-value", value, "multiselect-pill", plugin)
	}
}


const updateLeafPills = async (view: View, plugin: PrettyPropertiesPlugin) => {

	let container = view.containerEl;
	let pills = container.querySelectorAll(".metadata-property:not([data-property-key='tags']) .multi-select-pill");
	let tagPills = container.querySelectorAll(".metadata-property[data-property-key='tags'] .multi-select-pill");

	let basePills = container.querySelectorAll(".bases-td:not([data-property='note.tags']) .multi-select-pill");
	let baseTagPills = container.querySelectorAll("[data-property='note.tags'] .multi-select-pill");

	let baseCardsPills = container.querySelectorAll(".bases-cards-property:not([data-property='note.tags']) .value-list-element");
	let baseCardsTagPills = container.querySelectorAll(".bases-cards-property[data-property='note.tags'] .value-list-element");


	let inlineTags = container.querySelectorAll("a.tag");
	let longtexts = container.querySelectorAll(".metadata-input-longtext");

	for (let pill of pills) {
		if (pill instanceof HTMLElement) {
			updatePill(pill, "multiselect-pill", plugin)
		}
	}

	for (let pill of tagPills) {
		if (pill instanceof HTMLElement) {
			updatePill(pill, "tags", plugin)
		}
	}

	for (let pill of basePills) {
		if (pill instanceof HTMLElement) {
			updatePill(pill, "multiselect-pill", plugin)
		}
	}

	for (let pill of baseTagPills) {
		if (pill instanceof HTMLElement) {
			updatePill(pill, "tags", plugin)
		}
	}

	for (let pill of baseCardsPills) {
		if (pill instanceof HTMLElement) {
			updateCardPill(pill, "multiselect-pill", plugin)
		}
	}


	for (let pill of baseCardsTagPills) {
		if (pill instanceof HTMLElement) {
			updateCardPill(pill, "note.tags", plugin)
		}
	}


	for (let tag of inlineTags) {
		if (tag instanceof HTMLElement) {
			let value = tag.innerText.replace("#", "")
			setPillStyles(tag, "data-tag-value", value, "tag", plugin)
		}
	}

	for (let pill of longtexts) {
		if (pill instanceof HTMLElement) {
			let value = pill.innerText
			if (value) {
				value = value.slice(0, 200).trim()
				setPillStyles(pill, "data-property-longtext-value", value, "longtext", plugin)
			}

			let parent = pill.parentElement
			if (parent) {
				let existingColorButton = parent?.querySelector(".longtext-color-button")
				if (existingColorButton) {
					existingColorButton.remove()
					createColorButton(parent, value, plugin)
				} else {
					createColorButton(parent, value, plugin)
				}
			}
		}
	}
}


export const updateAllPills = async (plugin: PrettyPropertiesPlugin) => {

	plugin.app.workspace.iterateAllLeaves((leaf) => {
		let view = leaf.view
		let state = view.getState()

		// Update tags in source mode
		if (view instanceof MarkdownView && state.mode == "source") {
			// @ts-expect-error, not typed
            const editorView = view.editor.cm as EditorView;
            editorView.dispatch({
                userEvent: "updatePillColors"
            })
		}

		// Update property pills
		updateLeafPills(view, plugin)
	})

	/*
    let pillPaddingOptions = ["all", "none", "colored", "non-transparent"]
    for (let option of pillPaddingOptions) {
        document.body.classList.remove("pp-pill-padding-" + option)
    }
    document.body.classList.add("pp-pill-padding-" + plugin.settings.addPillPadding)

	*/
}

