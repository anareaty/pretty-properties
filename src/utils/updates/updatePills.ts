import { View } from "obsidian";
import PrettyPropertiesPlugin from "src/main";
import { createColorButton } from "src/menus/selectColorMenus";

export const addClassestoProperties = async (view: View, plugin: PrettyPropertiesPlugin) => {
	let container = view.containerEl;

	let pills = container.querySelectorAll(".multi-select-pill:not([data-property-pill-value])");

	let longtexts = container.querySelectorAll(".metadata-input-longtext");

	let formulaPills = container.querySelectorAll("[data-property='formula.tags'] .value-list-element:not([data-property-pill-value])");

	for (let pill of pills) {
		let content = pill.querySelector(".multi-select-pill-content");
		if (content instanceof HTMLElement) {
			let value = content.innerText;
			if (value.startsWith("#")) {value = value.replace("#", "")}
			pill.setAttribute("data-property-pill-value", value);
		}
	}

	for (let pill of longtexts) {
		if (pill instanceof HTMLElement) {
			let value = pill.innerText
			if (value) {
				value = value.slice(0, 200).trim()
				pill.setAttribute("data-property-longtext-value", value)
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

	for (let pill of formulaPills) {
		if (pill instanceof HTMLElement) {
			let value = pill.innerText;
			if (value.startsWith("#")) {value = value.replace("#", "")}
			pill.setAttribute("data-property-pill-value", value);
		}
	}
}